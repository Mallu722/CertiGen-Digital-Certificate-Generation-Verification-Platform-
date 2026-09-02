import io
import os
import base64
import math
import qrcode
from PIL import Image
from django.conf import settings
from django.utils import timezone
from reportlab.lib.pagesizes import letter, landscape, A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


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


def draw_gold_seal_with_ribbons(c, x, y, radius=32, primary_hex="#0f2744", secondary_hex="#c59b27"):
    """Draw a luxury gold embossed store award seal with dual silk ribbons."""
    c.saveState()
    
    # 1. Silk Ribbons hanging below seal
    ribbon_w = 14
    ribbon_h = 36
    
    # Left Ribbon (primary theme color)
    c.setFillColor(colors.HexColor(primary_hex))
    c.setStrokeColor(colors.HexColor(primary_hex))
    p1 = c.beginPath()
    p1.moveTo(x - 14, y - 5)
    p1.lineTo(x - 2, y - 5)
    p1.lineTo(x - 2, y - ribbon_h - 10)
    p1.lineTo(x - 8, y - ribbon_h - 4)
    p1.lineTo(x - 14, y - ribbon_h - 10)
    p1.close()
    c.drawPath(p1, fill=1, stroke=0)

    # Right Ribbon (secondary / gold color)
    c.setFillColor(colors.HexColor(secondary_hex))
    c.setStrokeColor(colors.HexColor(secondary_hex))
    p2 = c.beginPath()
    p2.moveTo(x + 2, y - 5)
    p2.lineTo(x + 14, y - 5)
    p2.lineTo(x + 14, y - ribbon_h - 10)
    p2.lineTo(x + 8, y - ribbon_h - 4)
    p2.lineTo(x + 2, y - ribbon_h - 10)
    p2.close()
    c.drawPath(p2, fill=1, stroke=0)

    # 2. Outer Serrated Starburst Gold Medal
    points = 24
    outer_r = radius
    inner_r = radius - 4
    
    c.setFillColor(colors.HexColor("#f59e0b"))
    c.setStrokeColor(colors.HexColor("#b45309"))
    c.setLineWidth(1)
    
    star_path = c.beginPath()
    for i in range(points * 2):
        angle = i * (math.pi / points)
        r = outer_r if i % 2 == 0 else inner_r
        px = x + r * math.cos(angle)
        py = y + r * math.sin(angle)
        if i == 0:
            star_path.moveTo(px, py)
        else:
            star_path.lineTo(px, py)
    star_path.close()
    c.drawPath(star_path, fill=1, stroke=1)

    # 3. Inner Gold Ring
    c.setFillColor(colors.HexColor("#ca8a04"))
    c.setStrokeColor(colors.HexColor("#fef08a"))
    c.setLineWidth(1.5)
    c.circle(x, y, radius - 6, fill=1, stroke=1)

    # 4. Central Core
    c.setFillColor(colors.HexColor("#854d0e"))
    c.circle(x, y, radius - 11, fill=1, stroke=0)

    # 5. Text inside Medal
    c.setFillColor(colors.HexColor("#fef08a"))
    c.setFont("Helvetica-Bold", 6.5)
    c.drawCentredString(x, y + 6, "OFFICIAL")
    c.setFont("Helvetica-Bold", 8.5)
    c.drawCentredString(x, y - 3, "SEAL")
    c.setFont("Helvetica", 5.5)
    c.drawCentredString(x, y - 10, "★ 2026 ★")

    c.restoreState()


