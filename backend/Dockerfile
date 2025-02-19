FROM python:3.9-slim

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt requirements-test.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt -r requirements-test.txt

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 25043

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "25043"] 