import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import alerts, checklist, districts, households

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Baadh Mitra API",
    description=(
        "Backend for Baadh Mitra, a volunteer flood-relay coordinator tool. "
        "Turns a flood alert into a prioritised, vulnerability-ranked "
        "door-to-door checklist. Portfolio project - not affiliated with Google."
    ),
    version="0.1.0",
)

# ALLOWED_ORIGINS is a comma-separated list, e.g.
# "https://baadh-mitra.vercel.app,http://localhost:5173"
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(districts.router)
app.include_router(households.router)
app.include_router(alerts.router)
app.include_router(checklist.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "baadh-mitra-api"}


@app.get("/health")
def health():
    return {"status": "healthy"}
