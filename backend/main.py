# backend/main.py
import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, crud, auth
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS: Allow all origins so any frontend (Vercel, localhost, preview URLs) can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.get("/")
def read_root():
    return {"message": "RoomieSync API is running!"}


# ==================== AUTH ====================
@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_identifier(db, identifier=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": user.username, "token_type": "bearer"}


# ==================== USER ENDPOINTS ====================
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_username = crud.get_user_by_username(db, username=user.username)
    if db_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    return crud.create_user(db=db, user=user)

@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.User).offset(skip).limit(limit).all()

@app.put("/users/{user_id}/household/{household_id}", response_model=schemas.User)
def join_household(user_id: int, household_id: int, db: Session = Depends(get_db)):
    return crud.update_user_household(db, user_id=user_id, household_id=household_id)

@app.put("/users/{user_id}/avatar", response_model=schemas.User)
def update_avatar(user_id: int, avatar: str, db: Session = Depends(get_db)):
    return crud.update_user_avatar(db, user_id=user_id, avatar=avatar)

@app.put("/users/{user_id}/theme", response_model=schemas.User)
def update_theme(user_id: int, theme: str, db: Session = Depends(get_db)):
    return crud.update_user_theme(db, user_id=user_id, theme=theme)

@app.put("/users/{user_id}/status", response_model=schemas.User)
def update_status(user_id: int, status: str, db: Session = Depends(get_db)):
    return crud.update_user_status(db, user_id=user_id, status=status)

@app.put("/users/{user_id}/quiet_mode", response_model=schemas.User)
def update_quiet_mode(user_id: int, quiet_mode: bool, db: Session = Depends(get_db)):
    return crud.update_user_quiet_mode(db, user_id=user_id, quiet_mode=quiet_mode)

