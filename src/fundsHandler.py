from database import createItem, getItem, deleteItem,updateItem
from schemes import CreateFundRequest

async def create_fund(project_id:int, grant_offer_id:int):
    #createItem(tableName="Funds", item={})#нужно до конца понимать, как взаимодействие с бд происходит
    return {"status":"success", "id":1314, "message":"your project were created"}

async def delete_fund(project_id:int, grant_offer_id:int):
    return {"status":"failed", "message":"this functions doesn't made yet"}