# Playto Challenge (Django + React)

## Repository layout

- `backend/` — Django REST API
- `frontend/` — React + Vite client

## Run locally

### 1) Backend

From `backend/`:

1. Create a virtual environment.
2. Install dependencies from `requirements.txt`.
3. Run migrations.
4. Start Django server on port 8000.

The API should be available at `http://localhost:8000`.

### 2) Frontend

From `frontend/`:

1. Install Node dependencies.
2. Create `frontend/.env.local` and set:
   - `VITE_API_BASE_URL=http://localhost:8000`
3. Start the Vite dev server.

The frontend will call the backend with Bearer token auth.

## Optional: run backend with Docker

A Docker setup is available in `backend/docker-compose.yml` (Postgres + Django).

## Notes

- Backend README: `backend/README.md`
- Frontend backend-connection notes: `frontend/RUN_AGAINST_BACKEND.md`
- Deliverable explainer: `EXPLAINER.md`
