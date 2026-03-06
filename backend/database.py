# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Use PostgreSQL in production (via DATABASE_URL env var), SQLite for local dev
DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # Render provides DATABASE_URL starting with "postgres://" but SQLAlchemy needs "postgresql://"
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)
else:
    # Local development fallback
    engine = create_engine(
        "sqlite:///./roomiesync.db",
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()