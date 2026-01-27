# backend/schemas.py
from pydantic import BaseModel
from typing import List, Optional

# --- Household Schemas ---
class HouseholdBase(BaseModel):
    name: str

class HouseholdCreate(HouseholdBase):
    pass

class Household(HouseholdBase):
    id: int
    join_code: str
    
    class Config:
        orm_mode = True

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    status: str
    household_id: Optional[int] = None
    
    class Config:
        orm_mode = True

# backend/schemas.py (Append to the end)

class ExpenseBase(BaseModel):
    title: str
    amount: float

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    payer_id: int
    household_id: int
    
    # We will include the payer's name to show "Paid by Amit"
    payer: Optional[UserBase] = None

    class Config:
        orm_mode = True

class ChoreBase(BaseModel):
    title: str
    points: int = 10

class ChoreCreate(ChoreBase):
    pass

class Chore(ChoreBase):
    id: int
    is_completed: bool
    household_id: int
    assignee_id: Optional[int] = None
    
    # We include user info to show who is assigned (optional for now)
    assignee: Optional[UserBase] = None

    class Config:
        orm_mode = True