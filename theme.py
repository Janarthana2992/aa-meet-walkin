from config import (
    ACCENT_COLOR, BACKGROUND_COLOR, BORDER_COLOR, CARD_COLOR, CARD_RADIUS,
    CARD_SHADOW, PRIMARY_COLOR, SECONDARY_COLOR, TEXT_LIGHT, TEXT_PRIMARY,
    TEXT_SECONDARY,
)

GLOBAL_CSS = f"""
<style>
.stApp {{ background: {BACKGROUND_COLOR}; color: {TEXT_PRIMARY}; font-family: "Inter", sans-serif; }}
[data-testid="stSidebar"] {{ display: none !important; }}
.main .block-container {{ max-width: 1440px; padding: 1.5rem 2rem 2.5rem; }}

.app-topbar {{
    display: flex; align-items: center; justify-content: space-between; gap: 20px;
    padding: 18px 24px; border-radius: 22px;
    background: linear-gradient(135deg, {SECONDARY_COLOR}, {PRIMARY_COLOR});
    box-shadow: 0 18px 42px rgba(15, 118, 110, .22);
}}
.app-brand {{ display: flex; align-items: center; gap: 14px; }}
.app-brand-logo {{ width: 48px; height: 48px; object-fit: cover; border-radius: 50%; border: 2px solid rgba(255,255,255,.34); }}
.app-brand-name {{ color: #FFFFFF; font-size: 26px; font-weight: 900; line-height: 1.1; }}
.app-brand-event {{ color: rgba(255,255,255,.78); font-size: 14px; margin-top: 4px; }}
.app-user {{ color: #FFFFFF; background: rgba(255,255,255,.14); padding: 10px 14px; border-radius: 12px; font-weight: 800; }}
.top-nav-divider {{ height: 1px; margin: 14px 0 26px; background: {BORDER_COLOR}; }}

.stButton > button {{
    min-height: 44px; border: 1px solid transparent; border-radius: 12px; padding: 9px 14px;
    font-size: 14px; font-weight: 750; color: #FFFFFF !important;
    background: linear-gradient(135deg, {PRIMARY_COLOR}, #14B8A6);
    box-shadow: 0 8px 18px rgba(13, 148, 136, .22); transition: all .2s ease;
}}
.stButton > button:hover {{ transform: translateY(-1px); background: linear-gradient(135deg, #115E59, {PRIMARY_COLOR}); box-shadow: 0 12px 24px rgba(13, 148, 136, .30); }}
/* Keep every button label readable, even when Streamlit nests it in spans or paragraphs. */
.stButton > button *,
[data-testid="stFormSubmitButton"] button *,
button[data-testid] * {{
    color: inherit !important;
    -webkit-text-fill-color: currentColor !important;
    opacity: 1 !important;
}}
.stButton > button[kind="primary"],
[data-testid="stFormSubmitButton"] button {{
    color: #FFFFFF !important;
    -webkit-text-fill-color: #FFFFFF !important;
}}
.stButton > button[kind="primary"] *,
[data-testid="stFormSubmitButton"] button * {{
    color: #FFFFFF !important;
    -webkit-text-fill-color: #FFFFFF !important;
}}
.stButton > button[kind="secondary"] {{ color: {SECONDARY_COLOR} !important; background: #FFFFFF; border-color: {BORDER_COLOR}; box-shadow: none; }}
.stButton > button[kind="secondary"]:hover {{ background: #CCFBF1; border-color: #5EEAD4; }}

.stSelectbox div[data-baseweb="select"], .stTextInput input, .stNumberInput input, .stTextArea textarea {{ border-radius: 12px !important; border: 1px solid {BORDER_COLOR} !important; }}
.metric-card {{ background: {CARD_COLOR}; border-radius: {CARD_RADIUS}px; padding: 22px; border: 1px solid {BORDER_COLOR}; box-shadow: {CARD_SHADOW}; transition: transform .2s ease; }}
.metric-card:hover {{ transform: translateY(-2px); }}
.dashboard-section-label {{ color: {PRIMARY_COLOR}; font-size: 12px; font-weight: 900; letter-spacing: .12em; margin: 24px 0 10px; }}
.collections-label {{ color: {ACCENT_COLOR}; }}
[data-testid="stDataFrame"], [data-testid="metric-container"] {{ border-radius: 16px; border: 1px solid {BORDER_COLOR}; overflow: hidden; }}
h1, h2, h3 {{ color: {SECONDARY_COLOR}; font-weight: 850; }}
p, span, label {{ color: {TEXT_SECONDARY}; }}
.stProgress > div > div > div > div {{ background-color: {ACCENT_COLOR}; }}
.stSuccess, .stWarning, .stError, .stInfo {{ border-radius: 14px; }}
#MainMenu, footer, header {{ visibility: hidden; }}
::-webkit-scrollbar {{ width: 8px; }}
::-webkit-scrollbar-thumb {{ background: #99D9D0; border-radius: 20px; }}
@media (max-width: 768px) {{
  .main .block-container {{ padding: 1rem; }}
  .app-topbar {{ align-items: flex-start; flex-direction: column; }}
  .app-brand-name {{ font-size: 21px; }}
  .metric-card {{ padding: 16px; }}
}}
</style>
"""


def load_theme():
    return GLOBAL_CSS