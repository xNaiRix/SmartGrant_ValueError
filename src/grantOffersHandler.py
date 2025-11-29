from database import create_record, get_record, get_records, delete_records
from schemes import CreateGrantRequest

async def create_grant_offer(company_email:str, grant_offer:CreateGrantRequest):
    #createItem(tableName="Projects", item={})#нужно до конца понимать, как взаимодействие с бд происходит
    return {"status":"success", "id":1314, "message":"your project were created"}

async def delete_grant_offer(grant_offer_id:int):
    return {"status":"failed", "message":"this functions doesn't made yet"}

async def get_grant_offer(grant_offer_id:int):
    return {"status":"failed", "message":"this functions doesn't made yet"}

async def get_grant_offer(skip:int=0, limit:int=10):
    return {"status":"failed", "message": "this functions doesn't made yet"}