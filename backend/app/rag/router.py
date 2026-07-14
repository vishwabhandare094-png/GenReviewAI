from fastapi import APIRouter

from .schemas import KnowledgeRequest, SearchKnowledgeRequest
from .service import add_knowledge, retrieve_knowledge


router = APIRouter(
    prefix="/rag",
    tags=["RAG Knowledge Base"]
)


@router.post("/knowledge")
def create_knowledge(request: KnowledgeRequest):
    return add_knowledge(request)


@router.post("/search")
def search_knowledge(request: SearchKnowledgeRequest):

    knowledge = retrieve_knowledge(
        request.restaurant_id,
        request.query
    )

    return {
        "success": True,
        "knowledge": knowledge
    }