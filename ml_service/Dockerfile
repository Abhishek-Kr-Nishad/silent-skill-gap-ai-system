# Use official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install dependencies with no-cache to reduce image size
COPY requirements.txt /app/
RUN pip install --upgrade pip --no-cache-dir && pip install -r requirements.txt --no-cache-dir

# Copy project
COPY . /app/

# Expose port
EXPOSE 5000

# Run gunicorn with a single uvicorn worker to stay under 512MB RAM
CMD ["gunicorn", "app:app", "--workers", "1", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:5000", "--timeout", "120"]
