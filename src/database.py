import sqlite3
from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import date, datetime
import json
import os

DATABASE_PATH = "test.db"

async def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

async def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

async def init_database():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        #Scientists
        cursor.execute(cursor.execute('''
            CREATE TABLE IF NOT EXISTS Scientists (
            email TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            info TEXT
            )
        '''))

        #Companies
        cursor.execute(cursor.execute('''
            CREATE TABLE IF NOT EXISTS Companies (
            email TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            info TEXT
            )
        '''))

        #continues...
    except:
        pass


async def tableExists(tableName: str) -> bool:
    pass

async def getTable(tableName: str, begin: int = 0, end: int = None) -> List[Dict]:
    pass

async def createTable(tableName: str, table: List[Dict], schemes: Dict[str, str]) -> bool:
    pass

async def deleteItem(tableName: str, id) -> bool:
    pass

async def updateTable(tableName: str, table: List[Dict], schemes: Dict[str, str]) -> bool:
    pass



async def getItem(tableName:str, id)->Optional[Dict]:#получать конкретную запись по PK -
    # надо ещё отдельную функцию для получения списка подходящих значений (где не по PK)
    if tableName == "Scientists":
        return {"email": "testScientist@mail.com", "full_name":"TEEESTER TESTOROVICH", "password": "$2b$12$IqCqIEI7tQ3o43ptcQT67O8aH9kmsIKmyMhhsujRxZrn8jrt78N.a",
                "info":"I'm the scientist in IT"}
    if tableName == "Companies":
        return {"email": "testCompany@mail.com", "name":"TEEEST COMPANY IT", "password": "$2b$12$IqCqIEI7tQ3o43ptcQT67O8aH9kmsIKmyMhhsujRxZrn8jrt78N.a",
                "info":"It's IT company"}
    return None
async def createItem(tableName:str, item:BaseModel)->bool:
    pass

async def deleteItem(tableName: str, id) -> bool:
    pass

async def updateItem(tableName: str, id, newValue: BaseModel) -> bool:
    pass


if __name__ == "__main__" or True:
    init_database()