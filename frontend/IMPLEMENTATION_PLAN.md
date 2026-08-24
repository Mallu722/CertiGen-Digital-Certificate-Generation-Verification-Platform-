# CertiGen Frontend Implementation Plan

## Phase 1: Frontend Foundation (Day 2)

### Project Structure
```
frontend/src/
├── api/              # API clients
├── components/       # UI components (reusable)
│   ├── common/      # Generic components
│   ├── layout/      # Layout components (Navbar, Sidebar)
│   └── ui/          # UI primitives (Button, Card, Table, etc.)
├── contexts/         # React contexts
├── hooks/            # Custom hooks
├── layouts/          # Page layouts
│   ├── AuthLayout.tsx
│   ├── DashboardLayout.tsx
│   └── BaseLayout.tsx
├── pages/            # Page components
│   ├── login/
│   ├── dashboard/
│   ├── certificates/
│   ├── templates/
│   ├── categories/
│   ├── verify/
│   └── profile/
├── services/         # API service layer
├── types/            # TypeScript types
├── utils/            # Utility functions
└── router/           # Routing configuration
```

### Components to Build

#### UI Components
- Button (Primary, Secondary, Outline, Ghost)
- Input (Text, Email, Password, Search)
- Card (Basic, Header, Footer variants)
- Table (Basic with pagination, sorting)
- Modal (Confirm, Form, Info)
- Badge (Status badges)
- Avatar (User avatar with initials)
- Spinner/Loader
- Toast notifications

#### Layout Components
- Navbar (Logo, user menu, notifications)
- Sidebar (Navigation menu, collapsible)
- DashboardLayout (Navbar + Sidebar + Content)
- AuthLayout (Centered card layout)

#### Pages
- Login (Form with validation)
- Dashboard (Overview cards, recent activity)
- Certificates (List with filters, search)
- Certificates/Create (Form with template selection)
- Certificates/Show (Detail view with PDF viewer)
- Templates (List with CRUD actions)
- Categories (List with CRUD actions)
- Verify (Certificate verification form)
- Profile (User profile, settings)

## Phase 2: Authentication & Authorization (Day 3)

### Backend API Endpoints to Implement

#### Accounts App
- POST /api/accounts/register/ - User registration
- POST /api/accounts/login/ - User login (returns JWT)
- GET /api/accounts/profile/ - Get user profile
- PUT /api/accounts/profile/ - Update user profile
- GET /api/accounts/ - List users (ADMIN only)
- DELETE /api/accounts/:id/ - Delete user (ADMIN only)

#### Authentication Flow
1. User submits credentials
2. Backend validates and returns JWT (access + refresh)
3. Frontend stores tokens in localStorage/session
4. All API requests include Authorization header
5. Token refresh on expiry

### Role-Based Access Control
- ADMIN: Full access to all features
- MENTOR: Access to Templates, Certificates, Dashboard only

## Implementation Tasks

### Task 1: Setup TypeScript Types
- Create User, Role, Certificate, Template, Category types

### Task 2: Create UI Components Library
- Build reusable component primitives
- Style with Tailwind CSS

### Task 3: Create Layout Components
- Navbar with user dropdown
- Sidebar with navigation
- Responsive design

### Task 4: Setup API Service
- Axios instance with interceptors
- Token management
- Error handling

### Task 5: Create Authentication Pages
- Login page with form validation
- Error handling and success states

### Task 6: Setup Routing
- Protected routes
- Role-based route guards
- Redirect logic

### Task 7: Create Dashboard Pages
- Dashboard overview
- Certificate management
- Template management
- Category management

### Task 8: Create Verification Page
- Certificate ID input
- Verification result display

### Task 9: Profile Page
- User information display
- Edit functionality

## Tools & Dependencies
- React Router v7 for navigation
- Axios for API calls
- TypeScript for type safety
- Tailwind CSS for styling
- Heroicons for icons

## Testing Strategy
- Manual testing of all pages
- Route navigation verification
- Form validation testing
- Responsive design checks

## Notes
- Keep components simple and focused
- Use TypeScript interfaces for all data structures
- Implement proper error handling throughout
- Follow consistent naming conventions
- Use environment variables for API configuration