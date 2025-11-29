from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
import os
from dotenv import load_dotenv
from database import init_database
import asyncio
import auth

async def initialize_app():
    await init_database()
    from api import app
    return app

if __name__ == "__main__":
    load_dotenv()
    API_PORT = int(os.getenv("API_PORT", "8000"))
    print(f"Database path: {os.getenv('DATABASE_URL', 'database.db')}")
    
    app = asyncio.run(initialize_app())
    
    logging.basicConfig(level=logging.INFO)
    
    uvicorn.run(
        "api:app", 
        host="10.82.128.221",
        port=API_PORT,
        reload=True,
        log_level="info",
        access_log=True,
    )