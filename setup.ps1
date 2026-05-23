# Silent Skill Gap AI - Setup Script

echo "Starting setup for Silent Skill Gap AI..."

# 1. Setup Python Virtual Environment
echo "Creating Python Virtual Environment..."
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install Python Dependencies
echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt

# 3. Backend Setup (Django)
echo "Setting up Backend..."
cd backend
python manage.py makemigrations
python manage.py migrate
# Note: Ensure MySQL Server is running and database 'silent_skill_gap' is created.
cd ..

# 4. Frontend Setup (React/Vite)
echo "Setting up Frontend..."
cd frontend
npm install
cd ..

echo "Setup Complete!"
echo "To run the backend: cd backend; ..\venv\Scripts\Activate.ps1; python manage.py runserver"
echo "To run the frontend: cd frontend; npm run dev"
echo "To run the ML service: cd ml_service; ..\venv\Scripts\Activate.ps1; python pipeline.py"
