# syntax=docker/dockerfile:1

FROM python:3.12-slim AS base

# Empêche Python d'écrire des .pyc et force les logs à sortir sans buffer
# (indispensable pour voir les logs en temps réel avec `docker logs`)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Dépendances système nécessaires à psycopg2 et à la compilation de certains
# paquets Python (évite de devoir utiliser psycopg2-binary en prod)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Récupère les fichiers statiques (admin Django, DRF browsable API) en un seul
# dossier servable — nécessaire car DEBUG=False en prod ne les sert plus lui-même
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# 3 workers Gunicorn : raisonnable pour une appli de cette taille ; à ajuster
# selon la RAM disponible sur l'hébergeur choisi (règle de base : 2×CPU + 1)
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
