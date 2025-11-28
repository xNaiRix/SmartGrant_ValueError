from database import createItem, getItem, deleteItem,updateItem
from schemes import CreateProjectRequest

async def create_project(scientist_email:str, project:CreateProjectRequest):
    #createItem(tableName="Projects", item={})#нужно до конца понимать, как взаимодействие с бд происходит
    return {"status":"success", "id":1314, "message":"your project were created"}

async def delete_project(project_id:int):
    return {"status":"failed", "message":"this functions doesn't made yet"}

async def get_project(project_id:int):
    return {"status":"failed", "message":"this functions doesn't made yet"}

async def get_progects(skip:int=0, limit:int=10):
    return {"status":"failed", "message": "this functions doesn't made yet"}