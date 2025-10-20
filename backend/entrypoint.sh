#!/bin/sh
# Wait until PostgreSQL is ready

echo "⏳ Waiting for PostgreSQL to be ready..."

while ! pg_isready -h database -p 5430 -U gidb_user; do
  sleep 1
done

echo "✅ PostgreSQL is ready. Starting app..."

exec uvicorn app.main:app --host 0.0.0.0 --port 80