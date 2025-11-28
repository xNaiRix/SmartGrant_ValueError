from fastapi import FastAPI
from fastapi import Depends, Query, Path, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from typing import Dict
import os
from dotenv import load_dotenv

load_dotenv()

import auth
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key_change_me")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

print(f"API module loading - Setting auth config:")
print(f"  SECRET_KEY: {'[SET]' if SECRET_KEY else '[NOT SET]'}")
print(f"  ACCESS_TOKEN_EXPIRE_MINUTES: {ACCESS_TOKEN_EXPIRE_MINUTES}")
print(f"  ALGORITHM: {ALGORITHM}")

auth.setValues(
    secret_key=SECRET_KEY,
    algorithm=ALGORITHM,
    access_token_expire_minutes=ACCESS_TOKEN_EXPIRE_MINUTES
)

from database import deleteItem, updateItem, getTable
from schemes import LoginRequest, UserCreate

app = FastAPI(title="SmartGrunt API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
@app.get("/")
async def root():
    return {"message": "SmartGrunt API is running", "version": "1.0.0", "docs": "/docs"}

@app.options("/{path:path}")
async def options_handler(path: str):
    return {"message": "OK"}


################################
@app.post("/auth/login")
async def login(login_data: LoginRequest):
    try:
        logs = await auth.login_user(login_data)
        return logs
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/auth/me")
async def get_current_user_info(user: Dict = Depends(auth.get_current_user)):
    return user

@app.post("/auth")
async def create_user(user_data: UserCreate):
    try:
        logs = await auth.reg(user=user_data)
        return logs
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

