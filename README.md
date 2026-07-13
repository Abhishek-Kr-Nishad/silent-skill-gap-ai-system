# Silent Skill Gap AI - Advanced ATS Resume Coach

An AI-powered ATS (Applicant Tracking System) Resume Analyzer and Career Coach comparable to Jobscan. This system allows candidates to upload their resumes, provide job descriptions (either text or file), receive a detailed score blueprint, perform line-by-line analyses, replace weak words interactively, and download optimized resumes in DOCX or reports in PDF.

---

## Project Architecture

The application is structured as a decoupled multi-service system:

```mermaid
graph TD
    Client[React + Vite Frontend] -->|HTTP / JSON| API[Django REST Framework Backend]
    API -->|DB Queries| DB[(PostgreSQL Neon)]
    API -->|Semantic NLP / GenAI Requests| ML[FastAPI ML Service]
    ML -->|LLM Prompts| Gemini[Gemini 1.5 API]
    API -->|Code Sandbox Submissions| Exec[FastAPI Execution Service]
```

### 1. Frontend (React + Vite)
- **Styling**: Tailwind CSS with custom purple/indigo design.
- **Charts & Visualization**: Recharts (Radar, Gauge) for aptitude blueprint.
- **Animations**: Framer Motion for sleek tab transitions and loading indicators.

### 2. Backend (Django + REST Framework)
- **Database**: PostgreSQL (with local sqlite development fallback).
- **Core Models**: `User`, `Profile`, `ResumeReport` (storing analysis history and rewritten variations).
- **Downloads**: Generates PDF reports using `reportlab` and DOCX files using `python-docx`.

### 3. ML Service (FastAPI)
- **Engines**: Gemini 1.5 Flash API for semantic scanning.
- **Prompt Engineering**: Dynamic JSON outputs for parsing, sentence review, keyword clouds, and rewrite generation.

---

## Folder Structure

```text
silent-skill-gap-ai-system/
├── backend/                  # Django Web API Backend
│   ├── config/               # Settings, WSGI/ASGI configurations
│   └── core/                 # Django App: Models, Views, Serializers, URLs
├── frontend/                 # React + Vite Frontend App
│   ├── src/
│   │   ├── components/       # Reusable layout and theme items
│   │   ├── pages/            # View Pages (e.g. ResumeAnalyzer.jsx)
│   │   └── utils/            # Axios API config
├── ml_service/               # FastAPI ML Service
│   ├── app.py                # Router endpoints
│   ├── ats_analyzer.py       # Gemini prompt engineering & parsing
│   └── analyzer.py           # Traditional PDF/DOCX extractors
├── execution_service/        # Python/JS code execution sandbox
└── docker-compose.yml        # Orchestration configurations
```

---

## API Documentation

### Resume & Coach Endpoints

All endpoints require JWT authorization headers (`Authorization: Bearer <token>`).

#### 1. `POST /api/resume/upload/`
- **Description**: Uploads a resume document and extracts its raw string representation.
- **Payload**: Multipart form-data with key `resume` (PDF, DOCX, or TXT).
- **Response**:
  ```json
  {
    "resume_text": "...",
    "resume_name": "resume.pdf"
  }
  ```

#### 2. `POST /api/resume/job-description/`
- **Description**: Uploads a Job Description document or text, returning clean plain text.
- **Payload**: Multipart form-data with key `job_description_file` (file) or JSON with key `job_description_text` (string).
- **Response**:
  ```json
  {
    "jd_text": "..."
  }
  ```

#### 3. `POST /api/resume/analyze/`
- **Description**: Analyzes resume against job description or generic target role constraints. Saves report in database.
- **Payload**:
  ```json
  {
    "resume_text": "...",
    "jd_text": "...",
    "target_role": "Software Engineer",
    "resume_name": "resume.pdf"
  }
  ```
- **Response**: Detailed `ResumeReportSerializer` object with scores, keyword cloud, parser metadata, and line-by-line sentence feedback.

#### 4. `POST /api/resume/rewrite/`
- **Description**: Rewrites the resume in four distinct versions (Optimized, Tailored, Keyword Optimized, Interview Ready).
- **Payload**:
  ```json
  {
    "report_id": 1,
    "resume_text": "...",
    "jd_text": "...",
    "target_role": "Software Engineer"
  }
  ```
- **Response**: Four variations formatted in Markdown.

#### 5. `GET /api/resume/history/`
- **Description**: Retrieves history logs for the current user.
- **Response**: Array of report items containing `id`, `resume_name`, `target_role`, `ats_score`, and `created_at`.

#### 6. `GET /api/resume/report/{id}/`
- **Description**: Retrieves detailed report metadata, analysis JSON, and rewritten versions.

#### 7. `DELETE /api/resume/report/{id}/`
- **Description**: Deletes a report.

#### 8. `GET /api/resume/report/{id}/download-pdf/`
- **Description**: Downloads report scorecard as a formatted PDF.

#### 9. `GET /api/resume/report/{id}/download-docx/`
- **Description**: Downloads the rewritten AI resume as a DOCX document.

---

## Local Setup & Deployment

### 1. Environment Configuration
Ensure you have a `.env` file in `backend/` and `ml_service/` with:
```env
GEMINI_API_KEY=your-gemini-api-key-here
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

### 2. Run with Docker Compose
To spin up all services simultaneously:
```bash
docker-compose up --build
```
This launches:
- Database at port `5432`
- Django backend at `http://localhost:8000`
- Frontend at `http://localhost:5173`
- ML Service at `http://localhost:5000`

### 3. Local Installation (Alternative)
First, create a virtual environment and run the setup script:
```powershell
.\setup.ps1
```
Then, to run individually:
- **Backend**:
  ```bash
  cd backend
  ..\venv\Scripts\Activate.ps1
  python manage.py runserver
  ```
- **Frontend**:
  ```bash
  cd frontend
  npm run dev
  ```
- **ML Service**:
  ```bash
  cd ml_service
  ..\venv\Scripts\Activate.ps1
  uvicorn app:app --port 5000 --reload
  ```
