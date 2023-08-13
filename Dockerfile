FROM python:3.10-bullseye

RUN pip install --upgrade pip

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY city_list.txt .

CMD ["uvicorn", "app.server:app", "--host", "0.0.0.0"]