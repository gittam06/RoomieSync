# backend/models.py
from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Household(Base):
    __tablename__ = "households"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    join_code = Column(String, unique=True, index=True) # e.g., "XY99"
    
    # Relationships
    users = relationship("User", back_populates="household")
    expenses = relationship("Expense", back_populates="household")
    chores = relationship("Chore", back_populates="household")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # Status: "Online", "DND", "Sleeping"
    status = Column(String, default="Online")
    
    # Link to Household
    household_id = Column(Integer, ForeignKey("households.id"), nullable=True)
    household = relationship("Household", back_populates="users")
    
    # Items this user is responsible for
    assigned_chores = relationship("Chore", back_populates="assignee")
    expenses_paid = relationship("Expense", back_populates="payer")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    amount = Column(Float)
    
    # Who paid?
    payer_id = Column(Integer, ForeignKey("users.id"))
    payer = relationship("User", back_populates="expenses_paid")
    
    # Which house does this belong to?
    household_id = Column(Integer, ForeignKey("households.id"))
    household = relationship("Household", back_populates="expenses")

class Chore(Base):
    __tablename__ = "chores"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    points = Column(Integer, default=10)
    is_completed = Column(Boolean, default=False)
    
    # Who is supposed to do it?
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assignee = relationship("User", back_populates="assigned_chores")
    
    # Which house?
    household_id = Column(Integer, ForeignKey("households.id"))
    household = relationship("Household", back_populates="chores")