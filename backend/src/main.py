from database import DatabaseHandler
from fastapi import FastAPI, Request
from dotenv import dotenv_values
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

env = dotenv_values("resources/.env")
databaseHandler: DatabaseHandler = DatabaseHandler(env['DB_USERNAME'], env['DB_PASSWORD'], env['DB_HOST'], env['DB_DBNAME'])

app = FastAPI(title="Taskly API", description="API for the Taskly app", version="0.0.1")


@app.on_event("startup")
def on_startup():
    print("Connecting to database...")
    try:
        databaseHandler.connect()
        print("Database connected successfully")
    except Exception as e:
        print(f"Database connection failed: {e}")

    if not databaseHandler.is_connected():
        print("Not connected to database.")
    print("Starting server...")


@app.on_event("shutdown")
def on_shutdown():
    print("Disconnecting from database...")
    if databaseHandler.is_connected():
        databaseHandler.disconnect()


@app.get("/", include_in_schema=False)
def get_root():
    return {
        "version": app.version,
        "isConnectedToDB": databaseHandler.is_connected(),
        "message": "Welcome to the Taskly API"
    }


def get_database_handler():
    return databaseHandler


class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)

        if request.url.path.startswith("/docs") or request.url.path.startswith(
                "/openapi.json" or request.url.path.startswith("/favicon.ico")):
            return await call_next(request)
        api_key = request.headers.get("X-API-KEY")
        if not api_key or api_key != env['API_SECRET']:
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
