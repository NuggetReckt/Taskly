from typing import Optional

from database import DatabaseHandler
from fastapi import FastAPI, Request
from dotenv import dotenv_values
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

env = dotenv_values("resources/.env")
databaseHandler: Optional[DatabaseHandler] = None


def _build_database_handler_from_env() -> DatabaseHandler:
    user = env.get("DB_USERNAME")
    password = env.get("DB_PASSWORD")
    host = env.get("DB_HOST")
    dbname = env.get("DB_DBNAME")

    missing = [k for k, v in {
        "DB_USERNAME": user,
        "DB_PASSWORD": password,
        "DB_HOST": host,
        "DB_DBNAME": dbname,
    }.items() if not v]

    if missing:
        raise RuntimeError(
            "Missing database configuration keys in resources/.env: "
            + ", ".join(missing)
        )

    return DatabaseHandler(user, password, host, dbname)


app = FastAPI(title="Taskly API", description="API for the Taskly app", version="0.0.1")


@app.on_event("startup")
def on_startup():
    print("Connecting to database...")
    try:
        global databaseHandler
        if databaseHandler is None:
            databaseHandler = _build_database_handler_from_env()

        databaseHandler.connect()
        print("Database connected successfully")
    except Exception as e:
        print(f"Database connection failed: {e}")

    if databaseHandler is None or not databaseHandler.is_connected():
        print("Not connected to database.")


@app.on_event("shutdown")
def on_shutdown():
    print("Disconnecting from database...")
    if databaseHandler is not None and databaseHandler.is_connected():
        databaseHandler.disconnect()


@app.get("/", include_in_schema=False)
def get_root():
    return {
        "version": app.version,
        "isConnectedToDB": (databaseHandler is not None and databaseHandler.is_connected()),
        "message": "Welcome to the Taskly API"
    }


def get_database_handler():
    if databaseHandler is None:
        raise RuntimeError("Database handler is not initialized yet.")
    return databaseHandler


class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)

        if request.url.path.startswith("/docs") or request.url.path.startswith(
                "/openapi.json" or request.url.path.startswith("/favicon.ico")):
            return await call_next(request)

        if request.url.path == "/":
            return await call_next(request)

        api_key = request.headers.get("X-API-KEY")
        expected = env.get("API_SECRET")
        if not expected:
            return JSONResponse(
                status_code=500,
                content={"detail": "Server misconfigured: API_SECRET is missing"}
            )

        if not api_key or api_key != expected:
            return JSONResponse(
                status_code=403,
                content={"detail": "Forbidden: Invalid or missing API key"}
            )
        return await call_next(request)


app.add_middleware(APIKeyMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

from routes.BoardsRoutes import router as boards_routes
from routes.UsersRoutes import router as users_routes
from routes.AuthRoutes import router as auth_routes

app.include_router(boards_routes)
app.include_router(users_routes)
app.include_router(auth_routes)
