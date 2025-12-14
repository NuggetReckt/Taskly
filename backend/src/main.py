from database import DatabaseHandler
from fastapi import FastAPI
from dotenv import dotenv_values

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
        print("Failed to connect to database. Aborting.")
        return
    print("Starting server...")


@app.get("/")
def get_root():
    return {"Version": app.version}


from routes.TestRoutes import router as test_router

app.include_router(test_router)
