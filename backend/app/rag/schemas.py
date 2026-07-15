from pydantic import BaseModel
from uuid import UUID


class KnowledgeRequest(BaseModel):
    restaurant_id: str
    content: str


class SearchKnowledgeRequest(BaseModel):
    restaurant_id: str
    query: str