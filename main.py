import sys
import os

# Add backend directory to path so imports work correctly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the FastAPI application
from app.main import app

if __name__ == "__main__":
    import uvicorn
    # Get port from environment or default to 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
