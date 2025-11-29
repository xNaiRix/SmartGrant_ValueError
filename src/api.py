from fastapi import FastAPI, Request, Response
from fastapi import Depends, Query, Path, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from typing import Dict
import time
import os
from dotenv import load_dotenv

load_dotenv()

import auth
import projectsHandler
import grantOffersHandler
import fundsHandler
from logger import logger

from database import deleteItem, updateItem, getTable
from schemes import LoginRequest, UserCreate, CreateProjectRequest, CreateFundRequest


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
    #print(auth.hash_password("123456789Aa"))
    logger.info("Root endpoint accessed")
    for handler in logger.handlers:
        handler.flush()
    return {"message": "SmartGrunt API is running", "version": "1.0.0", "docs": "/docs"}

@app.get("/favicon.ico")
async def favicon():
    logger.debug("Favicon.ico requested - returning 204 No Content")
    return Response(status_code=204)

@app.options("/{path:path}")
async def options_handler(path: str):
    logger.debug("OPTIONS request", extra={'extra_data': {'path': path}})
    return {"message": "OK"}


################################ auth
@app.post("/auth/login")
async def login(login_data: LoginRequest):
    try:
        logger.info("Login attempt", extra={
            'extra_data': {
                'email': login_data.email,
                'role': login_data.role
            }
        })
        logs = await auth.login_user(login_data)
        if logs.get('status') == 'success':
            logger.info("Login successful", extra={
                'extra_data': {'email': login_data.email}
            })
        else:
            logger.warning("Login failed", extra={
                'extra_data': {
                    'email': login_data.email,
                    'reason': logs.get('message')
                }
            })
            
        return logs
    except Exception as e:
        print(f"Login error: {e}")
        logger.error("Login error", extra={
            'extra_data': {
                'email': login_data.email,
                'error': str(e)
            }})
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/auth/me")
async def get_current_user_info(user: Dict = Depends(auth.get_current_user)):
    logger.info("")
    return user

@app.post("/auth")
async def create_user(user_data: UserCreate):
    try:
        logs = await auth.reg(user=user_data)
        return logs
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
@app.get("/auth/profile")
async def get_current_user_profile(user:Dict = Depends(auth.get_current_user)):
    return await auth.get_current_user_profile(user)


##########################grantOffers
@app.post("/requests/grants/")
async def create_grant(grant_offer:CreateProjectRequest, user:Dict = Depends(auth.get_current_user)):
    if not await auth.verify_role(user=user, allowed = ["company"]):
        raise HTTPException(status_code=403, detail="Not enough rights")
    return await grantOffersHandler.create_grant_offer(company_email=user["email"])

@app.delete("/requests/grants/{grant_id}")
async def delete_grant(grant_id:int, user:Dict = Depends(auth.get_current_user)):
    if not await auth.verify_role(user=user, allowed = ["company"]):
        raise HTTPException(status_code=403, detail="Not enough rights")
    return await grantOffersHandler.delete_grant_offer(grant_offer_id=grant_id)

@app.get("/requests/grants/{grant_id}")
async def get_grant(grant_id:int):
    return await grantOffersHandler.get_grant_offer(grant_offer_id=grant_id)

@app.get("/requests/grants/list")
async def get_grants(skip:int=0, limit:int=10):
    return await grantOffersHandler.get_grant_offer(skip=skip, limit=limit)


###########################projects
@app.post("/requests/projects/")
async def create_project(project:CreateProjectRequest, user:Dict = Depends(auth.get_current_user)):
    if not await auth.verify_role(user=user, allowed = ["scientist"]):
        raise HTTPException(status_code=403, detail="Not enough rights")
    return await projectsHandler.create_project(scientist_email=user["email"], project=project)

@app.delete("/requests/projects/{project_id}")
async def delete_project(grant_id:int, user:Dict = Depends(auth.get_current_user)):
    if not await auth.verify_role(user=user, allowed = ["scientist"]):
        raise HTTPException(status_code=403, detail="Not enough rights")
    return await projectsHandler.delete_project(grant_id)

@app.get("/requests/projects/{project_id}")
async def get_project(grant_id:int):
   return await projectsHandler.get_project(grant_id)

@app.get("/requests/projects/list")
async def get_projects(skip:int=0, limit:int=10):
    return await projectsHandler.get_projects(skip=skip, limit=limit)


###########################funds
@app.post("/request/funds")
async def create_fund(project:CreateFundRequest, user:Dict = Depends(auth.get_current_user)):
    pass
    
