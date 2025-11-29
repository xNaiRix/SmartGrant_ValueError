from pydantic import BaseModel,  HttpUrl
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime, date
import uuid

class CreateScientist(BaseModel):
    email: str
    password: str
    full_name: Optional[str]
    info:Optional[str]

class CreateCompany(BaseModel):
    email: str
    password: str
    name: Optional[str]
    info: Optional[str]

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
    name:str
    description:str
    estimate:List[Dict]
    total_fund:int

class CreateFundRequest(BaseModel):
    grant_offer_id:int
    project_id:int
