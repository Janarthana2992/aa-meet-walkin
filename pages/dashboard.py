import streamlit as st
import pandas as pd

from utils import dataframe_from_records
from components.cards import metric_card, info_row



# ---------------------------------------------------
# DASHBOARD
# ---------------------------------------------------

def render_dashboard_page(db):

    # ---------------------------------------------------
    # TITLE
    # ---------------------------------------------------

    st.markdown(

        """
        <div style="
            margin-bottom:28px;
        ">

            <div style="
                font-size:38px;
                font-weight:800;
                color:#0F172A;
            ">
                Dashboard
            </div>

            <div style="
                font-size:17px;
                color:#64748B;
                margin-top:8px;
            ">
                Real-time alumni meet overview
            </div>

        </div>
        """,

        unsafe_allow_html=True

    )

    # ---------------------------------------------------
    # FETCH DATA
    # ---------------------------------------------------

    metrics = db.get_metrics()
    
    recent_attendees = db.get_all_attendees(limit=10)

    df = dataframe_from_records(recent_attendees)

    # ---------------------------------------------------
    # SAFE COUNTS
    # ---------------------------------------------------

    total_registrations = metrics.get("total", 0)

    checked_in = metrics.get("checked_in", 0)

    total_collection = metrics.get("paid", 0)

    walkins = metrics.get("walk_in", 0)

    pre_registered = metrics.get("pre_registered", 0)

    total_contribution = metrics.get("contribution_total", 0)

    total_membership = metrics.get("membership_total", 0)

    # ---------------------------------------------------
    # KPI CARDS
    # ---------------------------------------------------

    cards = st.columns(4)

    metric_card(

        cards[0],

        "Total Registrations",

        total_registrations,

        "👥"

    )

    metric_card(

        cards[1],

        "Checked-In",

        checked_in,

        "✅"

    )

    metric_card(

        cards[2],

        "Walk-Ins",

        walkins,

        "📝"

    )

    metric_card(

        cards[3],

        "Total Collection",

        f"₹{total_collection:,.0f}",

        "💰"

    )

    st.markdown("<br>", unsafe_allow_html=True)

    # ---------------------------------------------------
    # SECOND ROW
    # ---------------------------------------------------

    cards2 = st.columns(3)

    metric_card(

        cards2[0],

        "Pre-Registered",

        pre_registered,

        "🎟️"

    )

    metric_card(

        cards2[1],

        "Contribution",

        f"₹{total_contribution:,.0f}",

        "🤝"

    )

    metric_card(

        cards2[2],

        "Membership",

        f"₹{total_membership:,.0f}",

        "🏅"

    )

    st.markdown("<br>", unsafe_allow_html=True)

    # ---------------------------------------------------
    # TABLE SECTION
    # ---------------------------------------------------

    left, right = st.columns([1.5, 1])

    # ---------------------------------------------------
    # RECENT REGISTRATIONS
    # ---------------------------------------------------

    with left:

        st.markdown(

            """
            <div class="metric-card">

                <div style="
                    font-size:24px;
                    font-weight:700;
                    margin-bottom:20px;
                    color:#0F172A;
                ">
                    Recent Registrations
                </div>

            """,

            unsafe_allow_html=True

        )

        if not df.empty:

            display_columns = [

                col for col in [

                    "name",
                    "mobile",
                    "batch_year",
                    "registration_type",
                    "amount_paid"

                ]

                if col in df.columns

            ]

            st.dataframe(

                df[display_columns],

                use_container_width=True,

                hide_index=True

            )

        else:

            st.info(
                "No registrations found."
            )

        st.markdown(
            "</div>",
            unsafe_allow_html=True
        )

    # ---------------------------------------------------
    # LIVE STATUS
    # ---------------------------------------------------

    with right:

        st.markdown(

            """
            <div class="metric-card">

                <div style="
                    font-size:24px;
                    font-weight:700;
                    margin-bottom:20px;
                    color:#0F172A;
                ">
                    Event Status
                </div>

            """,

            unsafe_allow_html=True

        )

        percentage = 0

        if total_registrations > 0:

            percentage = int(

                (
                    checked_in
                    /
                    total_registrations
                )
                * 100
            )

        st.progress(

            percentage / 100

        )

        st.markdown(

            f"""

            <div style="
                margin-top:18px;
                font-size:18px;
                font-weight:700;
                color:#1E293B;
            ">
                {percentage}% Checked-In
            </div>

            """,

            unsafe_allow_html=True

        )

        st.markdown("<br>", unsafe_allow_html=True)

        info_row(

            "Total Attendees",

            total_registrations

        )

        info_row(

            "Checked-In",

            checked_in

        )

        info_row(

            "Pending",

            total_registrations
            -
            checked_in

        )

        info_row(

            "Walk-Ins",

            walkins

        )

        st.markdown(
            "</div>",
            unsafe_allow_html=True
        )


