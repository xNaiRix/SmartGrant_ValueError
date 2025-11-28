import sqlite3
from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import date, datetime
import json
import os

DATABASE_PATH = "test.db"

def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def init_database():
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


def tableExists(tableName: str) -> bool:
    pass

def getTable(tableName: str, begin: int = 0, end: int = None) -> List[Dict]:
    pass

def createTable(tableName: str, table: List[Dict], schemes: Dict[str, str]) -> bool:
    pass

def deleteItem(tableName: str, id) -> bool:
    pass

def updateTable(tableName: str, table: List[Dict], schemes: Dict[str, str]) -> bool:
    pass



def getItem(tableName:str, id)->Optional[Dict]:
    pass

def createItem(tableName:str, item:BaseModel)->bool:
    pass

def deleteItem(tableName: str, id) -> bool:
    pass

def updateItem(tableName: str, id, newValue: BaseModel) -> bool:
    pass


if __name__ == "__main__" or True:
    init_database()