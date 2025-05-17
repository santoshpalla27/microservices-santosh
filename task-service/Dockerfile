FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

# Pin the werkzeug version to be compatible with Flask
RUN pip install --no-cache-dir werkzeug==2.0.3
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]