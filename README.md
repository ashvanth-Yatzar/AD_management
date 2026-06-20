# Advertisement Management System

Enterprise-grade full-stack Advertisement Management System built with FastAPI + React 19.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, TanStack Query, TanStack Table, React Hook Form, Zod, Tailwind CSS, Shadcn UI |
| Backend | FastAPI, SQLAlchemy 2, PostgreSQL, Alembic, Pydantic V2 |
| Exports | OpenPyXL (Excel), ReportLab (PDF), python-docx (Word) |

## Architecture Patterns

- **Feature-Based Architecture** — every module is isolated under `features/`
- **Repository Pattern** — all DB access through `AdvertisementRepository`
- **Service Layer** — business logic isolated from HTTP layer
- **DTO Pattern** — Pydantic schemas as request/response contracts
- **Centralized Error Handling** — global exception handlers
- **Custom Hooks** — reusable React Query hooks per operation
- **Shared Components** — UI primitives + table + modals

## Quick Start

### Backend

```bash
cd backend

# 1. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
# Edit .env with your PostgreSQL connection string

# 4. Run migrations
alembic upgrade head

# 5. Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

App available at: http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/advertisements | Create advertisement |
| GET | /api/v1/advertisements | List with pagination/filtering |
| GET | /api/v1/advertisements/{id} | Get single |
| PUT | /api/v1/advertisements/{id} | Update |
| DELETE | /api/v1/advertisements/{id} | Soft delete |
| GET | /api/v1/advertisements/export/excel | Export Excel |
| GET | /api/v1/advertisements/export/pdf | Export PDF |
| GET | /api/v1/advertisements/export/word | Export Word |

Add `?ids=id1,id2` to export endpoints for page-scoped exports.

## Features

- Rich text editor (React Quill) with bold, italic, underline, lists, links, alignment, headings
- Image upload with drag & drop, preview, validation (JPG/PNG/WebP, max 10MB)
- URL media with type detection (image/video/website) and preview
- Auto-calculated end date based on plan type
- Server-side pagination, search, filtering, sorting
- Soft delete with confirmation modal
- Export to Excel/PDF/Word (current page or all records)
- JWT-ready architecture (extend `security.py`)
