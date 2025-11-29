from pydantic import BaseModel


class Object(BaseModel):
    amount: int
    cost: float
    name: str
    categories: list


class PurchaseList(BaseModel):
    objects: list[Object]
    totalCost: int
