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
