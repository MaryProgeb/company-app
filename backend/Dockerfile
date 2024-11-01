FROM python:3.13-alpine

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

COPY REQUIREMENTS /app/

RUN apk add --virtual .build-deps --no-cache postgresql-dev gcc python3-dev musl-dev && \
        pip install --no-cache-dir -r REQUIREMENTS && \
        apk --purge del .build-deps

COPY . /app/

ENTRYPOINT python manage.py migrate && \
  python manage.py loaddata companies && \
  python manage.py runserver 0.0.0.0:8000
