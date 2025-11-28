from pydantic import BaseModel,  HttpUrl
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime, date
import uuid

class CreateScientist(BaseModel):
    email: str
    password: str

class CreateCompany(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    role: Literal["scientist", "company"]
    data: CreateCompany|CreateScientist


class LoginRequest(BaseModel):
    email: str
    password: str
    role: Literal["scientist", "company"]

class UserProfileRequest(BaseModel):
    email:str
    role:Literal["scientist", "company"]
#############


class CreateGrantRequest(BaseModel):
    company_email:str
    ammount:int
    scientists_count:int
    visibility:Literal["PUBLIC", "PRIVATE"]


#########

class CreateProjectRequest(BaseModel):
    scientist_email:str
    name:str
    description:str
