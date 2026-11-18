import streamlit as st

from components.cards import info_row, metric_card
from utils import dataframe_from_records


def render_dashboard_page(db):
    st.title("Dashboard")
    st.caption("Real-time alumni meet overview")

    metrics = db.get_metrics()
    recent_attendees = db.get_all_attendees(limit=10)
    df = dataframe_from_records(recent_attendees)

    total_registrations = metrics.get("total", 0)
    checked_in = metrics.get("checked_in", 0)
    walkins = metrics.get("walk_in", 0)
    pre_registered = metrics.get("pre_registered", 0)
    total_collection = metrics.get("paid", 0)
    total_membership = metrics.get("membership_total", 0)
    total_contribution = metrics.get("contribution_total", 0)

    st.markdown('<div class="dashboard-section-label">ATTENDANCE</div>', unsafe_allow_html=True)
    attendance_cards = st.columns(4)
    metric_card(attendance_cards[0], "Checked-In", checked_in, "?")
    metric_card(attendance_cards[1], "Walk-Ins", walkins, "+")
    metric_card(attendance_cards[2], "Pre-Registered", pre_registered, "")
    metric_card(attendance_cards[3], "Total Registrations", total_registrations, "#")

    st.markdown('<div class="dashboard-section-label collections-label">COLLECTIONS</div>', unsafe_allow_html=True)
    collection_cards = st.columns(3)
    metric_card(collection_cards[0], "Membership", f"Rs. {total_membership:,.0f}", "M")
    metric_card(collection_cards[1], "Contributions", f"Rs. {total_contribution:,.0f}", "C")
    metric_card(collection_cards[2], "Total Collection", f"Rs. {total_collection:,.0f}", "T")

    st.divider()
    left, right = st.columns([1.5, 1])

    with left, st.container(border=True):
        st.subheader("Recent Registrations")
        if not df.empty:
            display_columns = [
                column for column in [
                    "name", "mobile", "batch_year", "registration_type", "amount_paid"
                ] if column in df.columns
            ]
            st.dataframe(df[display_columns], use_container_width=True, hide_index=True)
        else:
            st.info("No registrations found.")

    with right, st.container(border=True):
        st.subheader("Event Status")
        percentage = int((checked_in / total_registrations) * 100) if total_registrations else 0
        st.progress(percentage / 100)
        st.markdown(f"**{percentage}% checked in**")
        st.divider()
        info_row("Total Attendees", total_registrations)
        info_row("Checked-In", checked_in)
        info_row("Pending", total_registrations - checked_in)
        info_row("Walk-Ins", walkins)