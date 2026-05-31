from config import (

    PRIMARY_COLOR,
    SECONDARY_COLOR,

    BACKGROUND_COLOR,
    CARD_COLOR,

    TEXT_PRIMARY,
    TEXT_SECONDARY,
    TEXT_LIGHT,

    BORDER_COLOR,

    CARD_SHADOW,

    SIDEBAR_GRADIENT,

    CARD_RADIUS,

    SIDEBAR_WIDTH

)


# ---------------------------------------------------
# GLOBAL CSS
# ---------------------------------------------------

GLOBAL_CSS = f"""

<style>

/* ---------------------------------------------------
MAIN APP
--------------------------------------------------- */

.stApp {{

    background: {BACKGROUND_COLOR};

    color: {TEXT_PRIMARY};

    font-family:
        "Inter",
        sans-serif;

}}

/* ---------------------------------------------------
SIDEBAR
--------------------------------------------------- */

[data-testid="stSidebar"] {{

    width:
        {SIDEBAR_WIDTH}px !important;

    background:
        {SIDEBAR_GRADIENT};

    border-right: none;

}}

[data-testid="stSidebar"] * {{

    color: {TEXT_LIGHT};

}}

/* ---------------------------------------------------
CONTENT AREA
--------------------------------------------------- */

.main .block-container {{

    padding-top: 2rem;

    padding-bottom: 2rem;

    padding-left: 2rem;

    padding-right: 2rem;

}}

/* ---------------------------------------------------
CARDS
--------------------------------------------------- */

.metric-card {{

    background: {CARD_COLOR};

    border-radius:
        {CARD_RADIUS}px;

    padding: 24px;

    border:
        1px solid {BORDER_COLOR};

    box-shadow:
        {CARD_SHADOW};

    transition:
        all 0.25s ease;

}}

.metric-card:hover {{

    transform:
        translateY(-2px);

}}

/* ---------------------------------------------------
BUTTONS
--------------------------------------------------- */

.stButton > button {{

    width: 100%;
    min-height: 52px;

    border: none;
    border-radius: 14px;

    padding: 14px 22px;

    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.3px;

    color: #FFFFFF !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.20);

    background: linear-gradient(
        135deg,
        #16A34A,
        #22C55E
    );

    box-shadow:
        0 10px 24px rgba(34,197,94,0.35);

    transition:
        all 0.25s ease;

    cursor: pointer;
}}

.stButton > button:hover {{

    transform: translateY(-2px);

    background: linear-gradient(
        135deg,
        #15803D,
        #16A34A
    );

    box-shadow:
        0 14px 32px rgba(34,197,94,0.45);

    opacity: 1;
}}

.stButton > button:active {{

    transform: translateY(0px);

    box-shadow:
        0 6px 16px rgba(34,197,94,0.30);
}}

.stButton > button:focus {{

    outline: none;
    box-shadow:
        0 0 0 3px rgba(34,197,94,0.20),
        0 10px 24px rgba(34,197,94,0.35);
}}

/* ---------------------------------------------------
INPUTS
--------------------------------------------------- */

.stTextInput input,
.stNumberInput input,
.stTextArea textarea,
.stSelectbox div[data-baseweb="select"] {{

    border-radius: 14px !important;

    border:
        1px solid {BORDER_COLOR} !important;

}}

/* ---------------------------------------------------
TABLES
--------------------------------------------------- */

[data-testid="stDataFrame"] {{

    border-radius: 18px;

    overflow: hidden;

    border:
        1px solid {BORDER_COLOR};

}}

/* ---------------------------------------------------
METRICS
--------------------------------------------------- */

[data-testid="metric-container"] {{

    background: white;

    border-radius: 18px;

    padding: 18px;

    border:
        1px solid {BORDER_COLOR};

    box-shadow:
        {CARD_SHADOW};

}}

/* ---------------------------------------------------
HEADINGS
--------------------------------------------------- */

h1, h2, h3 {{

    color: {TEXT_PRIMARY};

    font-weight: 800;

}}

p, span, label {{

    color: {TEXT_SECONDARY};

}}

/* ---------------------------------------------------
ALERTS
--------------------------------------------------- */

.stSuccess,
.stWarning,
.stError,
.stInfo {{

    border-radius: 14px;

}}

/* ---------------------------------------------------
HIDE STREAMLIT
--------------------------------------------------- */

#MainMenu {{

    visibility: hidden;

}}

footer {{

    visibility: hidden;

}}

header {{

    visibility: hidden;

}}

/* ---------------------------------------------------
SCROLLBAR
--------------------------------------------------- */

::-webkit-scrollbar {{

    width: 8px;

}}

::-webkit-scrollbar-thumb {{

    background: #CBD5E1;

    border-radius: 20px;

}}



/* ---------------------------------------------------
MOBILE RESPONSIVENESS
--------------------------------------------------- */

@media (max-width: 768px) {{
    .main .block-container {{
        padding-left: 1rem;
        padding-right: 1rem;
    }}
    .metric-card {{
        padding: 16px;
    }}
    .metric-card > div:last-child {{
        font-size: 24px !important;
    }}
}}

</style>

"""


# ---------------------------------------------------
# LOAD THEME
# ---------------------------------------------------

def load_theme():

    return GLOBAL_CSS
