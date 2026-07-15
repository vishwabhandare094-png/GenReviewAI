import os

# Render automatically sets the PORT environment variable.
# We bind Gunicorn to all interfaces (0.0.0.0) on this port.
port = os.environ.get("PORT", "10000")
bind = f"0.0.0.0:{port}"

# Configure workers and uvicorn runner class
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
keepalive = 120
timeout = 120
