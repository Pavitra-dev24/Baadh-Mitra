import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Render's Postgres add-on sets DATABASE_URL to a postgres:// URL. SQLAlchemy 1.4+
# needs the postgresql:// scheme, so we normalize it. Locally, with no DATABASE_URL
# set, we fall back to a SQLite file so the project runs with zero external setup.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./baadh_mitra.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
