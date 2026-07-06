# Neon PostgreSQL Database Migration Guide

This guide explains how to migrate the database provider from the old **Render PostgreSQL** to **Neon PostgreSQL** while keeping the rest of the application deployment pipeline (React Frontend, Django Backend, FastAPI ML Service, Docker, GitHub Actions) intact on Render.

---

## Step 1: Create a Neon Database

1. Navigate to the [Neon Console](https://console.neon.tech/) and sign up or log in.
2. Click **Create Project**.
3. Name your project (e.g., `silent-skill-gap`).
4. Select your preferred database version (recommended: **PostgreSQL 15** or **PostgreSQL 16**).
5. Choose the AWS region closest to your Render services (e.g., **US East (N. Virginia)** if Render services are in `us-east`).
6. Click **Create Project**. Neon will initialize a project and create a default database named `neondb`.

---

## Step 2: Obtain the Neon Connection String

1. Once the project is created, you will see a **Connection Details** dashboard on the Neon homepage.
2. Select **PostgreSQL** or **Django** in the language dropdown.
3. Choose the **Connection string** option.
4. Copy the connection string. It will look like this:
   ```text
   postgresql://<username>:<password>@<ep-hostname>.aws.neon.tech/neondb?sslmode=require
   ```
   > [!IMPORTANT]
   > Make sure the connection string contains `?sslmode=require` at the end to ensure Django secures the connection properly.

---

## Step 3: Replace `DATABASE_URL` in Render

1. Log in to the [Render Dashboard](https://dashboard.render.com/).
2. Select your Django backend service (named `silent-skill-gap-backend`).
3. Click on the **Environment** tab on the left sidebar.
4. Locate the environment variable named **`DATABASE_URL`**.
   * *Note: If it was previously linked to the Render database, it will now be an editable field since the `render.yaml` configuration has been updated to `sync: false`.*
5. Paste your copied Neon connection string into the **`DATABASE_URL`** value field.
6. Click **Save Changes**.

---

## Step 4: Redeploy the Backend

Since our pipeline builds a Docker image on push and deploys it to Render:

### Option A: Automatic Git Trigger (Recommended)
1. Push the updated code (with modified `render.yaml` and this guide) to your GitHub repository:
   ```bash
   git add .
   git commit -m "chore: migrate database configuration to Neon PostgreSQL"
   git push origin main
   ```
2. This will trigger the GitHub Actions workflow, which builds the Docker image, pushes it to Docker Hub, and calls the Render Deploy Hook to redeploy the service.

### Option B: Manual Deploy via Render
1. If you want to force Render to redeploy immediately using the existing Docker image:
   * Go to the **silent-skill-gap-backend** service page in the Render dashboard.
   * Click the **Manual Deploy** button in the top right corner.
   * Select **Clear Cache & Deploy** or **Deploy latest commit**.

---

## Step 5: Verify the Database Connection & Migrations

1. **Verify Django Migrations**:
   * Open the **silent-skill-gap-backend** service logs in the Render dashboard.
   * Look for logs indicating that migrations were applied successfully. The Docker container's startup command automatically executes:
     ```bash
     python manage.py migrate --noinput
     ```
   * You should see output listing Django migrations being applied (e.g., `Applying core.0001_initial... OK`).

2. **Verify Superuser Creation**:
   * In the Render logs, check for the output of the `setup_superuser` command.
   * You should see:
     `Superuser 'Abhishek2118' created successfully!` (or `User 'Abhishek2118' already exists. Upgraded to superuser and reset password successfully!`).

3. **Inspect Neon Database Tables**:
   * Go to the [Neon Console](https://console.neon.tech/).
   * Click on the **SQL Editor** tab on the left menu.
   * Run the following query to check if tables were created:
     ```sql
     SELECT table_name FROM information_schema.tables WHERE table_schema='public';
     ```
   * You should see Django tables such as `core_user`, `django_session`, etc.
