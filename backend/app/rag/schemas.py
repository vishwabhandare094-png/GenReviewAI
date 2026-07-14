from pydantic import BaseModel
from uuid import UUID


class KnowledgeRequest(BaseModel):
    restaurant_id: UUID
    content: str


class SearchKnowledgeRequest(BaseModel):
    restaurant_id: UUID
    query: str