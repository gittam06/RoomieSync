# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

# Import our local files
import models, schemas, crud
from database import engine, get_db

# This command creates the database tables (users, households, etc.)
# if they don't exist yet.
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS CONFIGURATION ---
# This allows your React Frontend (running on port 5173) to talk to this Backend.
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROOT TEST ENDPOINT ---
@app.get("/")
def read_root():
    return {"message": "RoomieSync API is online and running!"}

# --- USER ENDPOINTS ---

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # This is used by the Login screen to find your user
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

# --- HOUSEHOLD ENDPOINTS (Updated for Phase 2.5) ---

@app.post("/households/create/{user_id}", response_model=schemas.Household)
def create_new_household(user_id: int, household: schemas.HouseholdCreate, db: Session = Depends(get_db)):
    """
    Creates a new household and immediately assigns the creator (user_id) to it.
    """
    # 1. Create the household in the DB
    new_house = crud.create_household(db=db, household=household)
    
    # 2. Update the user to belong to this new house
    updated_user = crud.update_user_household(db=db, user_id=user_id, household_id=new_house.id)
    
    if not updated_user:
         raise HTTPException(status_code=404, detail="User not found")
         
    return new_house

@app.post("/households/join/{user_id}")
def join_household(user_id: int, code: str, db: Session = Depends(get_db)):
    """
    Finds a household by its 'join_code' and adds the user to it.
    """
    # 1. Find the house by code
    house = crud.get_household_by_code(db, code=code)
    if not house:
        raise HTTPException(status_code=404, detail="Invalid Join Code. Household not found.")
    
    # 2. Add user to the house
    crud.update_user_household(db, user_id=user_id, household_id=house.id)
    
    return {
        "message": "Successfully joined household!",
        "household": house
    }

@app.post("/expenses/{user_id}/{household_id}", response_model=schemas.Expense)
def create_expense(user_id: int, household_id: int, expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    return crud.create_expense(db, expense=expense, user_id=user_id, household_id=household_id)

@app.get("/expenses/{household_id}", response_model=List[schemas.Expense])
def read_expenses(household_id: int, db: Session = Depends(get_db)):
    return crud.get_household_expenses(db, household_id=household_id)

@app.get("/households/{household_id}", response_model=schemas.Household)
def read_household(household_id: int, db: Session = Depends(get_db)):
    """
    Fetch details (Name, Join Code) of a specific household by ID.
    """
    db_household = crud.get_household(db, household_id=household_id)
    if db_household is None:
        raise HTTPException(status_code=404, detail="Household not found")
    return db_household

@app.post("/chores/{household_id}", response_model=schemas.Chore)
def create_chore(household_id: int, chore: schemas.ChoreCreate, db: Session = Depends(get_db)):
    return crud.create_chore(db, chore=chore, household_id=household_id)

@app.get("/chores/{household_id}", response_model=List[schemas.Chore])
def read_chores(household_id: int, db: Session = Depends(get_db)):
    return crud.get_household_chores(db, household_id=household_id)

@app.put("/chores/{chore_id}/toggle", response_model=schemas.Chore)
def toggle_chore_status(chore_id: int, db: Session = Depends(get_db)):
    # This toggles the chore status (Done / Not Done)
    return crud.toggle_chore(db, chore_id=chore_id)

@app.put("/users/{user_id}/status", response_model=schemas.User)
def update_status(user_id: int, status: str, db: Session = Depends(get_db)):
    return crud.update_user_status(db, user_id=user_id, status=status)