# ✅ NEW: General Update Endpoint (Fixes the 404 Error)
@app.put("/users/{user_id}", response_model=schemas.User)
def update_user_general(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = crud.update_user(db=db, user_id=user_id, user=user_update)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.put("/users/{user_id}/leave_household", response_model=schemas.User)
def leave_household(user_id: int, db: Session = Depends(get_db)):
    return crud.remove_user_from_household(db, user_id=user_id)

@app.put("/users/{user_id}/profile")
def update_profile(user_id: int, profile: schemas.ProfileUpdate, db: Session = Depends(get_db)):
    result = crud.update_user_profile(db, user_id=user_id, profile=profile)
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    if result is None:
        raise HTTPException(status_code=404, detail="User not found")
    return result

@app.post("/users/reset-password")
def reset_password(payload: schemas.PasswordReset, db: Session = Depends(get_db)):
    user = crud.get_user_by_identifier(db, identifier=payload.identifier)
    if not user:
        raise HTTPException(status_code=404, detail="No account found with that username or email")
    user.hashed_password = auth.get_password_hash(payload.new_password)
    db.commit()
    return {"ok": True, "message": "Password updated successfully"}


# ==================== HOUSEHOLD ENDPOINTS ====================
@app.post("/households/", response_model=schemas.Household)
def create_household(household: schemas.HouseholdCreate, db: Session = Depends(get_db)):
    return crud.create_household(db=db, household=household)

@app.get("/households/", response_model=List[schemas.Household])
def read_households(db: Session = Depends(get_db)):
    return crud.get_households(db)

@app.get("/households/{household_id}", response_model=schemas.Household)
def read_household(household_id: int, db: Session = Depends(get_db)):
    db_household = crud.get_household(db, household_id=household_id)
    if db_household is None:
        raise HTTPException(status_code=404, detail="Household not found")
    return db_household


# ==================== EXPENSE ENDPOINTS ====================
@app.post("/expenses/{user_id}/{household_id}", response_model=schemas.Expense)
def create_expense(user_id: int, household_id: int, expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    return crud.create_expense(db=db, expense=expense, user_id=user_id, household_id=household_id)

@app.get("/expenses/{household_id}", response_model=List[schemas.Expense])
def read_expenses(household_id: int, db: Session = Depends(get_db)):
    return crud.get_expenses(db, household_id=household_id)

@app.get("/expenses/analytics/{household_id}")
def expense_analytics(household_id: int, db: Session = Depends(get_db)):
    return crud.get_expense_analytics(db, household_id=household_id)

@app.put("/expenses/{expense_id}/settle")
def settle_expense_endpoint(expense_id: int, db: Session = Depends(get_db)):
    return crud.settle_expense(db, expense_id=expense_id)

# ✅ NEW: Pay a specific share of an expense
@app.put("/expenses/share/{share_id}/pay")
def pay_expense_share(share_id: int, db: Session = Depends(get_db)):
    result = crud.pay_expense_share(db, share_id=share_id)
    if not result:
        raise HTTPException(status_code=404, detail="Share not found")
    return {"ok": True}

# ==================== ACTIVITY FEED ====================
@app.post("/activity/")
def create_activity_log(log: schemas.ActivityLogCreate, db: Session = Depends(get_db)):
    # ✅ NEW: Now calls CRUD to actually save to DB
    return crud.create_activity_log(db=db, log=log)

@app.get("/activity/{household_id}")
def read_activity(household_id: int, db: Session = Depends(get_db)):
    return crud.get_activity_feed(db, household_id=household_id)

# ==================== CHORE ENDPOINTS ====================
@app.post("/chores/{household_id}", response_model=schemas.Chore)
def create_chore(household_id: int, chore: schemas.ChoreCreate, db: Session = Depends(get_db)):
    return crud.create_chore(db=db, chore=chore, household_id=household_id)

@app.get("/chores/{household_id}", response_model=List[schemas.Chore])
def read_chores(household_id: int, db: Session = Depends(get_db)):
    return crud.get_chores(db, household_id=household_id)

@app.put("/chores/{chore_id}/toggle", response_model=schemas.Chore)
def toggle_chore(chore_id: int, user_id: int = None, db: Session = Depends(get_db)):
    return crud.toggle_chore(db, chore_id=chore_id, user_id=user_id)

@app.delete("/chores/{chore_id}")
def delete_chore(chore_id: int, db: Session = Depends(get_db)):
    crud.delete_chore(db, chore_id=chore_id)
    return {"ok": True}


# ==================== GROCERY ENDPOINTS ====================
@app.post("/grocery/{user_id}/{household_id}", response_model=schemas.GroceryItem)
def create_grocery_item(user_id: int, household_id: int, item: schemas.GroceryItemCreate, db: Session = Depends(get_db)):
    return crud.create_grocery_item(db=db, item=item, user_id=user_id, household_id=household_id)

@app.get("/grocery/{household_id}", response_model=List[schemas.GroceryItem])
def read_grocery_items(household_id: int, db: Session = Depends(get_db)):
    return crud.get_grocery_items(db, household_id=household_id)

@app.put("/grocery/{item_id}/toggle", response_model=schemas.GroceryItem)
def toggle_grocery(item_id: int, db: Session = Depends(get_db)):
    return crud.toggle_grocery_item(db, item_id=item_id)

@app.delete("/grocery/{item_id}")
def delete_grocery(item_id: int, db: Session = Depends(get_db)):
    crud.delete_grocery_item(db, item_id=item_id)
    return {"ok": True}

@app.delete("/grocery/clear/{household_id}")
def clear_purchased(household_id: int, db: Session = Depends(get_db)):
    crud.clear_purchased_groceries(db, household_id=household_id)
    return {"ok": True}


# ==================== CHAT ENDPOINTS ====================
@app.post("/chat/{sender_id}/{household_id}", response_model=schemas.ChatMessage)
def create_chat(sender_id: int, household_id: int, msg: schemas.ChatMessageCreate, db: Session = Depends(get_db)):
    return crud.create_chat_message(db=db, msg=msg, sender_id=sender_id, household_id=household_id)

@app.get("/chat/{household_id}", response_model=List[schemas.ChatMessage])
def read_chat(household_id: int, db: Session = Depends(get_db)):
    return crud.get_chat_messages(db, household_id=household_id)


# ==================== COMPLAINT ENDPOINTS ====================
@app.post("/complaints/{author_id}/{household_id}", response_model=schemas.Complaint)
def create_complaint(author_id: int, household_id: int, complaint: schemas.ComplaintCreate, db: Session = Depends(get_db)):
    return crud.create_complaint(db=db, complaint=complaint, author_id=author_id, household_id=household_id)

@app.get("/complaints/{household_id}", response_model=List[schemas.Complaint])
def read_complaints(household_id: int, db: Session = Depends(get_db)):
    return crud.get_complaints(db, household_id=household_id)

@app.put("/complaints/{complaint_id}/resolve", response_model=schemas.Complaint)
def resolve_complaint(complaint_id: int, db: Session = Depends(get_db)):
    return crud.toggle_complaint_resolved(db, complaint_id=complaint_id)


# ==================== POLL ENDPOINTS ====================
# ⚠️ Specific routes MUST come before parameterized routes to avoid conflicts
@app.post("/polls/vote/{poll_id}")
def vote_poll(poll_id: int, vote: schemas.PollVoteCreate, db: Session = Depends(get_db)):
    return crud.vote_poll(
        db,
        poll_id=poll_id,
        option_id=vote.option_id,
        voter_id=vote.voter_id
    )

@app.put("/polls/{poll_id}/close")
def close_poll(poll_id: int, db: Session = Depends(get_db)):
    return crud.close_poll(db, poll_id=poll_id)

@app.post("/polls/{user_id}/{household_id}", response_model=schemas.Poll)
def create_poll(user_id: int, household_id: int, poll: schemas.PollCreate, db: Session = Depends(get_db)):
    return crud.create_poll(db=db, poll=poll, user_id=user_id, household_id=household_id)

@app.get("/polls/{household_id}", response_model=List[schemas.Poll])
def read_polls(household_id: int, db: Session = Depends(get_db)):
    return crud.get_polls(db, household_id=household_id)


# ==================== BILL ENDPOINTS ====================
@app.post("/bills/{household_id}", response_model=schemas.Bill)
def create_bill(household_id: int, bill: schemas.BillCreate, db: Session = Depends(get_db)):
    return crud.create_bill(db=db, bill=bill, household_id=household_id)

@app.get("/bills/{household_id}", response_model=List[schemas.Bill])
def read_bills(household_id: int, db: Session = Depends(get_db)):
    return crud.get_bills(db, household_id=household_id)

@app.put("/bills/payment/{payment_id}/toggle", response_model=schemas.BillPayment)
def toggle_bill(payment_id: int, db: Session = Depends(get_db)):
    return crud.toggle_bill_payment(db, payment_id=payment_id)

@app.put("/bills/{bill_id}/pay")
def pay_bill_endpoint(bill_id: int, db: Session = Depends(get_db)):
    return crud.pay_bill(db, bill_id=bill_id)

@app.delete("/bills/{bill_id}")
def delete_bill(bill_id: int, db: Session = Depends(get_db)):
    crud.delete_bill(db, bill_id=bill_id)
    return {"ok": True}


# ==================== INVENTORY ENDPOINTS ====================
@app.post("/inventory/{household_id}", response_model=schemas.InventoryItem)
def create_inventory(household_id: int, item: schemas.InventoryItemCreate, db: Session = Depends(get_db)):
    return crud.create_inventory_item(db=db, item=item, household_id=household_id)

@app.get("/inventory/{household_id}", response_model=List[schemas.InventoryItem])
def read_inventory(household_id: int, db: Session = Depends(get_db)):
    return crud.get_inventory_items(db, household_id=household_id)

@app.put("/inventory/{item_id}", response_model=schemas.InventoryItem)
def update_inventory(item_id: int, update: schemas.InventoryItemUpdate, db: Session = Depends(get_db)):
    return crud.update_inventory_item(db, item_id=item_id, update=update)

@app.delete("/inventory/{item_id}")
def delete_inventory(item_id: int, db: Session = Depends(get_db)):
    crud.delete_inventory_item(db, item_id=item_id)
    return {"ok": True}


# ==================== KARMA LEADERBOARD ====================
@app.get("/karma/{household_id}")
def read_karma(household_id: int, db: Session = Depends(get_db)):
    return crud.get_karma_leaderboard(db, household_id=household_id)


# ==================== MOVE-OUT SETTLEMENT ====================
@app.get("/settlement/{user_id}/{household_id}")
def read_settlement(user_id: int, household_id: int, db: Session = Depends(get_db)):
    return crud.get_moveout_settlement(db, user_id=user_id, household_id=household_id)