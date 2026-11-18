import os
import tempfile
import unittest
from unittest.mock import patch

import pandas as pd

import database as database_module
from pages.import_data import get_department_short_name
from utils import (
    calculate_total_amount,
    dataframe_from_records,
    export_to_csv,
    export_to_excel,
    safe_float,
    safe_int,
)


class Response:
    def __init__(self, data=None):
        self.data = data or []


class FakeQuery:
    def __init__(self, client):
        self.client = client
        self.operations = []

    def select(self, value):
        self.operations.append(("select", value))
        return self

    def insert(self, value):
        self.client.inserted.append(value)
        self.operations.append(("insert", value))
        return self

    def update(self, value):
        self.client.updated.append(value)
        self.operations.append(("update", value))
        return self

    def delete(self):
        self.client.deleted = True
        self.operations.append(("delete", None))
        return self

    def eq(self, field, value):
        self.operations.append(("eq", field, value))
        return self

    def ilike(self, field, value):
        self.operations.append(("ilike", field, value))
        return self

    def order(self, field, desc=False):
        self.operations.append(("order", field, desc))
        return self

    def limit(self, value):
        self.operations.append(("limit", value))
        return self

    def range(self, start, end):
        self.operations.append(("range", start, end))
        return self

    def execute(self):
        self.client.queries.append(self)
        return Response(self.client.response_data)


class FakeSupabase:
    def __init__(self, response_data=None):
        self.response_data = response_data or []
        self.inserted = []
        self.updated = []
        self.deleted = False
        self.queries = []

    def table(self, name):
        self.table_name = name
        return FakeQuery(self)


class DatabaseTests(unittest.TestCase):
    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        self.old_db_path = database_module.DB_PATH
        self.old_supabase = database_module.supabase
        database_module.DB_PATH = os.path.join(self.tempdir.name, "test.db")
        self.client = FakeSupabase()
        database_module.supabase = self.client
        self.db = database_module.Database()

    def tearDown(self):
        self.db.close()
        database_module.DB_PATH = self.old_db_path
        database_module.supabase = self.old_supabase
        self.tempdir.cleanup()

    def test_user_lifecycle_and_password_verification(self):
        self.assertFalse(self.db.user_exists("volunteer"))
        self.db.create_user("volunteer", "secret", role="staff")
        self.assertTrue(self.db.user_exists("volunteer"))
        self.assertTrue(self.db.verify_user("volunteer", "secret"))
        self.assertFalse(self.db.verify_user("volunteer", "incorrect"))
        self.assertEqual(self.db.get_user("volunteer")["role"], "staff")

    def test_insert_preserves_provided_id_and_normalizes_numbers(self):
        self.assertTrue(self.db.insert_attendee({
            "attendee_id": "IRTTAA-TEST-1",
            "name": "Asha",
            "batch_year": "2020",
            "mobile": 9876543210,
            "family_members": "2",
            "amount_paid": "1500.5",
            "membership_amount": "1000",
            "contribution_amount": "500.5",
        }))
        payload = self.client.inserted[0]
        self.assertEqual(payload["attendee_id"], "IRTTAA-TEST-1")
        self.assertEqual(payload["batch_year"], 2020)
        self.assertEqual(payload["family_members"], 2)
        self.assertEqual(payload["amount_paid"], 1500.5)
        self.assertFalse(payload["checked_in"])

    def test_attendee_management_queries(self):
        self.client.response_data = [{"attendee_id": "IRTTAA-1", "name": "Asha"}]
        self.assertEqual(self.db.get_attendee(attendee_id="IRTTAA-1")["name"], "Asha")
        self.assertTrue(self.db.update_attendee("IRTTAA-1", {
            "name": "Asha Kumar", "unknown_field": "ignored",
        }))
        self.assertEqual(self.client.updated[-1], {"name": "Asha Kumar"})
        self.assertTrue(self.db.delete_attendee("IRTTAA-1"))
        self.assertTrue(self.client.deleted)

    def test_list_attendees_maps_admin_department_filter(self):
        self.client.response_data = [{"name": "Asha"}]
        attendees = self.db.list_attendees({
            "batch_year": "2020", "department": "CSE", "checked_in": 1,
        })
        self.assertEqual(attendees, [{"name": "Asha"}])
        operations = self.client.queries[-1].operations
        self.assertIn(("eq", "stream", "CSE"), operations)
        self.assertIn(("eq", "batch_year", "2020"), operations)
        self.assertIn(("eq", "checked_in", 1), operations)

    def test_metrics_and_analytics(self):
        attendees = [
            {"registration_type": "Walk-In", "amount_paid": "500", "membership_amount": 100,
             "contribution_amount": 400, "checked_in": True, "batch_year": 2020,
             "stream": "CSE", "created_at": "2026-09-26T10:00:00"},
            {"registration_type": "Pre-Registered", "amount_paid": None, "membership_amount": 0,
             "contribution_amount": 0, "checked_in": False, "batch_year": 2021,
             "stream": "ECE", "created_at": "2026-09-26T11:00:00"},
        ]
        with patch.object(self.db, "get_all_attendees", return_value=attendees):
            self.assertEqual(self.db.get_metrics(), {
                "total": 2, "walk_in": 1, "pre_registered": 1, "paid": 500.0,
                "membership_total": 100.0, "contribution_total": 400.0, "checked_in": 1,
            })
            self.assertCountEqual(self.db.analytics_by_batch(), [
                {"category": "2020", "count": 1}, {"category": "2021", "count": 1},
            ])
            self.assertCountEqual(self.db.analytics_by_department(), [
                {"category": "CSE", "count": 1}, {"category": "ECE", "count": 1},
            ])
            self.assertEqual(self.db.analytics_by_date(), [{"day": "2026-09-26", "count": 2}])


class UtilityTests(unittest.TestCase):
    def test_numeric_helpers(self):
        self.assertEqual(safe_float("12.5"), 12.5)
        self.assertEqual(safe_float("bad"), 0.0)
        self.assertEqual(safe_int("12"), 12)
        self.assertEqual(safe_int(None), 0)
        self.assertEqual(calculate_total_amount("500", 1000), 1500.0)

    def test_dataframe_and_exports(self):
        self.assertTrue(dataframe_from_records([]).empty)
        frame = dataframe_from_records([{"name": "Asha", "amount": 500}])
        self.assertIsInstance(frame, pd.DataFrame)
        self.assertIn(b"Asha", export_to_csv(frame))
        self.assertTrue(export_to_excel(frame).startswith(b"PK"))

    def test_department_short_names(self):
        self.assertEqual(get_department_short_name("Computer Science Engineering"), "CSE")
        self.assertEqual(get_department_short_name("  MCA "), "MCA")
        self.assertEqual(get_department_short_name("New Department"), "New Department")


if __name__ == "__main__":
    unittest.main()