# backend/crud.py
from sqlalchemy.orm import Session
import models, schemas
import random, string

# Helper to generate a random join code (e.g., "A7X2")
def generate_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))

# --- User Functions ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    # In a real app, we would hash the password here!
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(
        username=user.username, 
        email=user.email, 
        hashed_password=fake_hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Household Functions ---
def create_household(db: Session, household: schemas.HouseholdCreate):
    unique_code = generate_code()
    db_household = models.Household(name=household.name, join_code=unique_code)
    db.add(db_household)
    db.commit()
    db.refresh(db_household)
    return db_household

def get_household_by_code(db: Session, code: str):
    return db.query(models.Household).filter(models.Household.join_code == code).first()

def update_user_household(db: Session, user_id: int, household_id: int):
    # Find the user
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.household_id = household_id
        db.commit()
        db.refresh(db_user)
    return db_user

def create_expense(db: Session, expense: schemas.ExpenseCreate, user_id: int, household_id: int):
    db_expense = models.Expense(
        **expense.dict(),
        payer_id=user_id,
        household_id=household_id
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def get_household_expenses(db: Session, household_id: int):
    return db.query(models.Expense).filter(models.Expense.household_id == household_id).all()

def get_household(db: Session, household_id: int):
    return db.query(models.Household).filter(models.Household.id == household_id).first()

def create_chore(db: Session, chore: schemas.ChoreCreate, household_id: int):
    # We create it as unassigned (assignee_id=None) and incomplete by default
    db_chore = models.Chore(
        **chore.dict(),
        household_id=household_id,
        is_completed=False
    )
    db.add(db_chore)
    db.commit()
    db.refresh(db_chore)
    return db_chore

def get_household_chores(db: Session, household_id: int):
    # Return all chores for this house
    return db.query(models.Chore).filter(models.Chore.household_id == household_id).all()

def toggle_chore(db: Session, chore_id: int):
    # Find the chore
    chore = db.query(models.Chore).filter(models.Chore.id == chore_id).first()
    if chore:
        # Flip the status (True -> False, or False -> True)
        chore.is_completed = not chore.is_completed
        db.commit()
        db.refresh(chore)
    return chore

def update_user_status(db: Session, user_id: int, status: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.status = status
        db.commit()
        db.refresh(user)
    return user