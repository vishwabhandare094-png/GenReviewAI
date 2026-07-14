# GenReviewAI

**GenReviewAI** is an AI-powered customer review routing and sentiment analytics platform designed for businesses and restaurants. By leveraging large language models and machine learning, the system helps businesses maximize high-quality public Google reviews while capturing critical private feedback from dissatisfied customers to protect brand reputation.

---

## 🛠️ Technical Stack & Developer Skills

This project is built using a modern, scalable stack spanning Backend, Frontend, AI/ML, and Database engineering:

*   **Backend & APIs:** Python 3.10+, FastAPI, RESTful APIs, JWT Authentication (HS256), Pydantic, SQLAlchemy ORM
*   **AI & RAG (Retrieval-Augmented Generation):** Google Gemini 1.5 Flash, Supabase Vector/pgvector, Google Text Embeddings (`gemini-embedding-001`)
*   **Machine Learning & NLP:** TensorFlow, Keras, Scikit-Learn, TF-IDF Vectorizer, Pandas, NumPy
*   **Database & Storage:** Supabase, PostgreSQL (with DDL schemas, constraints, and custom SQL functions)
*   **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, HTML5, CSS3, QR Code generation
*   **DevOps & Deployment:** Render, Git, Uvicorn, Gunicorn, Pip/NPM

---

## 🚀 Key Engineering Accomplishments (ATS-Friendly)

*   **Smart Feedback Routing Engine:** Designed and implemented a smart routing mechanism. Ratings $\ge$ 4.0 dynamically guide customers to generate AI-assisted Google Reviews, while ratings < 4.0 route feedback to a private owner inbox, protecting brand reputation.
*   **RAG-Enhanced Review Generation:** Integrated Google Gemini 1.5 Flash API with a pgvector database to match review context against restaurant details (menus, special offers), generating highly accurate and customized review drafts.
*   **Sentiment Classifier:** Trained and deployed an offline TensorFlow/Keras neural network for sentiment analysis (Positive, Neutral, Negative) using TF-IDF feature vectors, enabling real-time dashboard analytics.
*   **Secure Authentication & Session Management:** Configured secure user registration and login using JWT tokens and hashed passwords (bcrypt/passlib).
*   **Real-time Analytics Dashboard:** Designed backend API endpoints to calculate and stream operational metrics, including scan counts, rating averages, and sentiment distribution.

---

## 📐 System Workflow & Architecture

```
                 [Customer Scans QR Code]
                            │
                            ▼
                  [Submits Star Rating]
                 /                     \
      (Rating >= 4.0)               (Rating < 4.0)
           /                             \
          ▼                               ▼
[Select Feedback Tags]           [Private Feedback Form]
          │                               │
          ▼                               ▼
[RAG Context Matching]           [Saved to Database]
          │                               │
          ▼                               ▼
[Gemini 1.5 Flash Suggestions]    [Owner Notified via Dashboard]
          │
          ▼
[Copy to Clipboard & Google Redirect]
```

---

## 📂 Project Structure

```text
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

## 🔧 Setup & Local Installation

### Prerequisites
*   Python 3.10+
*   Node.js 18+
*   Supabase account with PostgreSQL database
*   Google Gemini API Key

### 1. Backend Setup
1.  Navigate to the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure environment variables by copying `.env.example` to `.env` and updating the values.
5.  Start the FastAPI server:
    ```bash
    uvicorn app.main:app --host 127.0.0.1 --port 8000
    ```

### 2. Frontend Setup
1.  Navigate to the `frontend/` directory:
    ```bash
    cd frontend
    ```
2.  Install npm packages:
    ```bash
    npm install
    ```
3.  Configure environment variables by copying `.env.example` to `.env.local`.
4.  Start the Next.js development server:
    ```bash
    npm run dev
    ```

---

## ☁️ Production Deployment on Render

This project is optimized for deployment on **Render** (e.g., as a Web Service).

### Deployment Settings (Root Directory)
To deploy the backend from the root of the repository:
1.  **Runtime:** `Python 3`
2.  **Build Command:** `pip install -r requirements.txt`
3.  **Start Command:** `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker`
4.  **Environment Variables:**
    *   `SUPABASE_URL`: Your Supabase Project URL
    *   `SUPABASE_KEY` or `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
    *   `GEMINI_API_KEY`: Your Google Gemini API Key
