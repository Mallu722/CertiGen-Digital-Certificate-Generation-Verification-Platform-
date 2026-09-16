"""
CertiGen Comprehensive Knowledge Base for RAG AI Assistant.
Contains structured domain documents covering all aspects of the CertiGen platform:
- Project Overview & Core Mission
- Step-by-step User & Admin Guides (Single, Bulk, Templates, Categories, Verification)
- System Architecture & Technology Stack
- Core Algorithmic Logic & Vector Math
- Full REST API Specification & Payloads
- Troubleshooting, Security & Configuration FAQs
"""

KNOWLEDGE_CHUNKS = [
    {
        "id": "overview_mission",
        "title": "CertiGen Platform Overview & Core Capabilities",
        "category": "Project Overview",
        "tags": ["overview", "about", "features", "what is certigen", "capabilities", "intro", "purpose"],
        "summary": "CertiGen is an enterprise digital certificate generation and verification platform offering tamper-proof vector PDFs, instant QR verification, bulk Excel issuance, and role-based access.",
        "content": """### What is CertiGen?
**CertiGen** is a modern, full-stack digital credential management platform designed for educational institutions, bootcamps, hackathons, and corporate training programs. It allows administrators and mentors to design, generate, distribute, and verify tamper-proof digital certificates at scale.

### Key Capabilities & Highlights:
1. **Tamper-Proof Digital Certificates**: Every issued certificate is assigned both a human-readable sequential identifier (e.g. `CERT-2026-000001`) and a cryptographic internal UUID.
2. **Instant QR Code Verification**: Each certificate carries a high-density 2D QR barcode that links directly to the public verification portal with zero login required.
3. **True Vector PDF Engine**: Rendered using ReportLab at 300+ DPI, ensuring crisp printing and mathematical geometry (such as trigonometric 24-point gold seals) without blurry raster images.
4. **Bulk Issuance Pipeline**: Upload an Excel (`.xlsx`) or CSV file with hundreds of recipient names and emails to batch-generate certificates, compress them into a downloadable `.zip` archive, and dispatch email notifications automatically.
5. **Interactive Template Designer**: Customize landscape or portrait certificate layouts, colors, typography, gold seals, signatures, and dynamic variable placeholders (`{{STUDENT_NAME}}`, `{{EVENT_NAME}}`, `{{ISSUE_DATE}}`).
6. **Public Live Camera QR Scanner**: Anyone can verify certificate authenticity by scanning physical or screen-displayed certificates using their device's webcam or smartphone camera.
7. **Role-Based Access Control (RBAC)**: Secure access separation between platform **ADMIN** (full system control, categories, templates, user management) and **MENTOR** (certificate issuance, viewing)."""
    },
    {
        "id": "guide_single_issue",
        "title": "Step-by-Step Guide: How to Issue a Single Certificate",
        "category": "User Guide",
        "tags": ["how to use", "create certificate", "single issue", "generate", "issue", "step by step"],
        "summary": "Step-by-step walkthrough on how to generate an individual certificate with live preview, automated ID generation, and instant PDF download.",
        "content": """### How to Issue a Single Certificate in CertiGen

Follow these steps to create and issue a verified digital certificate:

#### Step 1: Navigate to the Issuance Portal
- From the left sidebar, click on **Certificates** or click the **"Issue New"** button in the top navbar.
- Select the **"Single Certificate"** tab.

#### Step 2: Choose a Category & Certificate Template
- Select the **Category** matching your event (e.g., *Full Stack Web Development*, *AI/ML Bootcamp*, *Hackathon 2026*).
- Choose one of the designed **Certificate Templates** (e.g., *Modern Minimalist*, *Classic Academic Navy*, *Tech Excellence Cyber*).
- The dynamic certificate previewer on the right side of the screen updates in real time to reflect your chosen template styling.

#### Step 3: Enter Recipient Information
- **Recipient Full Name**: Enter the student or participant's name (e.g., `John Doe`).
- **Recipient Email Address**: Enter the recipient's email address (e.g., `john.doe@example.com`).
- **Issue Date**: Select today's date or backdate if required.
- **Custom Notes / Description (Optional)**: Add specific achievement notes or honors.

#### Step 4: Generate & Preview
- Click **"Generate Certificate"**.
- CertiGen automatically:
  1. Computes the next concurrency-safe identifier (e.g. `CERT-2026-000042`).
  2. Generates a high-error-correction QR code pointing to `/verify/CERT-2026-000042`.
  3. Compiles the high-resolution vector PDF on the backend.
  4. Stores the record in the database with status `VALID`.

#### Step 5: Download or Email
- Download the generated PDF directly to your device.
- If email delivery is toggled, the recipient receives an automated notification with the PDF attached and a direct verification link."""
    },
    {
        "id": "guide_bulk_issue",
        "title": "Step-by-Step Guide: How to Bulk Issue Certificates via Excel / CSV",
        "category": "User Guide",
        "tags": ["bulk", "excel", "csv", "spreadsheet", "batch", "zip", "multiple certificates", "how to bulk"],
        "summary": "How to upload an Excel or CSV file to batch-generate hundreds of certificates with dynamic placeholder replacement, ZIP archiving, and automated emailing.",
        "content": """### How to Bulk Issue Certificates via Excel / CSV

CertiGen provides an automated batch pipeline for issuing dozens or hundreds of certificates at once:

#### Step 1: Prepare Your Spreadsheet (.xlsx or .csv)
Your spreadsheet must include the following column headers (fuzzy matching handles minor variations):
- `Name` or `Recipient Name` or `Student Name`
- `Email` or `Recipient Email`
- *(Optional)* `Grade`, `Score`, or `Rank`

*Sample Excel Format:*
| Name | Email | Event |
| :--- | :--- | :--- |
| Alex Morgan | alex@example.com | Web Dev Hackathon |
| Sarah Connor | sarah@example.com | Web Dev Hackathon |
| David Miller | david@example.com | Web Dev Hackathon |

#### Step 2: Open the Bulk Generation Interface
- Navigate to **Certificates** $\\rightarrow$ click **"Issue New"** $\\rightarrow$ select the **"Bulk Ingestion"** tab.
- Select your target **Category** and **Certificate Template**.

#### Step 3: Upload & Validate Spreadsheet
- Drag and drop your `.xlsx` or `.csv` file into the upload dropzone.
- CertiGen parses the file in real-time, displays a table preview of detected recipients, and flags any invalid or missing email formats before submission.

#### Step 4: Configure Batch Options
- **Send Automated Emails**: Toggle to automatically dispatch individual emails with attached PDFs.
- **Generate Downloadable ZIP**: Generates a consolidated `.zip` archive containing all rendered vector PDFs named by certificate number.

#### Step 5: Execute Batch Issuance
- Click **"Process Bulk Issuance"**.
- CertiGen executes the batch inside an atomic database transaction:
  - Generates sequential IDs (`CERT-2026-000001` through `CERT-2026-000085`).
  - Asynchronously renders vector PDFs in memory buffers.
  - Returns a summary with total issued count and a one-click button to download the entire **Batch ZIP Archive**."""
    },
    {
        "id": "guide_templates_categories",
        "title": "Managing Certificate Templates & Categories",
        "category": "User Guide",
        "tags": ["template", "category", "designer", "branding", "customize", "gold seal", "signature", "landscape"],
        "summary": "Guide on creating custom certificate templates, configuring JSON style attributes, signatures, logos, and organizing with categories.",
        "content": """### Managing Templates & Categories in CertiGen

#### 1. Managing Categories (Admin Only)
Categories organize your credentials by event type, department, or course:
- Navigate to **Categories** in the sidebar.
- Click **"Create Category"** and provide:
  - **Title**: e.g., *Full Stack Web Development*, *Cybersecurity Track*.
  - **Description**: Detailed description of the curriculum or event.
  - **Slug**: URL-friendly identifier automatically generated.

#### 2. Designing & Managing Templates
CertiGen allows admins to create reusable, visually stunning certificate templates:
- Navigate to **Templates** in the sidebar.
- Click **"New Template"** to launch the Template Creator:
  - **Template Name**: e.g., *Presidential Gold Honors*, *Modern Tech Gradient*.
  - **Orientation**: Landscape ($11 \\times 8.5$ in) or Portrait ($8.5 \\times 11$ in).
  - **Primary & Secondary Colors**: Custom hex palettes (e.g., `#0f2744` Navy and `#c59b27` Gold).
  - **Typography & Font**: Classic Serif, Modern Sans-Serif, or Cyber Mono.
  - **Embossed Gold Seal**: Enable/disable the mathematical 24-point starburst seal.
  - **Signatures & Logos**: Upload high-resolution signature PNGs and institutional logos.
  - **Dynamic Placeholders**: Insert dynamic tags into the certificate body:
    - `{{STUDENT_NAME}}` - Dynamically replaced by recipient's name.
    - `{{EVENT_NAME}}` - Dynamically replaced by category or event title.
    - `{{ISSUE_DATE}}` - Formatted certificate issuance date.
    - `{{CERTIFICATE_ID}}` - Auto-generated certificate sequential ID.

#### 3. Seeded Default Templates
CertiGen comes pre-loaded with **15 professional built-in templates** spanning Academic, Technical, Hackathon, Corporate, and Minimalist designs."""
    },
    {
        "id": "guide_verification_portal",
        "title": "Certificate Verification: Public Search & Live Webcam QR Scanner",
        "category": "Verification",
        "tags": ["verify", "verification", "qr code", "camera", "webcam", "scanner", "public verify", "check certificate"],
        "summary": "How the public verification portal functions, including manual ID search, direct URL resolution, and browser-based live camera QR code scanning.",
        "content": """### Certificate Verification in CertiGen

CertiGen provides a zero-friction, public verification portal accessible by employers, recruiters, and academic institutions without requiring an account or login.

#### Method 1: Verification by Certificate ID
1. Open the public verification portal at `http://localhost:5173/verify`.
2. Enter either:
   - The sequential certificate number (e.g. `CERT-2026-000001`), OR
   - The cryptographic internal UUID.
3. Click **"Verify Authenticity"**.
4. The system queries the backend database and displays:
   - **Verification Status**: ✅ **VALID & VERIFIED** or ❌ **REVOKED / INVALID**.
   - **Recipient Name** & masked email.
   - **Issuing Organization & Category**.
   - **Issue Date & Expiry (if applicable)**.
   - **Interactive Live Preview** of the certificate.
   - **Download Official PDF** button.

#### Method 2: Live Webcam / Mobile Camera QR Code Scanning
1. On the verification page, click the **"Scan QR Code"** tab.
2. Grant camera permissions when prompted by the browser.
3. Hold the physical printed certificate or screen displaying the QR code in front of the camera.
4. CertiGen's client-side `html5-qrcode` engine instantly decodes the verification URL using WebRTC with zero server lag and immediately displays the verified credential!

#### Method 3: Direct URL Verification
- Every certificate's QR code encodes a direct verification link: `https://certigen.io/verify/CERT-2026-000001`.
- Scanning with any smartphone camera opens the verified record directly in the browser."""
    },
    {
        "id": "tech_architecture",
        "title": "System Architecture & Technology Stack Rationale",
        "category": "Architecture",
        "tags": ["architecture", "tech stack", "technologies", "why django", "why react", "backend", "frontend", "database"],
        "summary": "Comprehensive breakdown of the CertiGen system architecture, architectural decisions, and technology stack choices.",
        "content": """### CertiGen Architectural Architecture & Tech Stack

CertiGen is engineered using a decoupled Single Page Application (SPA) + REST API micro-architecture:

```
[ Client Layer (React 19 + TypeScript + Vite) ]
        |
        |  REST API (JSON over HTTPS) + JWT Bearer Tokens
        v
[ API & Business Layer (Django REST Framework 4.2) ]
   ├── SimpleJWT Auth (Stateless Access/Refresh)
   ├── Concurrency-Safe ID Generator
   ├── ReportLab Vector Canvas Engine (300+ DPI PDF)
   ├── qrcode Matrix Generator (PIL High Error Correction)
   └── Bulk Ingestion & ZIP Streaming (openpyxl + zipfile)
        |
        v
[ Data & Media Layer ]
   ├── PostgreSQL / SQLite Database (B-Tree Indexed Lookups)
   └── Media Storage (Static assets, logos, signatures, PDFs)
```

#### Technology Breakdown & Selection Rationale:
1. **Backend Framework — Django REST Framework (Python)**:
   - *Why chosen:* Provides a robust, battery-included ORM with built-in protection against SQL injection. Native Python ecosystem enables direct vector PDF rendering (ReportLab) and image matrix processing without external dependencies.
2. **PDF Graphic Engine — ReportLab Canvas (Direct Vector)**:
   - *Why chosen:* Directly creates mathematical vector PDFs (300+ DPI) with tiny memory footprint (~2MB RAM per PDF) and ultra-fast execution (~30ms per certificate), 100x faster than headless browser engines (Puppeteer/Chromium) which consume 200MB+ RAM per page.
3. **Frontend Framework — React 19 + TypeScript + Vite**:
   - *Why chosen:* Lightning-fast Vite HMR build tooling, strict TypeScript type safety matching backend serializers, and seamless integration with WebRTC camera streaming for QR scanning.
4. **Authentication — Stateless SimpleJWT**:
   - *Why chosen:* Stateless tokens (60-minute access, 24-hour refresh) decouple frontend from backend server state, eliminating database session lookups on every API request.
5. **Database — PostgreSQL (Production) / SQLite (Dev)**:
   - *Why chosen:* Relational integrity with unique B-Tree indexing on `certificate_number` and `id` guarantees $O(\\log N)$ lookup performance during high-concurrency verification spikes."""
    },
    {
        "id": "algorithms_code_mechanics",
        "title": "Core Algorithmic Logic & Mathematical Mechanics",
        "category": "Algorithms",
        "tags": ["algorithm", "logic", "sequential id", "gold seal", "vector math", "code mechanics", "trigonometry", "id generator"],
        "summary": "Detailed explanation and pseudocode of the sequential ID generator, trigonometric 24-point gold seal geometry, and bulk processing pipeline.",
        "content": """### Core Algorithmic Logic in CertiGen

#### 1. Concurrency-Safe Sequential ID Generator (`CERT-YYYY-000001`)
*Problem:* Auto-increment integer IDs expose business volume to scraping; random UUIDs are too long for humans to type.
*Solution:* Structured format `CERT-<YEAR>-<SEQUENCE>` with zero-padded 6-digit sequence.
*Logic:*
1. Extracts current calendar year (e.g. `2026`).
2. Filters existing certificates where `certificate_number__startswith='CERT-2026-'`.
3. Parses numerical suffix using regex `^CERT-\\d{4}-(\\d+)$` and computes `max(sequence) + 1`.
4. Pads sequence with leading zeros (e.g., `CERT-2026-000042`).

#### 2. Trigonometric 24-Point Gold Seal Geometry
*Problem:* Static PNG images blur when zoomed in or printed at high resolution.
*Solution:* Mathematically constructed 24-point starburst embossed seal rendered via polar-to-Cartesian coordinate geometry:
$$x = \\text{center}_x + r \\cdot \\cos(\\theta)$$
$$y = \\text{center}_y + r \\cdot \\sin(\\theta)$$
- Alternates between outer radius ($30\\text{pt}$) and inner radius ($26\\text{pt}$) across 48 polar vertices.
- Draws concentric gold metallic borders, star accents, and centered embossed typography (*"★ OFFICIAL SEAL ★"*).

#### 3. Bulk Spreadsheet & Fuzzy Header Pipeline
*Logic:*
1. Ingests `.xlsx` via `openpyxl` with `data_only=True` to resolve formulas.
2. Applies regex fuzzy matching to detect column headers (`name`, `recipient`, `email`, `student`).
3. Wraps entire batch in Django `transaction.atomic()` to prevent orphan database records.
4. Generates vector PDFs in memory buffers and streams directly into a `.zip` archive."""
    },
    {
        "id": "api_reference_spec",
        "title": "REST API Reference & Endpoints Specification",
        "category": "API Reference",
        "tags": ["api", "endpoints", "rest", "routes", "json", "request", "response", "urls"],
        "summary": "Complete documentation of all CertiGen REST API endpoints, HTTP methods, headers, and request/response payloads.",
        "content": """### CertiGen REST API Reference

#### Authentication Endpoints (`/api/accounts/`)
- `POST /api/accounts/register/`: Register new Admin or Mentor.
- `POST /api/accounts/login/`: Authenticate user; returns `{ access, refresh, user: { id, email, role, ... } }`.
- `POST /api/accounts/refresh/`: Refresh expired access token using refresh token.
- `GET /api/accounts/profile/`: Retrieve current authenticated user profile.
- `PUT /api/accounts/profile/update/`: Update user profile details.

#### Category Endpoints (`/api/categories/`)
- `GET /api/categories/`: List all categories (searchable, filterable).
- `POST /api/categories/`: Create category *(Admin only)*.
- `GET /api/categories/<id>/`: Retrieve category details.
- `PUT /api/categories/<id>/`: Update category *(Admin only)*.
- `DELETE /api/categories/<id>/`: Delete category *(Admin only)*.

#### Template Endpoints (`/api/templates/`)
- `GET /api/templates/`: List all certificate templates.
- `POST /api/templates/`: Create new template with style configuration *(Admin only)*.
- `GET /api/templates/<id>/`: Retrieve template details and JSON styles.
- `PUT /api/templates/<id>/`: Update template *(Admin only)*.
- `DELETE /api/templates/<id>/`: Delete template *(Admin only)*.

#### Certificate Endpoints (`/api/certificates/`)
- `GET /api/certificates/`: List issued certificates with pagination and filters.
- `POST /api/certificates/`: Issue a single certificate.
- `POST /api/certificates/bulk/`: Bulk issue certificates from Excel/CSV upload.
- `GET /api/certificates/<id>/pdf/`: Download high-resolution vector PDF.
- `POST /api/certificates/<id>/revoke/`: Revoke certificate *(Admin only)*.

#### Public Verification (`/api/verify/`)
- `GET /api/verify/<certificate_id>/`: Public verification endpoint. Returns verification status, recipient details, and template info. Zero authentication required.

#### AI Assistant Endpoints (`/api/assistant/`)
- `POST /api/assistant/chat/`: Send a query to the RAG AI Assistant.
- `GET /api/assistant/suggestions/`: Retrieve curated quick-start question prompts.
- `GET /api/assistant/topics/`: Retrieve all knowledge topics."""
    },
    {
        "id": "troubleshooting_faq",
        "title": "Troubleshooting & Frequently Asked Questions (FAQs)",
        "category": "Troubleshooting",
        "tags": ["faq", "troubleshooting", "errors", "help", "fix", "setup", "issues", "common problems"],
        "summary": "Solutions for common issues including Excel formatting errors, camera permission issues for QR scanning, CORS errors, and database migration fixes.",
        "content": """### Frequently Asked Questions & Troubleshooting

#### Q1: What happens if an Excel file has missing or wrongly formatted headers?
*Answer:* CertiGen uses fuzzy header matching for names and emails. If a required column cannot be identified or email syntax is invalid, the system rejects the file with a clear 400 Bad Request detailing the exact row and column cause before touching the database.

#### Q2: The live QR code camera scanner is not opening. How do I fix it?
*Answer:* Ensure that:
1. Browser camera permissions are granted for `http://localhost:5173` or your domain.
2. The page is served over HTTPS or `localhost` (browsers block WebRTC camera access on unencrypted HTTP).
3. No other application is currently locking your webcam device.

#### Q3: How do I switch between SQLite and PostgreSQL?
*Answer:* CertiGen defaults to SQLite for zero-config local development. To use PostgreSQL, set in `backend/.env`:
```env
DB_ENGINE=postgresql
DB_NAME=certigen
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=5432
```

#### Q4: Can a revoked certificate still be verified?
*Answer:* Yes, but the verification portal will display a prominent **RED ❌ REVOKED** alert with the revocation timestamp, preventing unauthorized use of invalidated credentials.

#### Q5: How are PDFs downloaded and where are they stored?
*Answer:* PDFs are generated on-the-fly or cached in `backend/media/certificates/`. Users can click "Download PDF" anytime from the certificate list, creation confirmation modal, or public verification landing page."""
    }
]


def get_all_chunks():
    """Returns all knowledge chunks."""
    return KNOWLEDGE_CHUNKS


def get_topics_summary():
    """Returns a high-level summary of topics for the UI knowledge browser."""
    return [
        {
            "id": chunk["id"],
            "title": chunk["title"],
            "category": chunk["category"],
            "summary": chunk["summary"],
            "tags": chunk["tags"]
        }
        for chunk in KNOWLEDGE_CHUNKS
    ]
