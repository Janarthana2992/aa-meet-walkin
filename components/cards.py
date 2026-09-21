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
        with st.container(border=True):
            st.caption(f"{icon}  {title}")
            st.subheader(str(value))


# ---------------------------------------------------
# INFO ROW
# ---------------------------------------------------

def info_row(label, value):
    label_column, value_column = st.columns([3, 1])
    label_column.write(label)
    value_column.markdown(f"**{value}**")
    st.divider()
