import io
import os
import qrcode
from PIL import Image
from django.conf import settings
from django.utils import timezone
from reportlab.lib.pagesizes import letter, landscape, A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER


def generate_qr_code_image(verification_url: str) -> Image.Image:
    """Generate a high-quality QR code image with high error correction."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(verification_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0f172a", back_color="white").convert("RGB")
    return img


def generate_certificate_pdf(certificate, base_url="http://localhost:5173") -> bytes:
    """
    Generate a dynamic, high-resolution vector PDF certificate.
    Adapts title, subtitle, colors, borders, dynamic wording tags,
    organization name, signatory, and QR code to the selected Template.
    """
    buffer = io.BytesIO()
    # A4 landscape: width = 841.89 pt, height = 595.27 pt
    page_width, page_height = landscape(A4)
    c = canvas.Canvas(buffer, pagesize=(page_width, page_height))
    c.setTitle(f"Certificate - {certificate.certificate_number}")
    c.setAuthor("CertiGen Platform")
    c.setSubject(certificate.title)

    # 1. Extract Template configuration & dynamic properties
    tpl = getattr(certificate, 'template', None)
    primary_hex = getattr(tpl, 'primary_color', '#0f2744') or '#0f2744'
    secondary_hex = getattr(tpl, 'secondary_color', '#c59b27') or '#c59b27'
    accent_hex = getattr(tpl, 'accent_color', '#e2d19f') or '#e2d19f'
    title_prefix = getattr(tpl, 'title_prefix', 'CERTIFICATE OF') or 'CERTIFICATE OF'
    subtitle = getattr(tpl, 'subtitle', 'ACHIEVEMENT') or 'ACHIEVEMENT'
    presentation_line = getattr(tpl, 'presentation_line', 'This is proudly presented to') or 'This is proudly presented to'
    wording_pattern = getattr(tpl, 'wording_pattern', '') or 'for outstanding achievement in {{EVENT_NAME}}'
    badge_text = getattr(tpl, 'badge_text', 'CERTIGEN VERIFIED CREDENTIAL') or 'CERTIGEN VERIFIED CREDENTIAL'
    
    org_name = getattr(certificate, 'organization_name', 'CertiGen Platform') or 'CertiGen Platform'
    achievement_val = getattr(certificate, 'achievement', '') or 'Distinguished Achievement'
    signatory_name = getattr(certificate, 'signatory_name', 'Authorized Signatory') or 'Authorized Signatory'
    signatory_title = getattr(certificate, 'signatory_title', 'Program Director') or 'Program Director'
    
    # Date formatting
    issue_date_str = certificate.issued_at.strftime('%d %B %Y') if certificate.issued_at else timezone.now().strftime('%d %B %Y')

    # Resolve dynamic variables in wording pattern
    meta = getattr(certificate, 'metadata', {}) or {}
    replacements = {
        '{{STUDENT_NAME}}': certificate.recipient_name,
        '{{NAME}}': certificate.recipient_name,
        '{{EVENT_NAME}}': certificate.title,
        '{{COURSE_NAME}}': certificate.title,
        '{{ACHIEVEMENT}}': achievement_val,
        '{{ORGANIZATION_NAME}}': org_name,
        '{{DATE}}': issue_date_str,
        '{{CERTIFICATE_ID}}': certificate.certificate_number,
        '{{RANK}}': str(meta.get('rank', '1st Place')),
        '{{DURATION}}': str(meta.get('duration', '4 Weeks')),
        '{{INSTRUCTOR}}': str(meta.get('instructor', 'Lead Instructor')),
        '{{TEAM_NAME}}': str(meta.get('team_name', 'Innovation Team')),
        '{{ROLE}}': str(meta.get('role', 'Intern')),
        '{{HOURS}}': str(meta.get('hours', '50')),
        '{{CATEGORY}}': str(meta.get('category', 'General')),
        '{{YEAR}}': str(meta.get('year', '2026')),
    }
    resolved_wording = wording_pattern
    for tag, val in replacements.items():
        resolved_wording = resolved_wording.replace(tag, val)

    # 2. Background color
    c.setFillColor(colors.HexColor("#FDFDFE"))
    c.rect(0, 0, page_width, page_height, fill=1, stroke=0)

    # 3. Optional Template Background Image
    try:
        if tpl and tpl.image:
            template_path = tpl.image.path
            if os.path.exists(template_path):
                c.saveState()
                c.setFillAlpha(0.12)
                c.drawImage(template_path, 0, 0, width=page_width, height=page_height, preserveAspectRatio=False)
                c.restoreState()
    except Exception:
        pass

    # 4. Ornate Themed Double Borders
    margin = 24
    c.setLineWidth(3.5)
    c.setStrokeColor(colors.HexColor(primary_hex))
    c.rect(margin, margin, page_width - 2 * margin, page_height - 2 * margin)

    inner_margin = 32
    c.setLineWidth(1.2)
    c.setStrokeColor(colors.HexColor(secondary_hex))
    c.rect(inner_margin, inner_margin, page_width - 2 * inner_margin, page_height - 2 * inner_margin)

    thin_margin = 36
    c.setLineWidth(0.5)
    c.setStrokeColor(colors.HexColor(accent_hex))
    c.rect(thin_margin, thin_margin, page_width - 2 * thin_margin, page_height - 2 * thin_margin)

    # Corner Ornaments (themed brackets)
    corner_size = 20
    for cx, cy, dx, dy in [
        (thin_margin + 4, page_height - thin_margin - 4, 1, -1),
        (page_width - thin_margin - 4, page_height - thin_margin - 4, -1, -1),
        (thin_margin + 4, thin_margin + 4, 1, 1),
        (page_width - thin_margin - 4, thin_margin + 4, -1, 1),
    ]:
        c.setStrokeColor(colors.HexColor(secondary_hex))
        c.setLineWidth(1.5)
        c.line(cx, cy, cx + dx * corner_size, cy)
        c.line(cx, cy, cx, cy + dy * corner_size)
        c.circle(cx + dx * 6, cy + dy * 6, 2, fill=1, stroke=0)

    # 5. Top Header & Title
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(colors.HexColor("#64748b"))
    c.drawCentredString(page_width / 2.0, page_height - 75, badge_text.upper())

    # Main Certificate Title Prefix
    c.setFont("Times-Bold", 32)
    c.setFillColor(colors.HexColor(primary_hex))
    c.drawCentredString(page_width / 2.0, page_height - 116, title_prefix.upper())

    # Subtitle
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(colors.HexColor(secondary_hex))
    c.drawCentredString(page_width / 2.0, page_height - 138, subtitle.upper())

    # Accent divider under title
    divider_w = 120
    c.setStrokeColor(colors.HexColor(secondary_hex))
    c.setLineWidth(1.5)
    c.line(page_width / 2.0 - divider_w, page_height - 150, page_width / 2.0 + divider_w, page_height - 150)
    c.circle(page_width / 2.0, page_height - 150, 3, fill=1, stroke=0)

    # 6. Presentation Line
    c.setFont("Times-Italic", 13)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(page_width / 2.0, page_height - 182, presentation_line)

    # 7. Recipient Name
    c.setFont("Times-Bold", 29)
    c.setFillColor(colors.HexColor("#0f172a"))
    recipient_text = certificate.recipient_name.upper()
    c.drawCentredString(page_width / 2.0, page_height - 222, recipient_text)

    # Underline below recipient name
    name_w = min(max(c.stringWidth(recipient_text, "Times-Bold", 29) + 40, 260), 550)
    c.setStrokeColor(colors.HexColor("#cbd5e1"))
    c.setLineWidth(1.0)
    c.line(page_width / 2.0 - name_w / 2.0, page_height - 232, page_width / 2.0 + name_w / 2.0, page_height - 232)

    # 8. Dynamic Wording & Achievement
    # Formatted description with dynamic tags
    c.setFont("Times-Italic", 12.5)
    c.setFillColor(colors.HexColor("#334155"))
    
    # Split wording into lines if long
    if len(resolved_wording) > 85:
        # Split gracefully at word boundary
        words = resolved_wording.split(' ')
        mid = len(words) // 2
        line1 = ' '.join(words[:mid])
        line2 = ' '.join(words[mid:])
        c.drawCentredString(page_width / 2.0, page_height - 258, line1)
        c.drawCentredString(page_width / 2.0, page_height - 276, line2)
    else:
        c.drawCentredString(page_width / 2.0, page_height - 262, resolved_wording)

    # Optional description / remarks if short
    if certificate.description and len(certificate.description.strip()) > 0:
        desc_line = certificate.description.strip().split("\n")[0]
        if len(desc_line) > 90:
            desc_line = desc_line[:87] + "..."
        c.setFont("Helvetica", 9.5)
        c.setFillColor(colors.HexColor("#64748b"))
        c.drawCentredString(page_width / 2.0, page_height - 302, desc_line)

    # 9. QR Code Generation
    clean_base_url = base_url.rstrip("/")
    verification_url = f"{clean_base_url}/verify/{certificate.certificate_number}"

    qr_img = generate_qr_code_image(verification_url)
    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)

    # QR Code positioning (centered lower section)
    qr_size = 85
    qr_x = (page_width - qr_size) / 2.0
    qr_y = 110

    # Decorative frame around QR
    c.setFillColor(colors.white)
    c.setStrokeColor(colors.HexColor("#e2e8f0"))
    c.setLineWidth(1)
    c.roundRect(qr_x - 5, qr_y - 5, qr_size + 10, qr_size + 10, 6, fill=1, stroke=1)

    # Draw QR code
    from reportlab.lib.utils import ImageReader
    c.drawImage(ImageReader(qr_buffer), qr_x, qr_y, width=qr_size, height=qr_size)

    # Under QR: Scan to verify & Certificate ID
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(colors.HexColor("#64748b"))
    c.drawCentredString(page_width / 2.0, qr_y - 14, "SCAN TO VERIFY AUTHENTICITY")

    c.setFont("Helvetica-Bold", 11.5)
    c.setFillColor(colors.HexColor(primary_hex))
    c.drawCentredString(page_width / 2.0, qr_y - 28, f"Certificate ID: {certificate.certificate_number}")

    # 10. Left Footer: Issued Date & Organization
    left_x = 90
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(left_x, 120, "ISSUED ON")
    c.setFont("Times-Roman", 11)
    c.setFillColor(colors.HexColor("#0f172a"))
    c.drawString(left_x, 105, issue_date_str)

    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(left_x, 88, "ORGANIZATION")
    c.setFont("Helvetica", 10.5)
    c.setFillColor(colors.HexColor(primary_hex))
    c.drawString(left_x, 74, org_name)

    # 11. Right Footer: Signatory & Seal
    right_x = page_width - 230
    line_w = 140
    # Signature line
    c.setStrokeColor(colors.HexColor("#94a3b8"))
    c.setLineWidth(1)
    c.line(right_x, 108, right_x + line_w, 108)

    c.setFont("Times-BoldItalic", 12)
    c.setFillColor(colors.HexColor(primary_hex))
    c.drawString(right_x, 92, signatory_name)

    c.setFont("Helvetica", 9)
    c.setFillColor(colors.HexColor("#64748b"))
    c.drawString(right_x, 78, signatory_title)

    # 12. Revocation Watermark if Certificate is Revoked
    if certificate.status == 'REVOKED':
        c.saveState()
        c.setFont("Helvetica-Bold", 80)
        c.setFillColor(colors.HexColor("#ef4444"))
        c.setFillAlpha(0.25)
        c.translate(page_width / 2.0, page_height / 2.0)
        c.rotate(35)
        c.drawCentredString(0, -25, "REVOKED")
        c.restoreState()

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.getvalue()
