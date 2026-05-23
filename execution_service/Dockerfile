FROM python:3.11-slim

# Install compilers and runtimes for C++, Java, Node.js
RUN apt-get update && apt-get install -y \
    g++ \
    default-jre \
    default-jdk \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy service files
COPY . .

# Expose port
EXPOSE 5001

# Start the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5001"]
