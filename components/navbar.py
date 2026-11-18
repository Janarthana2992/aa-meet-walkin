import base64

import streamlit as st

from config import EVENT_NAME, LOGO_PATH, SHORT_ORGANIZATION_NAME


PRIMARY_PAGES = [
    "Dashboard",
    "Walk-In Registration",
    "Search & Check-In",
    "Analytics",
]
MORE_PAGES = ["More", "Import Data", "Export Data", "Admin Tools"]


def get_base64_image(image_path):
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode()
    except Exception:
        return None


def render_navbar(username="Admin"):
    """Render the shared top header and compact event navigation."""
    if "selected_page" not in st.session_state:
        st.session_state.selected_page = "Dashboard"
    if "more_navigation" not in st.session_state:
        st.session_state.more_navigation = "More"

    logo_base64 = get_base64_image(LOGO_PATH)
    logo_html = ""
    if logo_base64:
        logo_html = (
            f'<img class="app-brand-logo" src="data:image/png;base64,{logo_base64}" '
            'alt="IRTTAA logo" />'
        )

    st.html(
        f"""
        <div class="app-topbar">
            <div class="app-brand">
                {logo_html}
                <div>
                    <div class="app-brand-name">{SHORT_ORGANIZATION_NAME}</div>
                    <div class="app-brand-event">{EVENT_NAME}</div>
                </div>
            </div>
            <div class="app-user">&#128100;&nbsp; {username}</div>
        </div>
        """
    )

    navigation, more, logout_column = st.columns([6.7, 1.45, 1.1])
    with navigation:
        nav_columns = st.columns(len(PRIMARY_PAGES))
        for column, page in zip(nav_columns, PRIMARY_PAGES):
            active = st.session_state.selected_page == page
            if column.button(
                page,
                key=f"top_nav_{page}",
                type="primary" if active else "secondary",
                use_container_width=True,
            ):
                st.session_state.selected_page = page
                st.session_state.more_navigation = "More"
                st.rerun()

    with more:
        selected_more = st.selectbox(
            "More pages",
            MORE_PAGES,
            label_visibility="collapsed",
            key="more_navigation",
        )
        if selected_more != "More" and selected_more != st.session_state.selected_page:
            st.session_state.selected_page = selected_more
            st.rerun()

    with logout_column:
        logout = st.button("Logout", key="top_nav_logout", use_container_width=True)

    st.html('<div class="top-nav-divider"></div>')
    return st.session_state.selected_page, logout