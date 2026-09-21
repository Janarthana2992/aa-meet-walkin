import base64
import os

from textwrap import dedent

import streamlit as st

from database import (
    DEFAULT_ADMIN,
    DEFAULT_PASSWORD
)

from config import (
    ACCENT_COLOR,
    BACKGROUND_COLOR,
    BORDER_COLOR,
    EVENT_NAME,
    LOGO_PATH,
    ORGANIZATION_NAME,
    PRIMARY_COLOR,
    SECONDARY_COLOR,
    SHORT_ORGANIZATION_NAME,
    TEXT_PRIMARY,
    TEXT_SECONDARY
)


# ---------------------------------------------------
# AUTH MANAGER
# ---------------------------------------------------

class AuthManager:

    def __init__(self, db):

        self.db = db

    # ---------------------------------------------------
    # DEFAULT USER
    # ---------------------------------------------------

    def ensure_default_user(self):

        if not self.db.user_exists(
            DEFAULT_ADMIN
        ):

            self.db.create_user(

                DEFAULT_ADMIN,

                DEFAULT_PASSWORD,

                role="admin"

            )

    # ---------------------------------------------------
    # LOGIN
    # ---------------------------------------------------

    def login(

        self,

        username,

        password

    ):

        if self.db.verify_user(

            username,

            password

        ):

            st.session_state.authenticated = True

            st.session_state.username = username

            st.session_state.role = (
                self.db.get_user(
                    username
                )["role"]
            )

            return True

        return False

    # ---------------------------------------------------
    # LOGOUT
    # ---------------------------------------------------

    def logout(self):

        for key in [

            "authenticated",

            "username",

            "role"

        ]:

            if key in st.session_state:

                del st.session_state[key]

    # ---------------------------------------------------
    # LOGIN PAGE
    # ---------------------------------------------------

    @staticmethod
    def _image_data_uri(image_path):

        try:

            with open(image_path, "rb") as image_file:

                encoded = base64.b64encode(
                    image_file.read()
                ).decode()

            extension = os.path.splitext(
                image_path
            )[1].lower()

            mime_type = "image/png"

            if extension == ".svg":

                mime_type = "image/svg+xml"

            elif extension in [".jpg", ".jpeg"]:

                mime_type = "image/jpeg"

            return f"data:{mime_type};base64,{encoded}"

        except Exception:

            return ""

    @staticmethod
    def _render_html(html_content):

        html_content = "\n".join(
            line.lstrip()
            for line in dedent(html_content).strip().splitlines()
        )

        st.html(html_content)

    def render_login(self):

        logo_src = self._image_data_uri(
            LOGO_PATH
        )

        logo_html = ""

        if logo_src:

            logo_html = (
                f'<img src="{logo_src}" '
                'class="login-brand-logo" '
                'alt="IRTTAA logo" />'
            )

        left_panel_html = f"""
        <div class="login-hero">
        <div class="login-kicker">
        IRTTAA Event Operations Platform
        </div>
        <div class="login-title">
        Premium check-in control for alumni meets.
        </div>
        <div class="login-copy">
        {ORGANIZATION_NAME}<br>
        {EVENT_NAME}
        </div>
        <div class="login-feature-panel">
        <div class="login-feature">
        <span>&#10003;</span>
        <strong>Fast Walk-In Registration</strong>
        </div>
        <div class="login-feature">
        <span>&#10003;</span>
        <strong>Secure Volunteer Access</strong>
        </div>
        <div class="login-feature">
        <span>&#10003;</span>
        <strong>QR Based Check-In</strong>
        </div>
        <div class="login-feature">
        <span>&#10003;</span>
        <strong>Real-Time Analytics</strong>
        </div>
        </div>
        </div>
        """

        self._render_html(

            f"""
            <style>
                [data-testid="stSidebar"] {{
                    display: none;
                }}

                [data-testid="collapsedControl"] {{
                    display: none;
                }}

                .main .block-container {{
                    max-width: 1280px;
                    padding-top: 1.35rem;
                    padding-bottom: 2rem;
                }}

                .stApp {{
                    background:
                        radial-gradient(
                            circle at top left,
                            rgba(245, 179, 1, 0.18),
                            transparent 28%
                        ),
                        linear-gradient(
                            135deg,
                            {BACKGROUND_COLOR} 0%,
                            #FFFFFF 38%,
                            #EAF1FF 100%
                        );
                }}

                .login-topbar {{
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 42px;
                }}

                .login-brand-logo {{
                    width: 54px;
                    height: 54px;
                    object-fit: contain;
                    border-radius: 16px;
                    background: rgba(255,255,255,0.88);
                    border: 1px solid rgba(255,255,255,0.72);
                    box-shadow: 0 14px 34px rgba(7, 27, 77, 0.14);
                }}

                .login-brand-name {{
                    color: {SECONDARY_COLOR};
                    font-size: 19px;
                    font-weight: 900;
                    letter-spacing: 0;
                    line-height: 1.1;
                }}

                .login-brand-subtitle {{
                    color: {TEXT_SECONDARY};
                    font-size: 13.5px;
                    font-weight: 700;
                    margin-top: 4px;
                }}

                .login-hero {{
                    padding-top: 20px;
                }}

                .login-kicker {{
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    border-radius: 999px;
                    background: rgba(22, 163, 74, 0.10);
                    border: 1px solid rgba(22, 163, 74, 0.16);
                    color: #15803D;
                    font-size: 13px;
                    font-weight: 900;
                    margin-bottom: 22px;
                }}

                .login-title {{
                    color: {TEXT_PRIMARY};
                    font-size: clamp(40px, 5vw, 64px);
                    line-height: 1.04;
                    font-weight: 950;
                    letter-spacing: 0;
                    max-width: 690px;
                    margin-bottom: 22px;
                }}

                .login-copy {{
                    color: {TEXT_SECONDARY};
                    font-size: 17px;
                    line-height: 1.72;
                    max-width: 620px;
                }}

                .login-feature-panel {{
                    margin-top: 36px;
                    max-width: 620px;
                    display: grid;
                    grid-template-columns: repeat(2, minmax(220px, 1fr));
                    gap: 16px;
                }}

                .login-feature {{
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    min-height: 66px;
                    padding: 16px 18px;
                    border-radius: 18px;
                    background: rgba(255, 255, 255, 0.76);
                    border: 1px solid rgba(226, 232, 240, 0.88);
                    box-shadow: 0 16px 42px rgba(15, 23, 42, 0.08);
                    backdrop-filter: blur(14px);
                }}

                .login-feature span {{
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    flex: 0 0 28px;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background:
                        linear-gradient(
                            135deg,
                            #16A34A,
                            #22C55E
                        );
                    color: white;
                    font-size: 15px;
                    font-weight: 950;
                    box-shadow: 0 10px 22px rgba(22, 163, 74, 0.28);
                }}

                .login-feature strong {{
                    color: {SECONDARY_COLOR};
                    font-size: 15px;
                    font-weight: 900;
                    line-height: 1.25;
                }}

                .login-card-copy {{
                    color: {TEXT_SECONDARY};
                    font-size: 15.5px;
                    line-height: 1.7;
                    margin-bottom: 26px;
                }}

                .login-card-title {{
                    color: {TEXT_PRIMARY};
                    font-size: 38px;
                    font-weight: 950;
                    line-height: 1.08;
                    margin-bottom: 8px;
                }}

                .login-card-subtitle {{
                    color: #15803D;
                    font-size: 14px;
                    font-weight: 900;
                    margin-bottom: 20px;
                }}

                [data-testid="stForm"] {{
                    background:
                        linear-gradient(
                            145deg,
                            rgba(255,255,255,0.88),
                            rgba(255,255,255,0.72)
                        );
                    border: 1px solid rgba(255,255,255,0.74);
                    border-radius: 30px;
                    padding: 40px 40px 34px;
                    box-shadow:
                        0 34px 90px rgba(7, 27, 77, 0.20),
                        0 8px 24px rgba(15, 23, 42, 0.06),
                        inset 0 1px 0 rgba(255,255,255,0.96);
                    backdrop-filter: blur(22px);
                }}

                [data-testid="stForm"] label {{
                    color: {TEXT_PRIMARY} !important;
                    font-weight: 850 !important;
                    font-size: 13px !important;
                }}

                [data-testid="stForm"] input {{
                    min-height: 52px;
                    border-radius: 16px !important;
                    border: 1px solid {BORDER_COLOR} !important;
                    background: #F8FAFC !important;
                }}

                [data-testid="stForm"] input:focus {{
                    border-color: #16A34A !important;
                    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.14) !important;
                }}

                [data-testid="stFormSubmitButton"] button {{
                    min-height: 52px;
                    border-radius: 17px;
                    font-size: 15px;
                    font-weight: 900;
                    color: #FFFFFF !important;
                    background:
                        linear-gradient(
                            135deg,
                            #16A34A,
                            #22C55E
                        );
                    border: 0;
                    box-shadow: 0 18px 34px rgba(22, 163, 74, 0.28);
                    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.18);
                }}

                [data-testid="stFormSubmitButton"] button:hover {{
                    color: #FFFFFF !important;
                    transform: translateY(-1px);
                    box-shadow: 0 22px 42px rgba(22, 163, 74, 0.34);
                }}

                [data-testid="stFormSubmitButton"] button:focus {{
                    color: #FFFFFF !important;
                }}

                .login-card-footer {{
                    color: {TEXT_SECONDARY};
                    text-align: center;
                    font-size: 13px;
                    font-weight: 800;
                    margin-top: 20px;
                }}

                .login-card-accent {{
                    height: 4px;
                    width: 72px;
                    border-radius: 99px;
                    background:
                        linear-gradient(
                            90deg,
                            {ACCENT_COLOR},
                            {PRIMARY_COLOR}
                        );
                    margin-bottom: 22px;
                }}

                @media (max-width: 900px) {{
                    .login-topbar {{
                        margin-bottom: 22px;
                    }}

                    .login-hero {{
                        padding-top: 0;
                    }}

                    .login-feature-panel {{
                        grid-template-columns: 1fr;
                    }}

                    [data-testid="stForm"] {{
                        padding: 30px 26px 26px;
                    }}
                }}
            </style>
            """,

        )

        self._render_html(

            f"""
            <div class="login-topbar">
                {logo_html}
                <div>
                    <div class="login-brand-name">
                        {SHORT_ORGANIZATION_NAME}
                    </div>
                    <div class="login-brand-subtitle">
                        {EVENT_NAME}
                    </div>
                </div>
            </div>
            """,

        )

        left, right = st.columns(
            [1.06, 0.94],
            gap="large"
        )

        # ---------------------------------------------------
        # LEFT
        # ---------------------------------------------------

        with left:

            self._render_html(
                left_panel_html
            )

        # ---------------------------------------------------
        # RIGHT
        # ---------------------------------------------------

        with right:

            self._render_html(
                '<div style="height: 26px;"></div>'
            )

            with st.form("login_form"):

                self._render_html(

                    f"""
                    <div class="login-card-accent"></div>
                    <div class="login-card-title">
                        Welcome back
                    </div>
                    <div class="login-card-subtitle">
                        Volunteer & Admin Access
                    </div>
                    <div class="login-card-copy">
                        Sign in to manage walk-in registrations,
                        check-ins, import records, and event analytics
                        for {EVENT_NAME}.
                    </div>
                    """,

                )

                username = st.text_input(

                    "Username",

                    value=os.getenv(

                        "ADMIN_USER",

                        "admin"

                    )

                )

                password = st.text_input(

                    "Password",

                    type="password"

                )

                submitted = st.form_submit_button(

                    "Access Platform"

                )

                if submitted:

                    if self.login(

                        username.strip(),

                        password.strip()

                    ):

                        st.success(

                            "Login successful"

                        )

                        st.rerun()

                    else:

                        st.error(

                            "Invalid username or password"

                        )

            self._render_html(

                """
                <div class="login-card-footer">
                    Powered by IRTTAA NuzhAI
                    Copyrights (c) IRTT Alumni Association Erode
                </div>
                """

            )
