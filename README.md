# GenReviewAI

GenReviewAI is an AI-powered restaurant review generation and sentiment analytics system.

The system allows restaurant customers to scan a QR code, provide a rating and feedback preferences, and generate natural Google review suggestions using Gemini AI and Retrieval-Augmented Generation (RAG).

The platform also performs sentiment analysis using a trained Machine Learning model and provides restaurant analytics through backend APIs.

## Features

- Restaurant registration and management
- QR code generation for restaurants
- AI-powered Google review generation
- Gemini AI integration
- Retrieval-Augmented Generation (RAG)
- Restaurant knowledge base
- Machine Learning sentiment analysis
- Positive, Negative, and Neutral sentiment prediction
- Private feedback collection
- Google Review redirect support
- Restaurant review analytics
- Dashboard metrics API
- Supabase database integration

## Tech Stack

### Backend
- Python
- FastAPI
- Uvicorn

### Artificial Intelligence
- Google Gemini API
- Retrieval-Augmented Generation (RAG)

### Machine Learning
- TensorFlow
- Scikit-learn
- TF-IDF Vectorization
- Sentiment Classification

### Database
- Supabase
- PostgreSQL

## Project Structure

    app/
    ├── ai/
    ├── analytics/
    ├── auth/
    ├── core/
    ├── dashboard/
    ├── database/
    ├── ml/
    │   ├── dataset/
    │   ├── models/
    │   ├── notebooks/
    │   └── predictor.py
    ├── qr/
    ├── rag/
    ├── restaurant/
    ├── review/
    ├── schemas/
    ├── tags/
    └── main.py

## Setup Instructions

Clone the repository:

    git clone https://github.com/vishwabhandare094-png/GenReviewAI.git

Move into the project directory:

    cd GenReviewAI

Create a virtual environment:

    python -m venv venv

Activate the virtual environment on Windows:

    venv\Scripts\activate

Install dependencies:

    pip install -r requirements.txt

## Environment Variables

Create a `.env` file in the project root.

Add the following variables:

    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_key
    GEMINI_API_KEY=your_gemini_api_key

Do not commit the `.env` file to GitHub.

## Run the Backend

Start the FastAPI development server:

    python -m uvicorn app.main:app --reload

Open Swagger API documentation:

    http://127.0.0.1:8000/docs

## Main API Modules

- Authentication
- Restaurant Management
- QR Code Generation
- AI Review Generation
- RAG Knowledge Base
- Sentiment Analysis
- Private Feedback
- Review Analytics
- Dashboard Metrics

## Customer Flow

    Scan QR Code
          ↓
    Select Star Rating
          ↓
    Select Review Tags
          ↓
    AI Generates Review Suggestions
          ↓
    Customer Copies Review
          ↓
    Redirect to Google Review Page

For low ratings or negative feedback, the system can collect private feedback for restaurant analytics.

## Developer

Vishwa Bhandare

Data Science | AI & Machine Learning