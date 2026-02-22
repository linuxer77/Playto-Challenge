# Playto Backend

1. Create and activate a virtual environment in the project root (`playto/.venv` recommended).
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Copy env template and adjust values if needed:
   - `cp .env.example .env`
4. Run migrations:
   - `python manage.py migrate`
5. Start dev server:
   - `python manage.py runserver`

Notes:

- If `DJANGO_ALLOWED_HOSTS` is empty and `DJANGO_DEBUG=True`, localhost defaults are applied.
- WhiteNoise is optional for local usage. If installed, static files are served with WhiteNoise settings automatically.
