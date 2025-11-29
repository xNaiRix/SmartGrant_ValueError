from fastapi import Depends, HTTPException, Header
from datetime import datetime, timedelta, timezone
from typing import List, Literal, Dict
import os
import jwt

from passlib.context import CryptContext

from schemes import UserCreate, CreateCompany, CreateScientist, LoginRequest, UserProfileRequest
from database import getItem, createItem

SECRET_KEY = None
ALGORITHM = None  
ACCESS_TOKEN_EXPIRE_MINUTES = None
pwd_context = None

def setValues(secret_key, algorithm, access_token_expire_minutes):
    global SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, pwd_context
    SECRET_KEY = secret_key
    ALGORITHM = algorithm
    ACCESS_TOKEN_EXPIRE_MINUTES = access_token_expire_minutes
    pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)
    if not SECRET_KEY:
        print("WARNING: SECRET_KEY is not set!")
    else:
        print(f"Auth config set: SECRET_KEY={'[SET]' if SECRET_KEY else '[NOT SET]'}, ALGORITHM={ALGORITHM}, EXPIRE_MINUTES={ACCESS_TOKEN_EXPIRE_MINUTES}")

def create_token(login: str, role: str) -> str:
    global SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
    
    expire_minutes = ACCESS_TOKEN_EXPIRE_MINUTES if ACCESS_TOKEN_EXPIRE_MINUTES is not None else 30
    #время истечения
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    #datetime -> timestamp (число)
    payload = {
        "email": login,
        "role": role,
        "exp": expire.timestamp(),
        "iat": datetime.now(timezone.utc).timestamp()
    }
    #кодируем токен
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401, 
            detail="Token expired"
        )
    except jwt.InvalidTokenError as e:
        print(f"Token decode error: {e}")
        raise HTTPException(
            status_code=401, 
            detail="Invalid token"
        )

async def get_current_user(authorization = Header(None, alias="Authorization")) -> Dict:
    if not authorization:
        return {"role": None, "email":None}#role = company/scientist
    if not authorization.startswith("Bearer "):
        return {"role": None, "email":None}
    token = authorization.replace("Bearer ", "")
    return decode_token(token)

async def verify_role(user: Dict, allowed: List) -> bool:
    if not user.get("role"):
        return False
    return user["role"] in allowed


def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)

async def validate_password(passwd) -> bool:
    return len(passwd) >= 10 and sum(x.isupper() for x in passwd) >= 1 and sum(x.isdigit() for x in passwd) >= 1


async def _reg(tableName:Literal["Scientists", "Companies"], user:UserCreate)->Dict:
    try:
        #print(user.role)
        user_in_db = await getItem(tableName=tableName, id=user.data.email)
        if not user_in_db:
            if not await validate_password(passwd=user.data.password):
                return {
                " status": "failed",
                    "message": "Your password does not meet the criteria: at least 10 characters, a capital letter, a small letter, and a number"
                }
            
            hashed_password = hash_password(user.data.password)
            user.data.password = hashed_password
            if not (await createItem(tableName="Scientists", item=user.data)):
                return {"status": "failed", "message": "DB Error"}
            return {"status": "success", "message": "Registration was successful"}
        return {
            "status": "failed",
            "message": "User with this username already exists"
        }
    except:
        return {
            "status": "failed",
            "message": "Registration error"
        }
    
async def reg(user: UserCreate) -> Dict:
    if user.role == "scientist":
        return await _reg(tableName="Scientists", user=user.data)
    return await _reg(tableName="Companies", user=user.data)


async def _login_user(tableName:Literal["Scientists", "Companies"],  user: LoginRequest) -> Dict:
    
    user_in_db = await getItem(tableName=tableName, id=user.email)
    print(f"Login attempt for user: {user.email}")
    print(f"User found in DB: {user_in_db is not None}")
    if not user_in_db:
        return {"status": "failed", "message": "Unknown email", "token": None}
    print(f"Stored password hash: {user_in_db['password'][:50]}...")
    isCorrect = await verify_password(password=user.password, hashed_password=user_in_db["password"])
    print(f"Password verification result: {isCorrect}")
    if not isCorrect:
        return {"status": "failed", "message": "Incorrect password", "token": None}
    try:
        token = create_token(user_in_db["email"], user.role)
        print(f"Token created successfully: {token[:50] if token else 'None'}...")
        return {"status": "success", "message": "An account login was successful", "token": token}
    except Exception as e:
        print(f"Error creating token: {e}")
        import traceback
        traceback.print_exc()
        raise e
    
async def login_user(user: LoginRequest)->Dict:
    if user.role == "scientist":
        return await _login_user("Scientists", user)
    if user.role == "company":
        return await _login_user("Companies", user)
    return {"status":"failed", "message":"unexcepted json"}

async def get_current_user_profile(user: Dict):
    try:
        if user["role"] == "scientist":
            t = await getItem("Scientists", id = user["email"])
        elif user["role"] == "company":
            t = await getItem("Companies", id = user["email"])
        t["role"] = user["role"]
        return t
    except Exception as e:
        return {"status":"failed", "message":"Internal problem"}
    

if __name__ == "__main__" or True:
    SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key_change_me")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

    print(f"API module loading - Setting auth config:")
    print(f"  SECRET_KEY: {'[SET]' if SECRET_KEY else '[NOT SET]'}")
    print(f"  ACCESS_TOKEN_EXPIRE_MINUTES: {ACCESS_TOKEN_EXPIRE_MINUTES}")
    print(f"  ALGORITHM: {ALGORITHM}")

    setValues(
        secret_key=SECRET_KEY,
        algorithm=ALGORITHM,
        access_token_expire_minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )