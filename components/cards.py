import streamlit as st


# ---------------------------------------------------
# METRIC CARD
# ---------------------------------------------------

def metric_card(

    container,

    title,

    value,

    icon

):

    with container:

        st.markdown(

            f"""

            <div class="metric-card">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:16px;
                ">

                    <div style="
                        font-size:15px;
                        color:#64748B;
                        font-weight:600;
                    ">
                        {title}
                    </div>

                    <div style="
                        font-size:28px;
                    ">
                        {icon}
                    </div>

                </div>

                <div style="
                    font-size:34px;
                    font-weight:800;
                    color:#0F172A;
                ">
                    {value}
                </div>

            </div>

            """,

            unsafe_allow_html=True

        )


# ---------------------------------------------------
# INFO ROW
# ---------------------------------------------------

def info_row(label, value):

    st.markdown(

        f"""

        <div style="
            display:flex;
            justify-content:space-between;
            padding:12px 0;
            border-bottom:
                1px solid #E2E8F0;
        ">

            <div style="
                color:#64748B;
                font-weight:500;
            ">
                {label}
            </div>

            <div style="
                color:#0F172A;
                font-weight:700;
            ">
                {value}
            </div>

        </div>

        """,

        unsafe_allow_html=True

    )
