# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Create the database URL (This will create a file named 'roomiesync.db')
SQLALCHEMY_DATABASE_URL = "sqlite:///./roomiesync.db"

# 2. Create the engine
# connect_args is needed only for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Create a SessionLocal class
# Each instance of this class will be a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Create a Base class
# All our database models (tables) will inherit from this
Base = declarative_base()

# 5. Dependency
# This helper function ensures we open a DB session, do our work, and close it
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()