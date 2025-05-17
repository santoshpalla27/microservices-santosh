FROM python:3.9-slim

WORKDIR /app

# Instead of using a requirements file, install specific compatible versions
RUN pip install --no-cache-dir \
    flask==2.0.3 \
    werkzeug==2.0.3 \
    flask-sqlalchemy==2.5.1 \
    flask-cors==3.0.10 \
    pymysql==1.0.3 \
    cryptography==40.0.1

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]