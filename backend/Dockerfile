FROM python:3.14-alpine

WORKDIR /etc/taskly/backend

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["fastapi", "run", "src/main.py"]