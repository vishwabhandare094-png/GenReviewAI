# GenReviewAI

GenReviewAI is an AI-powered customer review generation and sentiment analytics platform. It helps businesses and restaurants collect high-quality Google reviews by generating personalized review suggestions using Google Gemini AI, while capturing lower-rated feedback privately to protect brand reputation.

---

## Technical Stack & Skills

- **Backend:** Python, FastAPI, REST APIs, JWT Authentication, Pydantic, SQLAlchemy, Uvicorn
- **AI & RAG:** Google Gemini 1.5 Flash, pgvector Vector Database, Text Embeddings (gemini-embedding-001)
- **Machine Learning & NLP:** TensorFlow, Keras, TF-IDF Vectorizer, Scikit-learn, Pandas, NumPy
- **Database:** Supabase, PostgreSQL (with DDL, constraints, and custom functions)
- **Frontend:** Next.js 14, React, Tailwind CSS, TypeScript, HTML5, CSS3
- **Tools:** Git, GitHub, Render, Uvicorn, NPM

---

## Core Features

- **Owner Authentication:** Secure registration and login using JWT tokens and hashed passwords.
- **Restaurant Profile Setup:** Register business locations with direct Google review redirection links.
- **Dynamic QR Code Generation:** Real-time generation of QR codes linking to the customer rating page.
- **Smart Feedback Routing:** 
  - Ratings $\ge$ 4.0 route to AI-assisted public review generation.
  - Ratings < 4.0 route to a private owner feedback form.
- **Gemini AI Review Generator:** Generates 3 natural-sounding review options based on customer-selected tags.
- **RAG (Retrieval-Augmented Generation):** Matches review context against restaurant details (menus, specials) for accurate drafts.
- **Sentiment Analytics Dashboard:** Real-time metrics showing total scans, average rating, positive/negative reviews, and sentiment distribution using a custom TensorFlow classification model.

---

## Project Structure

```
GenReviewAI/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── ai/              # Gemini AI review generation
│   │   ├── analytics/        # Business intelligence endpoints
│   │   ├── auth/             # JWT auth & user management
│   │   ├── dashboard/        # Metrics aggregation
│   │   ├── ml/               # Sentiment prediction (TensorFlow/Keras)
│   │   ├── qr/               # QR Code generator
│   │   ├── rag/              # Vector search (pgvector)
│   │   ├── restaurant/       # Restaurant management
│   │   ├── review/           # Review collection
│   │   └── tags/             # Customer feedback tag config
│   ├── requirements.txt      # Backend dependencies
│   └── .env.example
├── frontend/                 # Next.js Application
│   ├── app/                  # App Router views (Owner dashboard & Customer flows)
│   ├── components/           # Modular UI elements
│   ├── lib/                  # API communication layer
│   └── package.json          # Node dependencies
├── README.md                 # Project documentation
├── requirements.txt          # Root-level deployment requirements
└── main.py                   # Root-level entry point wrapper
```

---

## Setup & Local Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase account with PostgreSQL database
- Google Gemini API Key

### 1. Backend Setup
1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure the environment variables by copying `.env.example` to `.env` and updating the credentials.
5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

### 2. Frontend Setup
1. Open a terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Configure the environment variables by copying `.env.example` to `.env.local`.
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

---

## Render Deployment Guide

To deploy the backend to **Render**, you have two options:

### Option A: Standard Root-Level Deployment (Recommended)
By default, Render builds from the root of the repository. With the newly added root files, you can deploy using these settings:
1. **Runtime:** `Python 3`
2. **Build Command:** `pip install -r requirements.txt`
3. **Start Command:** `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker` (or `uvicorn main:app --host 0.0.0.0 --port $PORT`)

### Option B: Using Backend Subdirectory Settings
Alternatively, you can direct Render to build directly from the `backend/` folder:
1. Go to **Settings** $\rightarrow$ **Root Directory** in your Render dashboard and set it to:
   ```text
   backend
   ```
2. **Build Command:** `pip install -r requirements.txt`
3. **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
