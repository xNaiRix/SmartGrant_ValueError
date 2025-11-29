from fastapi import FastAPI, Request, Response
from fastapi import Depends, Query, Path, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from typing import Dict
import time
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

import projectsHandler
import grantOffersHandler
import fundsHandler
from logger import logger

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
    logger.info("Get /me info", extra={
        'extra_data': {'user_email': user.get("email")}
    })
    return user

@app.post("/auth")
async def create_user(user_data: UserCreate):
    try:
        logger.info("Registr attempt", extra={
            'extra_data': {
                'email': user_data.data.email,
                'role': user_data.role
            }
        })
        logs = await auth.reg(user=user_data)
        return logs
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
@app.get("/auth/profile")
async def get_current_user_profile(user:Dict = Depends(auth.get_current_user)):
    logger.info("Get user profile", extra={
        'extra_data': {'user_email': user.get("email")}
    })
    return await auth.get_current_user_profile(user)


##########################grantOffers
@app.post("/requests/grants/")
async def create_grant(grant_offer: CreateProjectRequest, user: Dict = Depends(auth.get_current_user)):
    logger.info("Create grant offer", extra={
        'extra_data': {'user_email': user.get('email')}
    })
    
    if not await auth.verify_role(user=user, allowed=["company"]):
        logger.warning("Permission denied for grant creation", extra={
            'extra_data': {
                'user_email': user.get('email'),
                'required_role': 'company'
            }
        })
        raise HTTPException(status_code=403, detail="Not enough rights")
    
    return await grantOffersHandler.create_grant_offer(company_email=user["email"])

@app.delete("/requests/grants/{grant_id}")
async def delete_grant(grant_id: int, user: Dict = Depends(auth.get_current_user)):
    logger.info("Delete grant offer", extra={
        'extra_data': {
            'user_email': user.get('email'),
            'grant_id': grant_id
        }
    })
    if not await auth.verify_role(user=user, allowed=["company"]):
        logger.warning("Permission denied for grant deletion", extra={
            'extra_data': {
                'user_email': user.get('email'),
                'grant_id': grant_id,
                'required_role': 'company'
            }
        })
        raise HTTPException(status_code=403, detail="Not enough rights")
    
    return await grantOffersHandler.delete_grant_offer(grant_offer_id=grant_id)

@app.get("/requests/grants/{grant_id}")
async def get_grant(grant_id:int):
    logger.info("Get grant offer", extra={
        'extra_data': {'grant_id': grant_id}
    })
    return await grantOffersHandler.get_grant_offer(grant_offer_id=grant_id)

@app.get("/requests/grants/list")
async def get_grants(skip:int=0, limit:int=10):
    logger.info("Get grants list", extra={
        'extra_data': {'skip': skip, 'limit': limit}
    })
    return await grantOffersHandler.get_grant_offer(skip=skip, limit=limit)


###########################projects
@app.post("/requests/projects/")
async def create_project(project: CreateProjectRequest, user: Dict = Depends(auth.get_current_user)):
    logger.info("Create project", extra={
        'extra_data': {'user_email': user.get('email')}
    })
    
    if not await auth.verify_role(user=user, allowed=["scientist"]):
        logger.warning("Permission denied for project creation", extra={
            'extra_data': {
                'user_email': user.get('email'),
                'required_role': 'scientist'
            }
        })
        raise HTTPException(status_code=403, detail="Not enough rights")
    
    return await projectsHandler.create_project(scientist_email=user["email"], project=project)

@app.delete("/requests/projects/{project_id}")
async def delete_project(project_id: int, user: Dict = Depends(auth.get_current_user)):
    logger.info("Delete project", extra={
        'extra_data': {
            'user_email': user.get('email'),
            'project_id': project_id
        }
    })
    
    if not await auth.verify_role(user=user, allowed=["scientist"]):
        logger.warning("Permission denied for project deletion", extra={
            'extra_data': {
                'user_email': user.get('email'),
                'project_id': project_id,
                'required_role': 'scientist'
            }
        })
        raise HTTPException(status_code=403, detail="Not enough rights")
    
    return await projectsHandler.delete_project(project_id)

@app.get("/requests/projects/{project_id}")
async def get_project(project_id: int):
    logger.info("Get project", extra={
        'extra_data': {'project_id': project_id}
    })
    return await projectsHandler.get_project(project_id)

@app.get("/requests/projects/list")
async def get_projects(skip: int = 0, limit: int = 10):
    logger.info("Get projects list", extra={
        'extra_data': {'skip': skip, 'limit': limit}
    })
    return await projectsHandler.get_projects(skip=skip, limit=limit)

########################### funds
@app.post("/request/funds")
async def create_fund(fund_request: CreateFundRequest, user: Dict = Depends(auth.get_current_user)):
    logger.info("Create fund request", extra={
        'extra_data': {'user_email': user.get('email')}
    })
    pass