def generate_certificate_pdf(certificate, base_url="http://localhost:5173") -> bytes:
    """
    Generate a dynamic, high-resolution vector PDF certificate.
    Supports store certificate themes, institute logos, gold embossed seals,
    dual signature lines, and dynamic text replacement.
    """
    buffer = io.BytesIO()
    page_width, page_height = landscape(A4)
    c = canvas.Canvas(buffer, pagesize=(page_width, page_height))
    c.setTitle(f"Certificate - {certificate.certificate_number}")
    c.setAuthor("CertiGen Platform")
    c.setSubject(certificate.title)

    # 1. Metadata and Custom Colors / Logos
    meta = getattr(certificate, 'metadata', {}) or {}
    tpl = getattr(certificate, 'template', None)
    
    # Custom color overrides from metadata or template defaults
    primary_hex = meta.get('primary_color') or getattr(tpl, 'primary_color', '#0f2744') or '#0f2744'
    secondary_hex = meta.get('secondary_color') or getattr(tpl, 'secondary_color', '#c59b27') or '#c59b27'
    accent_hex = meta.get('accent_color') or getattr(tpl, 'accent_color', '#e2d19f') or '#e2d19f'
    
    title_prefix = getattr(tpl, 'title_prefix', 'CERTIFICATE OF') or 'CERTIFICATE OF'
    subtitle = getattr(tpl, 'subtitle', 'ACHIEVEMENT') or 'ACHIEVEMENT'
    presentation_line = getattr(tpl, 'presentation_line', 'This is proudly presented to') or 'This is proudly presented to'
    wording_pattern = getattr(tpl, 'wording_pattern', '') or 'for outstanding achievement in {{EVENT_NAME}}'
    badge_text = getattr(tpl, 'badge_text', 'OFFICIAL MERIT DISTINCTION') or 'OFFICIAL MERIT DISTINCTION'
    
    org_name = getattr(certificate, 'organization_name', 'CertiGen Platform') or 'CertiGen Platform'
    achievement_val = getattr(certificate, 'achievement', '') or 'Distinguished Achievement'
    signatory_name = getattr(certificate, 'signatory_name', 'Dr. Rajesh Kumar') or 'Dr. Rajesh Kumar'
    signatory_title = getattr(certificate, 'signatory_title', 'Dean of Academic Affairs') or 'Dean of Academic Affairs'
    second_signatory_name = meta.get('second_signatory_name', 'Prof. Vikram Singh')
    second_signatory_title = meta.get('second_signatory_title', 'Program Director')
    
    # Date formatting
    issue_date_str = certificate.issued_at.strftime('%d %B %Y') if certificate.issued_at else timezone.now().strftime('%d %B %Y')

    # Resolve dynamic variables in wording pattern
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

    # 2. Background color & subtle texture
    c.setFillColor(colors.HexColor("#FDFDFE"))
    c.rect(0, 0, page_width, page_height, fill=1, stroke=0)

    # 3. Store-Style Ornate Borders
    # Outer Thick Border
    margin = 22
    c.setLineWidth(4.5)
    c.setStrokeColor(colors.HexColor(primary_hex))
    c.rect(margin, margin, page_width - 2 * margin, page_height - 2 * margin)

    # Middle Gold Filigree Border
    inner_margin = 30
    c.setLineWidth(1.5)
    c.setStrokeColor(colors.HexColor(secondary_hex))
    c.rect(inner_margin, inner_margin, page_width - 2 * inner_margin, page_height - 2 * inner_margin)

    # Thin Accent Dotted Line
    thin_margin = 35
    c.setLineWidth(0.6)
    c.setStrokeColor(colors.HexColor(accent_hex))
    c.rect(thin_margin, thin_margin, page_width - 2 * thin_margin, page_height - 2 * thin_margin)

    # Corner Ornaments (themed brackets)
    corner_size = 24
    for cx, cy, dx, dy in [
        (thin_margin + 3, page_height - thin_margin - 3, 1, -1),
        (page_width - thin_margin - 3, page_height - thin_margin - 3, -1, -1),
        (thin_margin + 3, thin_margin + 3, 1, 1),
        (page_width - thin_margin - 3, thin_margin + 3, -1, 1),
    ]:
        c.setStrokeColor(colors.HexColor(secondary_hex))
        c.setLineWidth(1.8)
        c.line(cx, cy, cx + dx * corner_size, cy)
        c.line(cx, cy, cx, cy + dy * corner_size)
        c.circle(cx + dx * 8, cy + dy * 8, 2.5, fill=1, stroke=0)

    # 4. Top Header & Organization Logo
    # Draw custom Institute Logo if provided as base64 image
    logo_drawn = False
    inst_logo = meta.get('institute_logo_base64')
    if inst_logo and inst_logo.startswith('data:image'):
        try:
            format_part, imgstr = inst_logo.split(';base64,')
            img_data = base64.b64decode(imgstr)
            logo_img = Image.open(io.BytesIO(img_data))
            logo_buffer = io.BytesIO()
            logo_img.save(logo_buffer, format='PNG')
            logo_buffer.seek(0)
            c.drawImage(ImageReader(logo_buffer), page_width / 2.0 - 24, page_height - 98, width=48, height=48, preserveAspectRatio=True)
            logo_drawn = True
        except Exception:
            logo_drawn = False

    if not logo_drawn:
        # Default Gold Crest Icon
        c.setFillColor(colors.HexColor(secondary_hex))
        c.circle(page_width / 2.0, page_height - 72, 14, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(page_width / 2.0, page_height - 76, "★")

    # Organization Name
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(colors.HexColor(primary_hex))
    c.drawCentredString(page_width / 2.0, page_height - 104, org_name.upper())

    # Badge Ribbon Text
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(colors.HexColor(secondary_hex))
    c.drawCentredString(page_width / 2.0, page_height - 117, f"★ {badge_text.upper()} ★")

    # 5. Main Title & Subtitle
    c.setFont("Times-Bold", 34)
    c.setFillColor(colors.HexColor(primary_hex))
    c.drawCentredString(page_width / 2.0, page_height - 152, title_prefix.upper())

    c.setFont("Helvetica-Bold", 15)
    c.setFillColor(colors.HexColor(secondary_hex))
    c.drawCentredString(page_width / 2.0, page_height - 172, subtitle.upper())

    # Accent divider under title
    divider_w = 110
    c.setStrokeColor(colors.HexColor(secondary_hex))
    c.setLineWidth(1.5)
    c.line(page_width / 2.0 - divider_w, page_height - 182, page_width / 2.0 + divider_w, page_height - 182)
    c.circle(page_width / 2.0, page_height - 182, 3, fill=1, stroke=0)

    # 6. Presentation Line
    c.setFont("Times-Italic", 13.5)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(page_width / 2.0, page_height - 212, presentation_line)

    # 7. Recipient Name
    c.setFont("Times-Bold", 30)
    c.setFillColor(colors.HexColor("#0f172a"))
    recipient_text = certificate.recipient_name.upper()
    c.drawCentredString(page_width / 2.0, page_height - 250, recipient_text)

    # Underline below recipient name
    name_w = min(max(c.stringWidth(recipient_text, "Times-Bold", 30) + 40, 260), 550)
    c.setStrokeColor(colors.HexColor(secondary_hex))
    c.setLineWidth(1.2)
    c.line(page_width / 2.0 - name_w / 2.0, page_height - 258, page_width / 2.0 + name_w / 2.0, page_height - 258)

    # 8. Dynamic Wording & Achievement
    c.setFont("Times-Italic", 12.5)
    c.setFillColor(colors.HexColor("#334155"))
    
    if len(resolved_wording) > 85:
        words = resolved_wording.split(' ')
        mid = len(words) // 2
        line1 = ' '.join(words[:mid])
        line2 = ' '.join(words[mid:])
        c.drawCentredString(page_width / 2.0, page_height - 282, f'"{line1}')
        c.drawCentredString(page_width / 2.0, page_height - 298, f'{line2}"')
    else:
        c.drawCentredString(page_width / 2.0, page_height - 286, f'"{resolved_wording}"')

    # 9. Gold Embossed Store Seal on Left
    draw_gold_seal_with_ribbons(c, 115, 145, radius=30, primary_hex=primary_hex, secondary_hex=secondary_hex)

    # 10. Center: Verification QR Code
    clean_base_url = base_url.rstrip("/")
    verification_url = f"{clean_base_url}/verify/{certificate.certificate_number}"

    qr_img = generate_qr_code_image(verification_url)
    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)

    qr_size = 76
    qr_x = (page_width - qr_size) / 2.0
    qr_y = 100

    # Decorative frame around QR
    c.setFillColor(colors.white)
    c.setStrokeColor(colors.HexColor("#e2e8f0"))
    c.setLineWidth(1)
    c.roundRect(qr_x - 5, qr_y - 5, qr_size + 10, qr_size + 10, 6, fill=1, stroke=1)
    c.drawImage(ImageReader(qr_buffer), qr_x, qr_y, width=qr_size, height=qr_size)

    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(colors.HexColor("#64748b"))
    c.drawCentredString(page_width / 2.0, qr_y - 14, "SCAN TO VERIFY AUTHENTICITY")

    c.setFont("Helvetica-Bold", 10.5)
    c.setFillColor(colors.HexColor(primary_hex))
    c.drawCentredString(page_width / 2.0, qr_y - 26, f"Certificate ID: {certificate.certificate_number}")

    # 11. Dual Signature Lines
    # Left: Authorized Signatory
    left_x = 75
    c.setStrokeColor(colors.HexColor("#94a3b8"))
    c.setLineWidth(1)
    c.line(left_x, 78, left_x + 130, 78)

    c.setFont("Times-BoldItalic", 11)
    c.setFillColor(colors.HexColor(primary_hex))
    c.drawString(left_x, 64, signatory_name)

    c.setFont("Helvetica", 8.5)
    c.setFillColor(colors.HexColor("#64748b"))
    c.drawString(left_x, 52, signatory_title)
    
    c.setFont("Helvetica", 7.5)
    c.drawString(left_x, 42, f"Date: {issue_date_str}")

    # Right: Dean / Director Signatory
    right_x = page_width - 205
    c.line(right_x, 78, right_x + 130, 78)

    c.setFont("Times-BoldItalic", 11)
    c.setFillColor(colors.HexColor(primary_hex))
    c.drawString(right_x, 64, second_signatory_name)

    c.setFont("Helvetica", 8.5)
    c.setFillColor(colors.HexColor("#64748b"))
    c.drawString(right_x, 52, second_signatory_title)

    c.setFont("Helvetica", 7.5)
    c.drawString(right_x, 42, "CertiGen Verified Credential")

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
