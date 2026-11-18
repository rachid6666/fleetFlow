import os

SECRET_KEY = os.environ["SUPERSET_SECRET_KEY"]
SQLALCHEMY_DATABASE_URI = "sqlite:////app/superset_home/fleetflow.db"
FEATURE_FLAGS = {"EMBEDDED_SUPERSET": True}
THEME_DEFAULT = {
    "algorithm": "default",
    "token": {
        "colorPrimary": "#0F766E",
        "colorSuccess": "#16A34A",
        "colorWarning": "#D97706",
        "colorError": "#DC2626",
        "colorInfo": "#0891B2",
        "colorBgBase": "#F5F8F7",
        "colorBgContainer": "#FFFFFF",
        "colorTextBase": "#102A2A",
        "colorBorder": "#D8E4E1",
        "borderRadius": 10,
        "fontFamily": "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
}
THEME_DARK = None
EXTRA_CATEGORICAL_COLOR_SCHEMES = [{
    "id": "fleetflow",
    "description": "FleetFlow operational palette",
    "label": "FleetFlow",
    "colors": ["#0F766E", "#14B8A6", "#0891B2", "#2563EB", "#7C3AED", "#D97706", "#DC2626", "#64748B"],
}]
GUEST_ROLE_NAME = "Gamma"
GUEST_TOKEN_JWT_SECRET = os.environ["SUPERSET_SECRET_KEY"]
GUEST_TOKEN_JWT_EXP_SECONDS = 1800
WTF_CSRF_ENABLED = True
TALISMAN_ENABLED = True
TALISMAN_CONFIG = {
    "force_https": False,
    "frame_options": None,
    "content_security_policy": {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "blob:", "https:"],
        "worker-src": ["'self'", "blob:"],
        "connect-src": ["'self'", "https:"],
        "object-src": ["'none'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "script-src": ["'self'", "'strict-dynamic'"],
        "frame-ancestors": [os.environ.get("FLEETFLOW_ORIGIN", "http://localhost:3000")],
    },
    "content_security_policy_nonce_in": ["script-src"],
}
SESSION_COOKIE_SAMESITE = "Lax"
CACHE_CONFIG = {'CACHE_TYPE': 'FileSystemCache', 'CACHE_DIR': '/app/superset_home/cache', 'CACHE_DEFAULT_TIMEOUT': 300}
DATA_CACHE_CONFIG = {'CACHE_TYPE': 'FileSystemCache', 'CACHE_DIR': '/app/superset_home/cache', 'CACHE_DEFAULT_TIMEOUT': 300}
FILTER_STATE_CACHE_CONFIG = {'CACHE_TYPE': 'FileSystemCache', 'CACHE_DIR': '/app/superset_home/cache', 'CACHE_DEFAULT_TIMEOUT': 300}
SQLLAB_TIMEOUT = 60
ROW_LIMIT = 10000
