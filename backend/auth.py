from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _prepare_password(password: str) -> str:
    # bcrypt cannot handle passwords > 72 bytes.
    # We truncate to 72 bytes manually to prevent crashes.
    return password[:72]

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(_prepare_password(plain_password), hashed_password)

def get_password_hash(password):
    return pwd_context.hash(_prepare_password(password))