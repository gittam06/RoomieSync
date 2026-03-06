# backend/test_db.py
from database import SessionLocal, engine
import models, auth

# 1. Force Create Tables
print("Creating Tables...")
models.Base.metadata.create_all(bind=engine)

# 2. Try to Create a User manually
print("Attempting to create user...")
db = SessionLocal()

try:
    # Check if hash works
    print("Testing Password Hash...")
    pwd = auth.get_password_hash("test1234")
    print(f"Password Hashed: {pwd[:10]}...")

    # Create User
    new_user = models.User(
        username="TestBot",
        email="test@bot.com",
        hashed_password=pwd,
        avatar="🤖",
        theme="slate"
    )
    db.add(new_user)
    db.commit()
    print("✅ SUCCESS: User 'TestBot' created in Database!")

except Exception as e:
    print(f"❌ CRITICAL ERROR: {e}")

finally:
    db.close()