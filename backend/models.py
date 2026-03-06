# backend/models.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text
from sqlalchemy.orm import relationship
from database import Base

# ... (Keep User and Household classes SAME) ...
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    household_id = Column(Integer, ForeignKey("households.id"))
    status = Column(String, default="Online")
    avatar = Column(String, default="😎")
    theme = Column(String, default="dark")
    quiet_mode = Column(Boolean, default=False)

    household = relationship("Household", back_populates="members")
    expenses = relationship("Expense", back_populates="payer")
    # ✅ Add this reverse relationship
    expense_shares = relationship("ExpenseShare", back_populates="debtor")
    
    assigned_chores = relationship("Chore", back_populates="assignee", foreign_keys="Chore.assignee_id")
    grocery_items = relationship("GroceryItem", back_populates="added_by")
    chat_messages = relationship("ChatMessage", back_populates="sender")
    complaints = relationship("Complaint", back_populates="author")
    polls_created = relationship("Poll", back_populates="created_by")
    poll_votes = relationship("PollVote", back_populates="voter")
    bill_payments = relationship("BillPayment", back_populates="user")

class Household(Base):
    __tablename__ = "households"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    join_code = Column(String, unique=True, index=True)

    members = relationship("User", back_populates="household")
    expenses = relationship("Expense", back_populates="household")
    chores = relationship("Chore", back_populates="household")
    grocery_items = relationship("GroceryItem", back_populates="household")
    chat_messages = relationship("ChatMessage", back_populates="household")
    complaints = relationship("Complaint", back_populates="household")
    polls = relationship("Poll", back_populates="household")
    bills = relationship("Bill", back_populates="household")
    inventory_items = relationship("InventoryItem", back_populates="household")
    activity_logs = relationship("ActivityLog", back_populates="household")

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    amount = Column(Float)
    is_settlement = Column(Boolean, default=False)
    payer_id = Column(Integer, ForeignKey("users.id"))
    household_id = Column(Integer, ForeignKey("households.id"))
    created_at = Column(String, default="")

    payer = relationship("User", back_populates="expenses")
    household = relationship("Household", back_populates="expenses")
    # ✅ New relationship to track individual shares
    shares = relationship("ExpenseShare", back_populates="expense", cascade="all, delete-orphan")

# ✅ NEW TABLE: Tracks individual debts per expense
class ExpenseShare(Base):
    __tablename__ = "expense_shares"
    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    user_id = Column(Integer, ForeignKey("users.id")) # The person who owes money
    amount = Column(Float)
    is_paid = Column(Boolean, default=False)

    expense = relationship("Expense", back_populates="shares")
    debtor = relationship("User", back_populates="expense_shares")

# ... (Keep Chore, GroceryItem, ChatMessage, Complaint, Poll, PollOption, PollVote, Bill, BillPayment, InventoryItem, ActivityLog classes SAME) ...
# Copy the rest of models.py exactly as it was.
# Ensure Bill, Chore etc are still there.
class Chore(Base):
    __tablename__ = "chores"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    points = Column(Integer, default=10)
    is_completed = Column(Boolean, default=False)
    completed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    due_date = Column(String, default="")
    household_id = Column(Integer, ForeignKey("households.id"))
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    household = relationship("Household", back_populates="chores")
    assignee = relationship("User", back_populates="assigned_chores", foreign_keys=[assignee_id])
    completed_by = relationship("User", foreign_keys=[completed_by_id])

class GroceryItem(Base):
    __tablename__ = "grocery_items"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    is_purchased = Column(Boolean, default=False)
    added_by_id = Column(Integer, ForeignKey("users.id"))
    household_id = Column(Integer, ForeignKey("households.id"))
    created_at = Column(String, default="")
    added_by = relationship("User", back_populates="grocery_items")
    household = relationship("Household", back_populates="grocery_items")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text)
    is_announcement = Column(Boolean, default=False)
    sender_id = Column(Integer, ForeignKey("users.id"))
    household_id = Column(Integer, ForeignKey("households.id"))
    created_at = Column(String, default="")
    sender = relationship("User", back_populates="chat_messages")
    household = relationship("Household", back_populates="chat_messages")

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text)
    is_anonymous = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    author_id = Column(Integer, ForeignKey("users.id"))
    household_id = Column(Integer, ForeignKey("households.id"))
    created_at = Column(String, default="")
    author = relationship("User", back_populates="complaints")
    household = relationship("Household", back_populates="complaints")

class Poll(Base):
    __tablename__ = "polls"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    poll_type = Column(String, default="general")
    is_active = Column(Boolean, default=True)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    household_id = Column(Integer, ForeignKey("households.id"))
    created_at = Column(String, default="")
    created_by = relationship("User", back_populates="polls_created")
    household = relationship("Household", back_populates="polls")
    options = relationship("PollOption", back_populates="poll", cascade="all, delete-orphan")

class PollOption(Base):
    __tablename__ = "poll_options"
    id = Column(Integer, primary_key=True, index=True)
    option_text = Column(String)
    poll_id = Column(Integer, ForeignKey("polls.id"))
    poll = relationship("Poll", back_populates="options")
    votes = relationship("PollVote", back_populates="option", cascade="all, delete-orphan")

class PollVote(Base):
    __tablename__ = "poll_votes"
    id = Column(Integer, primary_key=True, index=True)
    option_id = Column(Integer, ForeignKey("poll_options.id"))
    voter_id = Column(Integer, ForeignKey("users.id"))
    poll_id = Column(Integer, ForeignKey("polls.id"))
    option = relationship("PollOption", back_populates="votes")
    voter = relationship("User", back_populates="poll_votes")

class Bill(Base):
    __tablename__ = "bills"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    amount = Column(Float)
    due_date = Column(String, default="")
    is_recurring = Column(Boolean, default=False)
    frequency = Column(String, default="monthly")
    is_paid = Column(Boolean, default=False)
    household_id = Column(Integer, ForeignKey("households.id"))
    created_at = Column(String, default="")
    household = relationship("Household", back_populates="bills")
    payments = relationship("BillPayment", back_populates="bill", cascade="all, delete-orphan")

class BillPayment(Base):
    __tablename__ = "bill_payments"
    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("bills.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    is_paid = Column(Boolean, default=False)
    bill = relationship("Bill", back_populates="payments")
    user = relationship("User", back_populates="bill_payments")

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    quantity = Column(Integer, default=1)
    unit = Column(String, default="pcs")
    status = Column(String, default="ok")
    household_id = Column(Integer, ForeignKey("households.id"))
    household = relationship("Household", back_populates="inventory_items")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    household_id = Column(Integer, ForeignKey("households.id"))
    user_name = Column(String)
    action = Column(String)
    emoji = Column(String)
    created_at = Column(String)
    household = relationship("Household", back_populates="activity_logs")