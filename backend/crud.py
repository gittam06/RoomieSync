# backend/crud.py
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
import models, schemas, auth
import random, string


# ==================== USER FUNCTIONS ====================
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_identifier(db: Session, identifier: str):
    return db.query(models.User).filter(or_(models.User.username == identifier, models.User.email == identifier)).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password, avatar=user.avatar, theme=user.theme)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_household(db: Session, user_id: int, household_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.household_id = household_id
        db.commit()
        db.refresh(user)
    return user

def update_user_avatar(db: Session, user_id: int, avatar: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.avatar = avatar
        db.commit()
        db.refresh(user)
    return user

def update_user_theme(db: Session, user_id: int, theme: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.theme = theme
        db.commit()
        db.refresh(user)
    return user

def update_user_status(db: Session, user_id: int, status: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.status = status
        db.commit()
        db.refresh(user)
    return user

def update_user_quiet_mode(db: Session, user_id: int, quiet_mode: bool):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.quiet_mode = quiet_mode
        db.commit()
        db.refresh(user)
    return user

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        update_data = user.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
        return db_user
    return None

# ✅ UPDATED: SMART LEAVE HOUSEHOLD FUNCTION
def remove_user_from_household(db: Session, user_id: int):
    # 1. Get User
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.household_id:
        return user

    household_id = user.household_id
    
    # --- STEP A: LOG ACTIVITY (Safe Mode) ---
    try:
        log = models.ActivityLog(
            household_id=household_id,
            user_name=user.username,
            action="left the house 👋",
            emoji="🚪",
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M")
        )
        db.add(log)
        db.commit() # Commit log immediately so it saves even if next steps fail
    except Exception as e:
        print(f"⚠️ Error logging activity: {e}")
        db.rollback()

    # --- STEP B: REDISTRIBUTE EXPENSES (Safe Mode) ---
    try:
        # Find unpaid debts
        user_shares = db.query(models.ExpenseShare).filter(
            models.ExpenseShare.user_id == user.id, 
            models.ExpenseShare.is_paid == False
        ).all()

        for share in user_shares:
            expense = db.query(models.Expense).filter(models.Expense.id == share.expense_id).first()
            if expense:
                # Remove the leaver's share
                db.delete(share)
                
                # Recalculate for remaining members
                remaining_shares = db.query(models.ExpenseShare).filter(
                    models.ExpenseShare.expense_id == expense.id,
                    models.ExpenseShare.user_id != user.id # Exclude the leaver
                ).all()
                
                count = len(remaining_shares)
                if count > 0:
                    new_amount = round(expense.amount / count, 2)
                    for rs in remaining_shares:
                        rs.amount = new_amount
        
        db.commit() # Save the money changes
    except Exception as e:
        print(f"⚠️ Error handling expenses (User will still leave): {e}")
        db.rollback()

    # --- STEP B2: SETTLE BILL PAYMENTS (Safe Mode) ---
    try:
        # Get all bills for this household
        bills = db.query(models.Bill).filter(models.Bill.household_id == household_id).all()
        
        for bill in bills:
            # Find the leaving user's unpaid payment
            user_payment = db.query(models.BillPayment).filter(
                models.BillPayment.bill_id == bill.id,
                models.BillPayment.user_id == user_id,
                models.BillPayment.is_paid == False
            ).first()
            
            if user_payment:
                leaving_amount = user_payment.amount
                # Mark the leaving user's payment as paid
                user_payment.is_paid = True
                
                # Redistribute among remaining members
                remaining_payments = db.query(models.BillPayment).filter(
                    models.BillPayment.bill_id == bill.id,
                    models.BillPayment.user_id != user_id
                ).all()
                
                if remaining_payments:
                    extra_per_person = round(leaving_amount / len(remaining_payments), 2)
                    for rp in remaining_payments:
                        rp.amount = round(rp.amount + extra_per_person, 2)
        
        db.commit()
    except Exception as e:
        print(f"⚠️ Error settling bill payments (User will still leave): {e}")
        db.rollback()

    # --- STEP C: ACTUALLY LEAVE (Critical) ---
    # Re-fetch user to ensure clean state
    user = db.query(models.User).filter(models.User.id == user_id).first()
    user.household_id = None
    
    db.commit()
    db.refresh(user)
    
    return user

def update_user_profile(db: Session, user_id: int, profile: schemas.ProfileUpdate):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    if profile.username:
        existing = db.query(models.User).filter(models.User.username == profile.username, models.User.id != user_id).first()
        if existing:
            return {"error": "Username already taken"}
        user.username = profile.username
    if profile.email:
        existing = db.query(models.User).filter(models.User.email == profile.email, models.User.id != user_id).first()
        if existing:
            return {"error": "Email already in use"}
        user.email = profile.email
    if profile.old_password and profile.new_password:
        if not auth.verify_password(profile.old_password, user.hashed_password):
            return {"error": "Incorrect current password"}
        user.hashed_password = auth.get_password_hash(profile.new_password)
    db.commit()
    db.refresh(user)
    return user

def create_household(db: Session, household: schemas.HouseholdCreate):
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    db_household = models.Household(name=household.name, join_code=code)
    db.add(db_household)
    db.commit()
    db.refresh(db_household)
    return db_household

def get_households(db: Session):
    return db.query(models.Household).all()

def get_household(db: Session, household_id: int):
    return db.query(models.Household).filter(models.Household.id == household_id).first()

# ==================== EXPENSE FUNCTIONS ====================
def create_expense(db: Session, expense: schemas.ExpenseCreate, user_id: int, household_id: int):
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    # 1. Create the Main Expense
    db_expense = models.Expense(
        title=expense.title,
        amount=expense.amount,
        is_settlement=False, # Always False initially
        payer_id=user_id,
        household_id=household_id,
        created_at=now
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    # 2. Automatically Split among ALL members
    household = get_household(db, household_id)
    if household and household.members:
        member_count = len(household.members)
        if member_count > 0:
            split_amount = round(expense.amount / member_count, 2)
            
            for member in household.members:
                # We only create debt entries for people who are NOT the payer
                if member.id != user_id:
                    share = models.ExpenseShare(
                        expense_id=db_expense.id,
                        user_id=member.id,
                        amount=split_amount,
                        is_paid=False
                    )
                    db.add(share)
            
            db.commit()
            db.refresh(db_expense)

    return db_expense

def get_expenses(db: Session, household_id: int):
    # ✅ Fetch expense AND its shares + debtor names
    return db.query(models.Expense).options(
        joinedload(models.Expense.payer),
        joinedload(models.Expense.shares).joinedload(models.ExpenseShare.debtor)
    ).filter(models.Expense.household_id == household_id).all()

def pay_expense_share(db: Session, share_id: int):
    # 1. Mark this specific share as paid
    share = db.query(models.ExpenseShare).filter(models.ExpenseShare.id == share_id).first()
    if not share:
        return None
    
    share.is_paid = True
    db.commit()

    # 2. Check if ALL shares for this expense are now paid
    expense_id = share.expense_id
    all_shares = db.query(models.ExpenseShare).filter(models.ExpenseShare.expense_id == expense_id).all()
    
    # If all shares are paid, mark the parent expense as settled!
    if all(s.is_paid for s in all_shares):
        expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
        if expense:
            expense.is_settlement = True
            db.commit()
    
    return share

def get_expense_analytics(db: Session, household_id: int):
    expenses = db.query(models.Expense).options(
        joinedload(models.Expense.payer)
    ).filter(
        models.Expense.household_id == household_id
    ).all()

    household = get_household(db, household_id)
    if not household or not household.members:
        return {"per_person": [], "total": 0}

    per_person = {}
    for member in household.members:
        per_person[member.id] = {
            "user_id": member.id,
            "username": member.username,
            "avatar": member.avatar,
            "total_paid": 0,
            "expense_count": 0
        }

    total = 0
    for exp in expenses:
        total += exp.amount
        if exp.payer_id in per_person:
            per_person[exp.payer_id]["total_paid"] += exp.amount
            per_person[exp.payer_id]["expense_count"] += 1

    return {
        "per_person": list(per_person.values()),
        "total": round(total, 2)
    }

# ==================== ACTIVITY FEED ====================
def create_activity_log(db: Session, log: schemas.ActivityLogCreate):
    db_log = models.ActivityLog(household_id=log.household_id, user_name=log.user, action=log.action, emoji=log.emoji, created_at=log.time)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_activity_feed(db: Session, household_id: int, limit: int = 20):
    activities = []
    # Recent Expenses
    expenses = db.query(models.Expense).options(joinedload(models.Expense.payer)).filter(models.Expense.household_id == household_id).order_by(models.Expense.id.desc()).limit(5).all()
    for e in expenses:
        activities.append({"type": "expense", "icon": "💸", "text": f"{e.payer.username if e.payer else 'Someone'} paid ₹{e.amount:.0f} for {e.title}", "time": e.created_at, "id": f"exp_{e.id}", "emoji": "💸"})
    # Recent Chores
    chores = db.query(models.Chore).options(joinedload(models.Chore.completed_by)).filter(models.Chore.household_id == household_id, models.Chore.is_completed == True).order_by(models.Chore.id.desc()).limit(5).all()
    for c in chores:
        who = c.completed_by.username if c.completed_by else "Someone"
        activities.append({"type": "chore", "icon": "✅", "text": f"{who} completed '{c.title}' (+{c.points}pts)", "time": "", "id": f"chore_{c.id}", "emoji": "✅"})
    # Recent Polls
    polls = db.query(models.Poll).options(joinedload(models.Poll.created_by)).filter(models.Poll.household_id == household_id).order_by(models.Poll.id.desc()).limit(3).all()
    for p in polls:
        activities.append({"type": "poll", "icon": "🗳️", "text": f"{p.created_by.username if p.created_by else 'Someone'} created poll: {p.title}", "time": p.created_at, "id": f"poll_{p.id}", "emoji": "🗳️"})
    # Activity Logs (complaints, resolved complaints, poll votes, etc.)
    logs = db.query(models.ActivityLog).filter(models.ActivityLog.household_id == household_id).order_by(models.ActivityLog.id.desc()).limit(10).all()
    for log in logs:
        activities.append({"type": "log", "icon": log.emoji, "text": f"{log.user_name} {log.action}", "time": log.created_at, "id": f"log_{log.id}", "emoji": log.emoji})
    # Sort by id descending (newest first) and limit
    activities.sort(key=lambda x: int(x["id"].split("_")[1]), reverse=True)
    return activities[:limit]

# ==================== CHORE FUNCTIONS ====================
def create_chore(db: Session, chore: schemas.ChoreCreate, household_id: int):
    db_chore = models.Chore(title=chore.title, points=chore.points, due_date=chore.due_date, assignee_id=chore.assignee_id, household_id=household_id)
    db.add(db_chore)
    db.commit()
    db.refresh(db_chore)
    return db_chore

def get_chores(db: Session, household_id: int):
    return db.query(models.Chore).options(joinedload(models.Chore.assignee)).filter(models.Chore.household_id == household_id).all()

def toggle_chore(db: Session, chore_id: int, user_id: int = None):
    chore = db.query(models.Chore).filter(models.Chore.id == chore_id).first()
    if chore:
        chore.is_completed = not chore.is_completed
        if chore.is_completed and user_id:
            chore.completed_by_id = user_id
        elif not chore.is_completed:
            chore.completed_by_id = None
        db.commit()
        db.refresh(chore)
    return chore

def delete_chore(db: Session, chore_id: int):
    chore = db.query(models.Chore).filter(models.Chore.id == chore_id).first()
    if chore:
        db.delete(chore)
        db.commit()
    return {"ok": True}

# ==================== GROCERY FUNCTIONS ====================
def create_grocery_item(db: Session, item: schemas.GroceryItemCreate, user_id: int, household_id: int):
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    db_item = models.GroceryItem(title=item.title, added_by_id=user_id, household_id=household_id, created_at=now)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_grocery_items(db: Session, household_id: int):
    return db.query(models.GroceryItem).options(joinedload(models.GroceryItem.added_by)).filter(models.GroceryItem.household_id == household_id).all()

def toggle_grocery_item(db: Session, item_id: int):
    item = db.query(models.GroceryItem).filter(models.GroceryItem.id == item_id).first()
    if item:
        item.is_purchased = not item.is_purchased
        db.commit()
        db.refresh(item)
    return item

def delete_grocery_item(db: Session, item_id: int):
    item = db.query(models.GroceryItem).filter(models.GroceryItem.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return item

def clear_purchased_groceries(db: Session, household_id: int):
    db.query(models.GroceryItem).filter(models.GroceryItem.household_id == household_id, models.GroceryItem.is_purchased == True).delete()
    db.commit()

# ==================== CHAT FUNCTIONS ====================
def create_chat_message(db: Session, msg: schemas.ChatMessageCreate, sender_id: int, household_id: int):
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    db_msg = models.ChatMessage(message=msg.message, is_announcement=msg.is_announcement, sender_id=sender_id, household_id=household_id, created_at=now)
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

def get_chat_messages(db: Session, household_id: int, limit: int = 50):
    return db.query(models.ChatMessage).options(joinedload(models.ChatMessage.sender)).filter(models.ChatMessage.household_id == household_id).order_by(models.ChatMessage.id.desc()).limit(limit).all()

# ==================== COMPLAINT FUNCTIONS ====================
def create_complaint(db: Session, complaint: schemas.ComplaintCreate, author_id: int, household_id: int):
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    db_complaint = models.Complaint(message=complaint.message, is_anonymous=complaint.is_anonymous, author_id=author_id, household_id=household_id, created_at=now)
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

def get_complaints(db: Session, household_id: int):
    return db.query(models.Complaint).options(joinedload(models.Complaint.author)).filter(models.Complaint.household_id == household_id).all()

def toggle_complaint_resolved(db: Session, complaint_id: int):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if complaint:
        complaint.is_resolved = not complaint.is_resolved
        db.commit()
        db.refresh(complaint)
    return complaint

# ==================== POLL FUNCTIONS ====================
def create_poll(db: Session, poll: schemas.PollCreate, user_id: int, household_id: int):
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    db_poll = models.Poll(title=poll.title, poll_type=poll.poll_type, created_by_id=user_id, household_id=household_id, created_at=now)
    db.add(db_poll)
    db.commit()
    db.refresh(db_poll)
    for opt_text in poll.options:
        db_opt = models.PollOption(option_text=opt_text, poll_id=db_poll.id)
        db.add(db_opt)
    db.commit()
    db.refresh(db_poll)
    return db_poll

def get_polls(db: Session, household_id: int):
    return db.query(models.Poll).options(joinedload(models.Poll.created_by), joinedload(models.Poll.options).joinedload(models.PollOption.votes)).filter(models.Poll.household_id == household_id).all()

def vote_poll(db: Session, poll_id: int, option_id: int, voter_id: int):
    existing = db.query(models.PollVote).filter(models.PollVote.poll_id == poll_id, models.PollVote.voter_id == voter_id).first()
    if existing:
        existing.option_id = option_id
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db_vote = models.PollVote(option_id=option_id, voter_id=voter_id, poll_id=poll_id)
        db.add(db_vote)
        db.commit()
        db.refresh(db_vote)
        return db_vote

def close_poll(db: Session, poll_id: int):
    poll = db.query(models.Poll).filter(models.Poll.id == poll_id).first()
    if poll:
        poll.is_active = not poll.is_active
        db.commit()
        db.refresh(poll)
    return poll

# ==================== BILL FUNCTIONS ====================
def create_bill(db: Session, bill: schemas.BillCreate, household_id: int):
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    db_bill = models.Bill(title=bill.title, amount=bill.amount, due_date=bill.due_date, is_recurring=bill.is_recurring, frequency=bill.frequency, household_id=household_id, created_at=now)
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)
    household = get_household(db, household_id)
    if household and household.members:
        split = round(bill.amount / len(household.members), 2)
        for member in household.members:
            payment = models.BillPayment(bill_id=db_bill.id, user_id=member.id, amount=split, is_paid=False)
            db.add(payment)
        db.commit()
        db.refresh(db_bill)
    return db_bill

def get_bills(db: Session, household_id: int):
    return db.query(models.Bill).options(joinedload(models.Bill.payments).joinedload(models.BillPayment.user)).filter(models.Bill.household_id == household_id).all()

def toggle_bill_payment(db: Session, payment_id: int):
    payment = db.query(models.BillPayment).filter(models.BillPayment.id == payment_id).first()
    if payment:
        payment.is_paid = not payment.is_paid
        db.commit()
        db.refresh(payment)
    return payment

def pay_bill(db: Session, bill_id: int):
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if bill:
        bill.is_paid = True
        db.commit()
        db.refresh(bill)
    return bill

def delete_bill(db: Session, bill_id: int):
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if bill:
        db.delete(bill)
        db.commit()
    return bill

# ==================== INVENTORY FUNCTIONS ====================
def create_inventory_item(db: Session, item: schemas.InventoryItemCreate, household_id: int):
    db_item = models.InventoryItem(name=item.name, quantity=item.quantity, unit=item.unit, status=item.status, household_id=household_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_inventory_items(db: Session, household_id: int):
    return db.query(models.InventoryItem).filter(models.InventoryItem.household_id == household_id).all()

def update_inventory_item(db: Session, item_id: int, update: schemas.InventoryItemUpdate):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if item:
        if update.quantity is not None:
            item.quantity = update.quantity
        if update.status is not None:
            item.status = update.status
        db.commit()
        db.refresh(item)
    return item

def delete_inventory_item(db: Session, item_id: int):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return item

# ==================== KARMA FUNCTIONS ====================
def get_karma_leaderboard(db: Session, household_id: int):
    household = db.query(models.Household).options(joinedload(models.Household.members)).filter(models.Household.id == household_id).first()
    if not household:
        return []
    leaderboard = []
    for member in household.members:
        chore_points_list = db.query(models.Chore).filter(models.Chore.household_id == household_id, models.Chore.is_completed == True, models.Chore.completed_by_id == member.id).all()
        chores_done = len(chore_points_list)
        total_points = sum(c.points for c in chore_points_list)
        leaderboard.append({"user_id": member.id, "username": member.username, "avatar": member.avatar, "chores_done": chores_done, "total_points": total_points})
    leaderboard.sort(key=lambda x: x["total_points"], reverse=True)
    return leaderboard

# ==================== SETTLEMENT FUNCTIONS ====================
def get_moveout_settlement(db: Session, user_id: int, household_id: int):
    expenses = get_expenses(db, household_id)
    household = get_household(db, household_id)
    if not household or not household.members:
        return {"balance": 0, "details": []}
    num_members = len(household.members)
    shared_expenses = [e for e in expenses if not e.is_settlement]
    total_shared = sum(e.amount for e in shared_expenses)
    fair_share = total_shared / num_members if num_members > 0 else 0
    user_paid = sum(e.amount for e in expenses if e.payer_id == user_id)
    balance = user_paid - fair_share
    bills = get_bills(db, household_id)
    unpaid_bills = []
    for bill in bills:
        for p in bill.payments:
            if p.user_id == user_id and not p.is_paid:
                unpaid_bills.append({"bill_title": bill.title, "amount": p.amount})
    return {"user_id": user_id, "total_shared_expenses": round(total_shared, 2), "your_fair_share": round(fair_share, 2), "you_paid": round(user_paid, 2), "expense_balance": round(balance, 2), "unpaid_bills": unpaid_bills, "unpaid_bill_total": round(sum(b["amount"] for b in unpaid_bills), 2), "final_balance": round(balance - sum(b["amount"] for b in unpaid_bills), 2)}