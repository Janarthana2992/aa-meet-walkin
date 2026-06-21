import streamlit as st
import pandas as pd
import plotly.express as px

from components.cards import metric_card


# ---------------------------------------------------
# DASHBOARD
# ---------------------------------------------------

def render_dashboard_page(db):

    # ---------------------------------------------------
    # TITLE
    # ---------------------------------------------------

    left, right = st.columns([2, 2])

    with left:

        st.title("Dashboard")

        st.caption(
            "Live overview of registrations and collections"
        )

    with right:

        c1, c2 = st.columns([4, 1])

        with c1:

            st.text_input(
                "",
                placeholder="🔍 Search name, phone, batch..."
            )

        with c2:

            st.button("Refresh")

    st.markdown("<br>", unsafe_allow_html=True)

    # ---------------------------------------------------
    # KPI CARDS
    # ---------------------------------------------------

    cols = st.columns(6)

    cards = [

        ("👥", "Total Registrations", "93", "↑ 12 today"),

        ("🧍", "Walk-Ins", "14", "↑ 5 today"),

        ("✅", "Checked-In", "42", "↑ 8 today"),

        ("💳", "Membership", "₹12K", "18 payments"),

        ("🎁", "Contribution", "₹5K", "17 payments"),

        ("💰", "Total Collection", "₹17K", "↑ 18%"),
    ]

    for col, card in zip(cols, cards):

        icon, title, value, trend = card

        with col:

            metric_card(
                title,
                value,
                icon,
                trend
            )

    st.markdown("<br>", unsafe_allow_html=True)

    # ---------------------------------------------------
    # CHART DATA
    # ---------------------------------------------------

    batch_df = pd.DataFrame({

        "Batch": [
            "2023",
            "2022",
            "2021",
            "2020",
            "2019",
            "2018",
            "2017"
        ],

        "Count": [
            15,
            10,
            8,
            5,
            4,
            3,
            2
        ]
    })

    dept_df = pd.DataFrame({

        "Department": [
            "ECE",
            "MECH",
            "CSE",
            "EEE",
            "AUTO",
            "IT"
        ],

        "Count": [
            22,
            18,
            15,
            12,
            8,
            5
        ]
    })

    # ---------------------------------------------------
    # CHARTS
    # ---------------------------------------------------

    left, right = st.columns(2)

    with left:

        st.subheader("📊 Batch Participation")

        fig = px.bar(
            batch_df,
            x="Batch",
            y="Count"
        )

        fig.update_layout(

            height=420,

            plot_bgcolor="white",

            paper_bgcolor="white",

            margin=dict(
                l=0,
                r=0,
                t=20,
                b=0
            ),

            showlegend=False,
        )

        st.plotly_chart(
            fig,
            use_container_width=True
        )

    with right:

        st.subheader("📈 Department Analytics")

        fig2 = px.bar(
            dept_df,
            x="Count",
            y="Department",
            orientation="h"
        )

        fig2.update_layout(

            height=420,

            plot_bgcolor="white",

            paper_bgcolor="white",

            margin=dict(
                l=0,
                r=0,
                t=20,
                b=0
            ),

            showlegend=False,
        )

        st.plotly_chart(
            fig2,
            use_container_width=True
        )

    st.markdown("<br>", unsafe_allow_html=True)

    # ---------------------------------------------------
    # LOWER SECTION
    # ---------------------------------------------------

    left, right = st.columns(2)

    # ---------------------------------------------------
    # RECENT CHECKINS
    # ---------------------------------------------------

    with left:

        st.subheader("✅ Recent Check-Ins")

        recent_df = pd.DataFrame({

            "Name": [
                "Rajkumar S",
                "Harish B",
                "Pavan K"
            ],

            "Batch": [
                2014,
                2011,
                2017
            ],

            "Department": [
                "EEE",
                "MECH",
                "CSE"
            ],

            "Status": [
                "Checked-In",
                "Checked-In",
                "Walk-In"
            ]
        })

        st.dataframe(
            recent_df,
            use_container_width=True,
            hide_index=True
        )

    # ---------------------------------------------------
    # LIVE FEED
    # ---------------------------------------------------

    with right:

        st.subheader("⚡ Live Activity Feed")

        activities = [

            "✅ Arun Kumar checked in",

            "📝 New walk-in added",

            "💰 ₹1,000 contribution received",

            "✅ Meena checked in",
        ]

        for item in activities:

