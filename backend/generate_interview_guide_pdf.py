import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically add 'Page X of Y' and header/footer."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#0f2744"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "CertiGen — Comprehensive Full-Stack Interview Mastery Guide")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(54, 36, "Confidential — Prepared for Technical & System Design Interviews")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_text)
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        self.restoreState()


def build_pdf(filename="CertiGen_Interview_Master_Guide.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0f2744'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#c59b27'),
        spaceAfter=15
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=colors.HexColor('#0f2744'),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=colors.HexColor('#1e40af'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#0f172a')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#1e293b')
    )

    story = []

    # Title & Header
    story.append(Paragraph("CertiGen — Deep-Dive Interview Mastery", title_style))
    story.append(Paragraph("Architectural Rationale, Component Analysis, Pseudocode & Interview Defense", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0f2744"), spaceBefore=0, spaceAfter=12))

    # SECTION 1: ARCHITECTURAL PHILOSOPHY & WHY THIS STACK
    story.append(Paragraph("1. Technology Selection: Deep 'Why This, Why Not That' Matrix", h1_style))
    story.append(Paragraph(
        "Interviewers frequently ask: <i>'Why did you choose Django and React over Next.js, Node.js, or Flask?'</i>. "
        "Here is the exact comparison matrix and architectural justification:",
        body_style
    ))

    matrix_data = [
        [
            Paragraph("Component", table_header_style),
            Paragraph("Chosen Technology", table_header_style),
            Paragraph("Why Chosen (Advantages)", table_header_style),
            Paragraph("Why NOT Alternatives (Tradeoffs)", table_header_style)
        ],
        [
            Paragraph("Backend Framework", table_cell_style),
            Paragraph("<b>Django REST Framework (Python)</b>", table_cell_style),
            Paragraph("• Battery-included ORM with built-in SQL injection defense.<br/>• Native Python ecosystem for low-level vector PDF rendering (ReportLab) and image matrix processing (Pillow).<br/>• Out-of-the-box admin, auth, and model migrations.", table_cell_style),
            Paragraph("• <i>vs Node.js/Express:</i> Node lacks enterprise-grade native vector PDF engines equivalent to ReportLab (Node PDFKit is slower and harder to maintain mathematical canvas).<br/>• <i>vs Flask/FastAPI:</i> Required rolling custom auth, migrations, and admin panel from scratch.", table_cell_style)
        ],
        [
            Paragraph("PDF Rendering Engine", table_cell_style),
            Paragraph("<b>ReportLab Canvas (Direct Vector)</b>", table_cell_style),
            Paragraph("• True mathematical vector rendering (300+ DPI).<br/>• 100x faster than headless browser rendering.<br/>• Low memory footprint (~2MB RAM per PDF).<br/>• Trigonometric custom shape generation (seals).", table_cell_style),
            Paragraph("• <i>vs Puppeteer / html-pdf:</i> Spins up full Chromium instance; consumes 200MB+ RAM per page; slow cold starts; text becomes rasterized/blurry on high-res print.<br/>• <i>vs WeasyPrint:</i> Slower CSS layout engine with high CPU load during bulk batches.", table_cell_style)
        ],
        [
            Paragraph("Frontend Architecture", table_cell_style),
            Paragraph("<b>React 19 + TypeScript + Vite</b>", table_cell_style),
            Paragraph("• Extreme dev speed with Vite HMR.<br/>• Type-safe contracts with backend serializers via TypeScript interfaces.<br/>• Client-side camera QR scanning with zero server latency.<br/>• Component reusability.", table_cell_style),
            Paragraph("• <i>vs Vanilla JS:</i> Hard to manage complex state for multi-step bulk upload modals & dynamic template previewers.<br/>• <i>vs Next.js:</i> SSR is unnecessary overhead for a protected dashboard and static verification portal.", table_cell_style)
        ],
        [
            Paragraph("Authentication", table_cell_style),
            Paragraph("<b>JWT (SimpleJWT: Access + Refresh)</b>", table_cell_style),
            Paragraph("• Stateless authentication ideal for REST APIs.<br/>• Eliminates database session table lookups on every request.<br/>• Clean separation between Frontend and Backend domains.", table_cell_style),
            Paragraph("• <i>vs Session Cookies:</i> Vulnerable to CSRF unless strict SameSite flags configured; tightly couples client to server domain; harder to scale horizontally across microservices.", table_cell_style)
        ]
    ]

    t = Table(matrix_data, colWidths=[1.1*inch, 1.4*inch, 2.3*inch, 2.2*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f2744')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    # SECTION 2: STEPWISE IN-DEPTH LOGIC & ALGORITHMS
    story.append(Paragraph("2. Core Algorithmic Logic & Step-by-Step Execution", h1_style))

    # Logic 1: Sequential ID Generation
    story.append(Paragraph("A. Concurrency-Safe Sequential ID Generator (`CERT-YYYY-000001`)", h2_style))
    story.append(Paragraph(
        "<b>Problem:</b> Standard auto-increment integer IDs expose database volume to public attackers. Random UUIDs are too long for users to type. "
        "<b>Solution:</b> A hybrid structured alphanumeric identifier format: <code>CERT-&lt;YEAR&gt;-&lt;SEQUENCE&gt;</code>.",
        body_style
    ))
    story.append(Paragraph("<b>Stepwise Flow:</b>", body_style))
    story.append(Paragraph("1. Extract the current calendar year (e.g. 2026).", bullet_style))
    story.append(Paragraph("2. Query the database using <code>certificate_number__startswith='CERT-2026-'</code>.", bullet_style))
    story.append(Paragraph("3. Parse numerical suffix using regex <code>^CERT-2026-(\\d+)$</code> and compute <code>max(sequence) + 1</code>.", bullet_style))
    story.append(Paragraph("4. Format with zero-padding to 6 digits (e.g. <code>CERT-2026-000042</code>).", bullet_style))
    
    code_text_1 = """# Pseudocode: Sequential ID Generation
FUNCTION generate_next_certificate_number(year):
    prefix = "CERT-" + year + "-"
    existing_numbers = DB.Certificate.filter(number.startswith(prefix)).pluck("number")
    max_seq = 0
    FOR num IN existing_numbers:
        match = REGEX_MATCH(r"^CERT-\\d{4}-(\\d+)$", num)
        IF match:
            max_seq = MAX(max_seq, TO_INT(match.group(1)))
    next_seq = max_seq + 1
    RETURN prefix + PAD_LEFT(next_seq, length=6, char='0')"""
    
    t_code1 = Table([[Paragraph(code_text_1.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style)]], colWidths=[7*inch])
    t_code1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#94a3b8')),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_code1)
    story.append(Spacer(1, 8))

    # Logic 2: Vector PDF Math Engine
    story.append(Paragraph("B. Trigonometric Gold Seal & Vector PDF Coordinate Geometry", h2_style))
    story.append(Paragraph(
        "<b>Mathematical Seal Construction:</b> Rather than embedding a static PNG logo (which blurs on zoom), we mathematically draw a 24-point starburst embossed seal. "
        "Using polar-to-Cartesian coordinate mapping: <code>x = center_x + radius * cos(angle)</code> and <code>y = center_y + radius * sin(angle)</code> alternating between outer radius (30pt) and inner radius (26pt).",
        body_style
    ))
    
    code_text_2 = """# Pseudocode: Mathematical Starburst Seal Rendering
FUNCTION draw_gold_seal(canvas, center_x, center_y, radius=30):
    points = 24
    path = canvas.beginPath()
    FOR i FROM 0 TO (points * 2 - 1):
        angle = i * (PI / points)
        r = (i % 2 == 0) ? radius : (radius - 4)  # Alternate outer/inner peaks
        px = center_x + r * cos(angle)
        py = center_y + r * sin(angle)
        IF i == 0: path.moveTo(px, py)
        ELSE: path.lineTo(px, py)
    path.close()
    canvas.setFillColor("#f59e0b")  # Gold
    canvas.drawPath(path, fill=1, stroke=1)
    canvas.drawCircle(center_x, center_y, radius - 6) # Inner ring
    canvas.drawCentredText(center_x, center_y, "★ OFFICIAL SEAL ★")"""

    t_code2 = Table([[Paragraph(code_text_2.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style)]], colWidths=[7*inch])
    t_code2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#94a3b8')),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_code2)
    story.append(Spacer(1, 8))

    # Logic 3: Bulk Spreadsheet & ZIP Pipeline
    story.append(Paragraph("C. Bulk Ingestion, Dynamic Variable Binding & ZIP Streaming Pipeline", h2_style))
    story.append(Paragraph(
        "<b>Workflow:</b> 1. Parse Excel/CSV $\\rightarrow$ 2. Fuzzy match headers $\\rightarrow$ 3. Generate sequential serials $\\rightarrow$ 4. Render PDFs in memory buffers $\\rightarrow$ 5. Compress into ZIP archive $\\rightarrow$ 6. Dispatch emails asynchronously.",
        body_style
    ))

    code_text_3 = """# Pseudocode: Bulk Certificate & ZIP Streaming Pipeline
FUNCTION bulk_issue_certificates(file, template, common_data):
    recipients = parse_and_normalize_sheet(file)  # Handles .xlsx, .csv, fuzzy headers
    batch_zip = ZipFile("media/batches/" + batch_id + ".zip", mode='w')
    
    FOR recipient IN recipients:
        cert_id = generate_next_certificate_number()
        # Dynamic variable tag resolution:
        description = template.wording.replace("{{STUDENT_NAME}}", recipient.name)
                                      .replace("{{EVENT_NAME}}", common_data.title)
        
        cert = DB.Certificate.create(
            certificate_number=cert_id,
            recipient_name=recipient.name,
            recipient_email=recipient.email,
            status='VALID'
        )
        pdf_bytes = generate_vector_pdf(cert)
        batch_zip.write_bytes(filename=cert_id + "_" + recipient.name + ".pdf", data=pdf_bytes)
        
        IF common_data.send_email AND recipient.email:
            send_smtp_email(to=recipient.email, attachment=pdf_bytes)
            
    batch_zip.close()
    RETURN {"zip_url": batch_zip.filepath, "total_issued": len(recipients)}"""

    t_code3 = Table([[Paragraph(code_text_3.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style)]], colWidths=[7*inch])
    t_code3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#94a3b8')),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_code3)
    story.append(Spacer(1, 10))

    # SECTION 3: IN-BUILT APIS & LIBRARIES GLOSSARY
    story.append(Paragraph("3. In-Built APIs, Libraries & Packages Explained", h1_style))
    story.append(Paragraph("A comprehensive reference of every major dependency in CertiGen:", body_style))

    lib_data = [
        [Paragraph("Package / API", table_header_style), Paragraph("Purpose in CertiGen", table_header_style), Paragraph("Replacement Alternative", table_header_style)],
        [Paragraph("<b>djangorestframework-simplejwt</b>", table_cell_style), Paragraph("Generates stateless HMAC-SHA256 encrypted access & refresh tokens for authenticated REST requests.", table_cell_style), Paragraph("OAuth2 (Django-OAuth-Toolkit) or Django SessionAuth.", table_cell_style)],
        [Paragraph("<b>django-cors-headers</b>", table_cell_style), Paragraph("Middleware injecting Access-Control-Allow-Origin headers so React frontend on port 5173 can call Django on port 8000.", table_cell_style), Paragraph("Nginx reverse proxy rewrite rules.", table_cell_style)],
        [Paragraph("<b>reportlab</b>", table_cell_style), Paragraph("Low-level Python PDF graphic engine manipulating vector shapes, lines, fonts, and coordinate canvas.", table_cell_style), Paragraph("WeasyPrint, PyMuPDF, Puppeteer.", table_cell_style)],
        [Paragraph("<b>qrcode[pil]</b>", table_cell_style), Paragraph("Converts verification URLs into 2D barcode matrices with High Error Correction (30% damage recovery).", table_cell_style), Paragraph("segno, Google Chart API (cloud-dependent).", table_cell_style)],
        [Paragraph("<b>openpyxl</b>", table_cell_style), Paragraph("Reads `.xlsx` Excel spreadsheets directly into Python row iterators without requiring Microsoft Excel runtime.", table_cell_style), Paragraph("pandas (heavy), xlrd (legacy).", table_cell_style)],
        [Paragraph("<b>html5-qrcode</b>", table_cell_style), Paragraph("Runs WebRTC video stream in React to scan QR codes live from device webcams and phone cameras.", table_cell_style), Paragraph("jsQR, react-qr-reader.", table_cell_style)],
        [Paragraph("<b>axios interceptors</b>", table_cell_style), Paragraph("Centralized client middleware that injects JWT Bearer headers and catches 401s for automatic redirection.", table_cell_style), Paragraph("Native Fetch API with custom wrapper.", table_cell_style)]
    ]

    t_lib = Table(lib_data, colWidths=[1.8*inch, 3.4*inch, 1.8*inch])
    t_lib.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f2744')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_lib)
    story.append(Spacer(1, 10))

    # SECTION 4: TOP INTERVIEW QUESTIONS & MODEL ANSWERS
    story.append(Paragraph("4. Critical Technical Interview Questions & Perfect Answers", h1_style))

    qa_list = [
        ("Q1: How do you prevent replay attacks or brute-force certificate forgery?",
         "1. <b>Cryptographic Verification ID:</b> Each certificate possesses both a sequential human-readable ID and an immutable internal UUID. "
         "2. <b>Rate Limiting:</b> Verification endpoints can be throttled using Django REST Framework's <code>AnonRateThrottle</code> (e.g. 60 requests/minute). "
         "3. <b>Audit Logging:</b> Every verification inquiry records the requester's IP, timestamp, and User-Agent in <code>VerificationLog</code>, allowing automated blocking of suspicious scraping behavior."),

        ("Q2: What happens if a user submits a corrupted Excel file during bulk issuance?",
         "We implement defensive file parsing in <code>bulk_service.py</code>. The parser checks file extensions, uses <code>openpyxl</code> with <code>data_only=True</code> inside a <code>try-except</code> block, verifies header columns with fuzzy regex matching, skips empty rows, and validates email formats before creating any database entries. If an error occurs, the API returns a structured 400 Bad Request with the exact row and column cause."),

        ("Q3: How do you manage database transactions during bulk creation so that errors don't leave partial state?",
         "We utilize Django's <code>transaction.atomic()</code> block around batch insertion. If any unexpected error occurs midway (e.g., database constraint failure), the entire transaction rolls back, preventing orphaned records from being created without corresponding PDFs or emails."),

        ("Q4: Explain how JWT tokens work and why you store them in localStorage vs httpOnly cookies.",
         "SimpleJWT issues an <b>Access Token</b> (short TTL, 60 min) signed with HS256 containing user claims, and a <b>Refresh Token</b> (24 hours). We store the access token in localStorage for decoupled Single Page Application (SPA) REST consumption. In an enterprise high-security tier, we can transition to httpOnly SameSite cookies to completely eliminate XSS token exfiltration risks."),

        ("Q5: If 10,000 students try to verify their certificates at the exact same moment on results day, how will CertiGen perform?",
         "1. <b>Database Indexing:</b> <code>certificate_number</code> and <code>verification_id</code> have B-Tree unique indexes (<code>unique=True</code>), yielding $O(\\log N)$ lookup speed. "
         "2. <b>Redis Caching:</b> We can cache verified certificate JSON responses in Redis with a 1-hour TTL keyed by certificate ID. Cache hit latency is <2ms without touching the database. "
         "3. <b>CDN Caching:</b> Static assets and verification landing pages are cached at edge servers (Cloudflare/Vercel Edge).")
    ]

    for q, a in qa_list:
        story.append(Paragraph(f"<b>{q}</b>", h2_style))
        story.append(Paragraph(a, body_style))
        story.append(Spacer(1, 4))

    # SECTION 5: SYSTEM DESIGN TOPICS TO REVIEW
    story.append(Paragraph("5. Top 5 System Design Concepts to Mention to Impress the Interviewer", h1_style))
    story.append(Paragraph("1. <b>Asynchronous Task Delegation (Celery + Redis):</b> Explaining that for huge batches (10k+ PDFs), batch generation is offloaded to background Celery workers so HTTP requests don't time out.", bullet_style))
    story.append(Paragraph("2. <b>Idempotency in Certificate Issuance:</b> Ensuring re-uploading the same spreadsheet does not generate duplicate certificates or charge duplicate emails.", bullet_style))
    story.append(Paragraph("3. <b>Zero-Trust Verification:</b> Allowing any 3rd party to verify authenticity without requiring credentials or compromising recipient PII (personally identifiable information).", bullet_style))
    story.append(Paragraph("4. <b>Stateless Web Tier:</b> Django and React containers are completely stateless; all media and PDF exports can be served from AWS S3 / Cloudinary.", bullet_style))
    story.append(Paragraph("5. <b>Database Normalization vs JSON Flexibility:</b> Using normalized relational tables for Users and Categories, but utilizing <code>models.JSONField</code> for dynamic template style attributes.", bullet_style))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully compiled: {os.path.abspath(filename)}")

if __name__ == "__main__":
    build_pdf()
