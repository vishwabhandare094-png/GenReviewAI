from app.database.supabase import supabase, resolve_restaurant_id
from app.ai.gemini import client
from google.genai import types


def generate_embedding(text: str):

    response = client.models.embed_content(
        model="models/gemini-embedding-001",
        contents=text,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=768
        )
    )

    embedding = response.embeddings[0].values

    print("EMBEDDING DIMENSION:", len(embedding))

    return embedding


def add_knowledge(data):

    content = data.content.strip()

    if not content:
        return {
            "success": False,
            "message": "Knowledge content cannot be empty"
        }

    embedding = generate_embedding(content)

    restaurant_id = resolve_restaurant_id(data.restaurant_id)

    result = (
        supabase
        .table("knowledge_base")
        .insert({
            "restaurant_id": restaurant_id,
            "content": content,
            "embedding": embedding
        })
        .execute()
    )

    return {
        "success": True,
        "message": "Knowledge added successfully",
        "knowledge": result.data
    }

def retrieve_knowledge(restaurant_id, query: str):

    query = query.strip()

    if not query:
        return []

    query_embedding = generate_embedding(query)

    restaurant_id = resolve_restaurant_id(restaurant_id)

    result = (
        supabase
        .rpc(
            "match_restaurant_knowledge",
            {
                "query_embedding": query_embedding,
                "filter_restaurant_id": restaurant_id,
                "match_count": 3
            }
        )
        .execute()
    )

    return result.data