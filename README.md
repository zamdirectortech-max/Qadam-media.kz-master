# QADAM MEDIA

AI-powered social media management platform for creating one idea, adapting it with AI, approving it, and publishing everywhere.

## Project structure

```text
app/         Next.js pages and routes
components/  Shared interface components
lib/         Shared frontend data and utilities
backend/     FastAPI application
```

Folders such as `node_modules`, `.next`, `.pnpm-store`, and Python caches are generated locally and are not part of the source code.

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLAlchemy, PostgreSQL, Redis, Celery-ready service boundaries
- Architecture: i18n-ready UI, AI provider abstraction, social connector interface, billing service interface

## Run Frontend

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## One-command Windows startup

From PowerShell in the project directory, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-qadam.ps1
```

The script starts both the Next.js frontend and the FastAPI backend, waits for
ports `3000` and `8000`, and opens the website. The local development database
is stored in `backend/qadam.db`; PostgreSQL and Redis are not required for this
local mode.

To stop the application, close the started processes or run:

```powershell
Get-NetTCPConnection -LocalPort 3000,8000 -State Listen |
  ForEach-Object { Stop-Process -Id $_.OwningProcess }
```

## Run Backend

Install Python 3.12+, then:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Notes

Social publishing is intentionally connector-based. Unsupported platforms show `Integration coming soon` and never report fake successful publishing.
