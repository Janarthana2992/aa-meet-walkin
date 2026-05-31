import os

from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client


PROJECT_ROOT = Path(__file__).resolve().parent
ENV_PATH = PROJECT_ROOT / ".env"
REQUIRED_ENV_VARS = ("SUPABASE_URL", "SUPABASE_KEY")


def load_project_env():
    """Load environment variables from the project root .env file."""
    load_dotenv(dotenv_path=ENV_PATH)


def get_missing_env_vars():
    return [
        name
        for name in REQUIRED_ENV_VARS
        if not os.getenv(name)
    ]


def get_config_error():
    missing = get_missing_env_vars()

    if missing:
        return (
            "Missing required environment variable(s): "
            f"{', '.join(missing)}. "
            f"Expected .env at: {ENV_PATH}"
        )

    return globals().get("SUPABASE_INIT_ERROR")


load_project_env()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_INIT_ERROR = get_config_error()
supabase = None

if not SUPABASE_INIT_ERROR:
    try:
        supabase = create_client(
            SUPABASE_URL,
            SUPABASE_KEY
        )
    except Exception as exc:
        SUPABASE_INIT_ERROR = (
            "Unable to initialize Supabase client: "
            f"{exc}"
        )
