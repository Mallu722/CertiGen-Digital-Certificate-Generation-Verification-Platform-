# CertiGen - Quick Start Guide

## What's Been Built

### Backend (Django REST Framework)
- Custom User model with ADMIN/MENTOR roles
- JWT authentication
- Category management
- Certificate template management
- Certificate issuance and management
- Certificate verification endpoint
- Admin interface configured

### Frontend (React + TypeScript)
- Authentication pages (Login)
- Dashboard with statistics
- Certificate management (list, create)
- Template management
- Category management
- Certificate verification
- User profile management
- Protected routes with role-based access
- Navbar and Sidebar layout

## Next Steps to Get Running

### 1. Configure PostgreSQL

Update `backend/.env` with your PostgreSQL credentials:
```env
DB_NAME=certigen
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=5432
```

### 2. Run Backend Migrations

```bash
cd backend
venv\Scripts\activate
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 3. Start Backend Server

```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

Backend will be available at: http://localhost:8000

### 4. Start Frontend

Open a new terminal:
```bash
cd frontend
npm run dev
```

Frontend will be available at: http://localhost:5173

### 5. Login

Use the superuser credentials you created:
- Email: (your superuser email)
- Password: (your superuser password)

## Project Structure Overview

```
CertiGen/
├── backend/
│   ├── accounts/          # User management
│   ├── categories/        # Category management
│   ├── certificate_templates/  # Template management
│   ├── certificates/      # Certificate management
│   ├── verification/      # Verification logging
│   └── certigen_backend/  # Main Django project
└── frontend/
    ├── src/
    │   ├── api/           # API client
    │   ├── components/    # UI components
    │   ├── layouts/       # Layout components
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   ├── types/         # TypeScript types
    │   └── utils/         # Utility functions
```

## Files Created (Frontend)

### Components
- Button, Input, Card, Table, Badge, Avatar
- Modal, Select, Form components
- Navbar, Sidebar layout components

### Pages
- Login (with form validation)
- Dashboard (with statistics)
- Certificates (list & create)
- Templates (list & manage)
- Categories (list & manage)
- Verify (certificate verification)
- Profile (user profile management)

### Services
- auth.service.ts - Authentication
- categories.service.ts - Category API
- templates.service.ts - Template API
- certificates.service.ts - Certificate API
- users.service.ts - User management API

## Files Created (Backend)

### Models
- User (custom with ADMIN/MENTOR roles)
- Category
- Template (with image upload)
- Certificate
- VerificationLog

### Views
- Registration, Login, Profile endpoints
- Category CRUD operations
- Template CRUD operations
- Certificate CRUD operations
- Certificate verification endpoint

## API Endpoints Available

- `POST /api/accounts/register/` - Register
- `POST /api/accounts/login/` - Login
- `GET /api/accounts/profile/` - Get profile
- `GET /api/categories/` - List categories
- `POST /api/categories/` - Create category
- `GET /api/templates/` - List templates
- `POST /api/templates/` - Create template
- `GET /api/certificates/` - List certificates
- `POST /api/certificates/` - Create certificate
- `GET /api/verify/:certificate_id/` - Verify certificate

## Security Features

- JWT token authentication
- Protected routes
- Role-based access control
- Password hashing
- CORS configuration
- Token refresh mechanism

## What's Missing to Complete

1. Create PostgreSQL database
2. Run migrations
3. Create superuser
4. Add missing imports in some files
5. Configure image upload path
6. Add more validation in frontend forms

## Troubleshooting

### Backend
- Ensure PostgreSQL is running
- Check .env file has correct credentials
- Make sure venv is activated

### Frontend
- Ensure backend is running on port 8000
- Check .env has correct API_URL
- Install all npm dependencies

## Support

For issues, check the logs and ensure all dependencies are installed correctly.