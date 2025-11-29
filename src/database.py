import aiosqlite
import asyncio
import os
from dotenv import load_dotenv
from typing import List, Optional, Dict
from pathlib import Path

load_dotenv()
BASE_DIR = Path(__file__).parent
DATABASE_PATH = os.getenv("DATABASE_URL", str(BASE_DIR / "database.db"))


async def get_connection():
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    print(f"Database will be created at: {DATABASE_PATH}")
    conn = await aiosqlite.connect(DATABASE_PATH)
    await conn.execute("PRAGMA foreign_keys = ON")
    return conn

PRIVATE_VISIBILITY = 0
PUBLIC_VISIBILITY = 1

REQUESTED_STATUS = 0
OFFERED_STATUS = 1
AGREED_STATUS = 2
PAID_STATUS = 3
_db_initialized = False

async def init_database():
    global _db_initialized
    if _db_initialized:
        return
    conn = await get_connection()
    await conn.execute('PRAGMA foreign_keys = ON')
    try:
        #Companies
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS Companies (
                email TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                info TEXT
            )''')

        #GrantOffers
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS GrantOffers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_email TEXT NOT NULL,
                amount REAL NOT NULL,
                offers_number INTEGER NOT NULL,
                visibility INTEGER CHECK (visibility >= 0 AND visibility <= 1),
                FOREIGN KEY (company_email) REFERENCES Companies(email)
            )''')
        
        #Scientists
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS Scientists (
                email TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                full_name TEXT NOT NULL,
                info TEXT
            )''')

        #Projects
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS Projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scientist_email TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                estimate_id INT,
                FOREIGN KEY (scientist_email) REFERENCES Scientists(email),
                FOREIGN KEY (estimate_id) REFERENCES Estimates(id)
            )''')

        #Funds
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS Funds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                grant_offer_id INTEGER NOT NULL,
                status INTEGER CHECK (status >= 0 AND status <= 3),
                FOREIGN KEY (project_id) REFERENCES Projects(id),
                FOREIGN KEY (grant_offer_id) REFERENCES GrantOffers(id)
            )''')

        #Estimates
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS Estimates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                total_amount REAL CHECK (total_amount >= 0)
            )''')

        #EstimateRecords
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS EstimateRecords (
                estimate_id INTEGER NOT NULL,
                price REAL CHECK (price >= 0),
                count INTEGER CHECK (count > 0),
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                FOREIGN KEY (estimate_id) REFERENCES Estimates(id)
            )''')

        await conn.commit()
        await conn.close()
        _db_initialized = True
    except Exception as e:
        raise e

async def get_record(table_name, **parameters):
    keys, values = list(zip(*parameters.items()))
    request = f'SELECT * FROM {table_name} WHERE ' + ' AND '.join(f'{key} = ?' for key in keys)
    try:
        conn = await get_connection()
        cursor = await conn.execute(request, values)
        row = await cursor.fetchone()
        await cursor.close()
        if row is None:
            return None
        columns = [description[0] for description in cursor.description]
        return dict(zip(columns, row))
        #return dict(row)
    except Exception as e:
        print(f"Error in get_record: {e}")
        return None
    finally:
        if conn:
            await conn.close()

async def get_records(table_name, skip=None, limit=None, **parameters):
    keys, values = list(zip(*parameters.items()))
    request = f'SELECT * FROM {table_name} WHERE ' + ' AND '.join(f'{key} = ?' for key in keys)
    if limit is not None:
        request += f' LIMIT {limit} OFFSET {skip}'
    try:
        conn = await get_connection()
        await conn.execute(request, values)
        rows = await conn.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        return

async def create_record(table_name, **parameters):
    keys, values = list(zip(*parameters.items()))
    request = f'INSERT INTO {table_name} ({", ".join(keys)}) VALUES ({", ".join("?" for value in values)})'
    try:
        conn = await get_connection()
        await conn.execute(request, values)
        await conn.commit()
        await conn.close()
        return True
    except Exception as e:
        raise False

async def delete_records(table_name, **parameters):
    keys, values = list(zip(*parameters.items()))
    request = f'DELETE FROM {table_name} WHERE ' + ' AND '.join(f'{key} = ?' for key in keys)
    try:
        conn = await get_connection()
        await conn.execute(request, values)
        await conn.commit()
        await conn.close()
        return True
    except Exception as e:
        return False
