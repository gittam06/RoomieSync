# backend/schemas.py
from pydantic import BaseModel
from typing import List, Optional

# ... (Keep User schemas same) ...
class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    status: Optional[str] = "Online"
    avatar: Optional[str] = "😎"
    theme: Optional[str] = "dark"
    quiet_mode: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    household_id: Optional[int] = None
    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    old_password: Optional[str] = None
    new_password: Optional[str] = None
class UserUpdate(BaseModel):
    status: Optional[str] = None
    quiet_mode: Optional[bool] = None
    avatar: Optional[str] = None
    theme: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None

class PasswordReset(BaseModel):
    identifier: str  # username or email
    new_password: str

class ActivityLogCreate(BaseModel):
    household_id: int
    user: str
    action: str
    emoji: str
    time: str

# ==================== EXPENSE ====================
# ✅ NEW: Share Schema
class ExpenseShareBase(BaseModel):
    user_id: int
    amount: float
    is_paid: Optional[bool] = False

class ExpenseShare(ExpenseShareBase):
    id: int
    expense_id: int
    # We include debtor info so frontend can show names
    debtor: Optional[UserBase] = None 

    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    title: str
    amount: float
    is_settlement: Optional[bool] = False

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    payer_id: int
    household_id: int
    created_at: Optional[str] = ""
    payer: Optional[User] = None
    # ✅ Include shares list
    shares: List[ExpenseShare] = [] 

    class Config:
        from_attributes = True

# ... (Keep all other schemas exactly as they were - Chore, Grocery, Bill, etc) ...
# Just copy the rest of schemas.py from previous steps.
class ChoreBase(BaseModel):
    title: str
    points: int = 10
    due_date: Optional[str] = ""

class ChoreCreate(ChoreBase):
    assignee_id: Optional[int] = None

class Chore(ChoreBase):
    id: int
    is_completed: bool
    household_id: int
    assignee_id: Optional[int] = None
    completed_by_id: Optional[int] = None
    assignee: Optional[UserBase] = None
    class Config:
        from_attributes = True

class GroceryItemBase(BaseModel):
    title: str

class GroceryItemCreate(GroceryItemBase):
    pass

class GroceryItem(GroceryItemBase):
    id: int
    is_purchased: bool
    added_by_id: int
    household_id: int
    created_at: Optional[str] = ""
    added_by: Optional[UserBase] = None
    class Config:
        from_attributes = True

class ChatMessageBase(BaseModel):
    message: str
    is_announcement: Optional[bool] = False

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessage(ChatMessageBase):
    id: int
    sender_id: int
    household_id: int
    created_at: Optional[str] = ""
    sender: Optional[UserBase] = None
    class Config:
        from_attributes = True

class ComplaintBase(BaseModel):
    message: str
    is_anonymous: Optional[bool] = False

class ComplaintCreate(ComplaintBase):
    pass

class Complaint(ComplaintBase):
    id: int
    is_resolved: bool
    author_id: int
    household_id: int
    created_at: Optional[str] = ""
    author: Optional[UserBase] = None
    class Config:
        from_attributes = True

class PollOptionBase(BaseModel):
    option_text: str

class PollVoteOut(BaseModel):
    id: int
    option_id: int
    voter_id: int
    poll_id: int
    class Config:
        from_attributes = True

class PollOption(PollOptionBase):
    id: int
    poll_id: int
    votes: List[PollVoteOut] = []
    class Config:
        from_attributes = True

class PollBase(BaseModel):
    title: str
    poll_type: Optional[str] = "general"

class PollVoteCreate(BaseModel):
    option_id: int
    voter_id: int

class PollCreate(PollBase):
    options: List[str] = []

class Poll(PollBase):
    id: int
    is_active: bool
    created_by_id: int
    household_id: int
    created_at: Optional[str] = ""
    created_by: Optional[UserBase] = None
    options: List[PollOption] = []
    class Config:
        from_attributes = True

class BillPaymentBase(BaseModel):
    user_id: int
    amount: float
    is_paid: Optional[bool] = False

class BillPayment(BillPaymentBase):
    id: int
    bill_id: int
    user: Optional[UserBase] = None
    class Config:
        from_attributes = True

class BillBase(BaseModel):
    title: str
    amount: float
    due_date: Optional[str] = ""
    is_recurring: Optional[bool] = False
    frequency: Optional[str] = "monthly"
    is_paid: Optional[bool] = False

class BillCreate(BillBase):
    pass

class Bill(BillBase):
    id: int
    household_id: int
    created_at: Optional[str] = ""
    payments: List[BillPayment] = []
    class Config:
        from_attributes = True

class InventoryItemBase(BaseModel):
    name: str
    quantity: Optional[int] = 1
    unit: Optional[str] = "pcs"
    status: Optional[str] = "ok"

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    quantity: Optional[int] = None
    status: Optional[str] = None

class InventoryItem(InventoryItemBase):
    id: int
    household_id: int
    class Config:
        from_attributes = True

class HouseholdBase(BaseModel):
    name: str

class HouseholdCreate(HouseholdBase):
    pass

class Household(HouseholdBase):
    id: int
    join_code: str
    members: List[User] = []
    expenses: List[Expense] = []
    chores: List[Chore] = []
    class Config:
        from_attributes = True