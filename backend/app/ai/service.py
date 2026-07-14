from app.ai.gemini import generate_review
from app.rag.service import retrieve_knowledge


def generate_review_service(data):

    tags = ", ".join(data.selected_tags)

    # Create search query from customer feedback
    search_query = f"""
    Restaurant rating: {data.rating}/5
    Customer liked: {tags}
    """

    # Retrieve relevant restaurant knowledge using RAG
    knowledge_results = retrieve_knowledge(
        data.restaurant_id,
        search_query
    )

    # Extract knowledge content
    restaurant_context = "\n".join(
        item["content"]
        for item in knowledge_results
    )

    prompt = f"""
You are writing a genuine Google restaurant review based strictly on the customer's selected feedback.

Restaurant Rating:
{data.rating}/5

Customer Selected Feedback:
{tags}

Restaurant Background Information:
{restaurant_context}

Instructions:
- Generate exactly 3 different Google reviews.
- Each review must be 25 to 50 words.
- Sound like a natural real customer.
- Base the customer's personal experience ONLY on the selected feedback.
- Restaurant background information is context only.
- Never claim the customer ordered, ate, tried, tasted, or personally experienced a specific dish unless that exact dish is explicitly present in Customer Selected Feedback.
- Do not say a specific dish was delicious, flavorful, fresh, perfectly cooked, or amazing unless the customer explicitly selected that dish.
- You may use general restaurant facts naturally, such as cuisine type or general ambience, only when they do not create a false personal experience.
- Do not invent food items, dishes, services, or customer experiences.
- Do not mention AI, RAG, context, knowledge base, selected tags, or provided information.
- No emojis.
- No numbering.
- No headings.
- Separate each review using ###.
"""

    print("========== RAG CONTEXT ==========")
    print(restaurant_context)

    print("========== PROMPT ==========")
    print(prompt)

    response = generate_review(prompt)

    print("========== GEMINI RESPONSE ==========")
    print(response)

    reviews = [
        review.strip()
        for review in response.split("###")
        if review.strip()
    ]

    return {
        "success": True,
        "rag_context": restaurant_context,
        "review_options": reviews
    }