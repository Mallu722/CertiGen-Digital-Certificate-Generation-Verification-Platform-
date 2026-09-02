import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certigen_backend.settings')
django.setup()

from categories.models import Category
from certificate_templates.models import Template

# 15 Purpose-Driven Certificate Templates
TEMPLATES_DATA = [
    {
        "name": "Certificate of Achievement",
        "category_name": "Achievement & Honors",
        "purpose": "Outstanding performance in academic, creative, or organizational milestones",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "ACHIEVEMENT",
        "presentation_line": "This certificate is proudly awarded to",
        "wording_pattern": "for outstanding achievement and distinguished excellence in {{EVENT_NAME}}",
        "primary_color": "#0f2744",  # Royal Deep Navy
        "secondary_color": "#c59b27",  # Imperial Gold
        "accent_color": "#e2d19f",
        "badge_text": "EXCELLENCE AWARD"
    },
    {
        "name": "Certificate of Participation",
        "category_name": "Events & Conferences",
        "purpose": "Active participation in summits, hackathons, and conferences",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "PARTICIPATION",
        "presentation_line": "This is proudly presented to",
        "wording_pattern": "for active and commendable participation in {{EVENT_NAME}} organized by {{ORGANIZATION_NAME}}",
        "primary_color": "#1e293b",  # Modern Slate
        "secondary_color": "#0d9488",  # Teal Jade
        "accent_color": "#99f6e4",
        "badge_text": "OFFICIAL PARTICIPANT"
    },
    {
        "name": "Certificate of Excellence",
        "category_name": "Achievement & Honors",
        "purpose": "Exceptional academic or work performance of the highest distinction",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "EXCELLENCE",
        "presentation_line": "This certificate of distinction recognizes",
        "wording_pattern": "for demonstrating exceptional mastery, ranking {{RANK}}, and setting an exemplary standard in {{EVENT_NAME}}",
        "primary_color": "#312e81",  # Royal Indigo
        "secondary_color": "#d97706",  # Pure Gold
        "accent_color": "#fde68a",
        "badge_text": "HIGHEST DISTINCTION"
    },
    {
        "name": "Certificate of Completion",
        "category_name": "Courses & Academics",
        "purpose": "Successfully completing a structured curriculum, course, or bootcamp",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "COMPLETION",
        "presentation_line": "This certifies that",
        "wording_pattern": "has successfully satisfied all rigorous curriculum requirements for {{EVENT_NAME}} (Duration: {{DURATION}})",
        "primary_color": "#064e3b",  # Forest Emerald
        "secondary_color": "#b45309",  # Classic Amber Gold
        "accent_color": "#a7f3d0",
        "badge_text": "COURSE COMPLETED"
    },
    {
        "name": "Certificate of Appreciation",
        "category_name": "Recognition & Service",
        "purpose": "Appreciating valuable contribution, mentorship, or service",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "APPRECIATION",
        "presentation_line": "In grateful and sincere recognition of",
        "wording_pattern": "for invaluable contributions, selfless commitment, and dedication to {{EVENT_NAME}} with {{ORGANIZATION_NAME}}",
        "primary_color": "#881337",  # Deep Crimson Rose
        "secondary_color": "#d97706",  # Radiant Gold
        "accent_color": "#fecdd3",
        "badge_text": "IN APPRECIATION"
    },
    {
        "name": "Certificate of Merit",
        "category_name": "Achievement & Honors",
        "purpose": "Academic or professional merit with high grading or commendations",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "MERIT",
        "presentation_line": "This certificate of merit is officially awarded to",
        "wording_pattern": "in recognition of meritorious accomplishment, perseverance, and scholastic excellence in {{EVENT_NAME}}",
        "primary_color": "#091e3a",  # Midnight Navy
        "secondary_color": "#ca8a04",  # Goldenrod
        "accent_color": "#fef08a",
        "badge_text": "MERIT DISTINCTION"
    },
    {
        "name": "Best Performer Certificate",
        "category_name": "Performance & Work",
        "purpose": "Best performer or top contributor in an event, sprint, or team",
        "title_prefix": "BEST PERFORMER",
        "subtitle": "ANNUAL AWARD",
        "presentation_line": "This honor is proudly bestowed upon",
        "wording_pattern": "for outstanding performance, exceptional drive, and emerging as the Best Performer in {{EVENT_NAME}}",
        "primary_color": "#4c1d95",  # Deep Violet
        "secondary_color": "#eab308",  # Electric Amber
        "accent_color": "#ddd6fe",
        "badge_text": "TOP PERFORMER"
    },
    {
        "name": "Hackathon Certificate",
        "category_name": "Technology & Hackathons",
        "purpose": "Hackathon winners, runners up, and innovation participants",
        "title_prefix": "HACKATHON INNOVATION",
        "subtitle": "EXCELLENCE AWARD",
        "presentation_line": "This credential is awarded to",
        "wording_pattern": "for breakthrough engineering and securing {{RANK}} in the {{EVENT_NAME}} with Team {{TEAM_NAME}}",
        "primary_color": "#020617",  # Cyber Slate
        "secondary_color": "#0284c7",  # Sky Blue / Cyan
        "accent_color": "#38bdf8",
        "badge_text": "HACKATHON WINNER"
    },
    {
        "name": "Workshop Certificate",
        "category_name": "Workshops & Seminars",
        "purpose": "Hands-on workshop attendance and skill validation",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "WORKSHOP PARTICIPATION",
        "presentation_line": "This is awarded to",
        "wording_pattern": "for successfully completing the hands-on technical workshop on {{EVENT_NAME}} mentored by {{INSTRUCTOR}}",
        "primary_color": "#134e4a",  # Teal Forest
        "secondary_color": "#d97706",  # Copper Gold
        "accent_color": "#99f6e4",
        "badge_text": "HANDS-ON WORKSHOP"
    },
    {
        "name": "Internship Certificate",
        "category_name": "Professional & Career",
        "purpose": "Successful internship tenure and practical experience",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "INTERNSHIP COMPLETION",
        "presentation_line": "This certifies that",
        "wording_pattern": "has satisfactorily completed the professional {{ROLE}} Internship at {{ORGANIZATION_NAME}} for {{DURATION}}",
        "primary_color": "#1e293b",  # Steel Navy
        "secondary_color": "#2563eb",  # Royal Sapphire
        "accent_color": "#bfdbfe",
        "badge_text": "VERIFIED INTERN"
    },
    {
        "name": "Training Certificate",
        "category_name": "Professional & Career",
        "purpose": "Professional industry or technical training course completion",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "PROFESSIONAL TRAINING",
        "presentation_line": "This is officially awarded to",
        "wording_pattern": "for successfully mastering the curriculum and competencies in {{EVENT_NAME}} (Duration: {{DURATION}})",
        "primary_color": "#18181b",  # Graphite Charcoal
        "secondary_color": "#4f46e5",  # Deep Indigo
        "accent_color": "#c7d2fe",
        "badge_text": "CERTIFIED TRAINING"
    },
    {
        "name": "Volunteer Certificate",
        "category_name": "Recognition & Service",
        "purpose": "Volunteering, community outreach, and social service",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "COMMUNITY SERVICE",
        "presentation_line": "With deepest appreciation to",
        "wording_pattern": "for contributing {{HOURS}} hours of dedicated volunteer service and selfless leadership during {{EVENT_NAME}}",
        "primary_color": "#14532d",  # Evergreen
        "secondary_color": "#ca8a04",  # Warm Sun
        "accent_color": "#bbf7d0",
        "badge_text": "COMMUNITY HERO"
    },
    {
        "name": "Sports Achievement Certificate",
        "category_name": "Sports & Athletics",
        "purpose": "Sports tournaments, championships, and athletic excellence",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "ATHLETIC EXCELLENCE",
        "presentation_line": "This is proudly presented to",
        "wording_pattern": "for extraordinary sportsmanship and triumphing at {{RANK}} position in {{EVENT_NAME}} ({{CATEGORY}})",
        "primary_color": "#172554",  # Deep Stadium Navy
        "secondary_color": "#ea580c",  # Olympic Blaze Orange
        "accent_color": "#fed7aa",
        "badge_text": "SPORTS CHAMPION"
    },
    {
        "name": "Leadership Certificate",
        "category_name": "Recognition & Service",
        "purpose": "Leadership, student government, or organizational stewardship",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "LEADERSHIP EXCELLENCE",
        "presentation_line": "In distinguished recognition of",
        "wording_pattern": "for exemplary visionary guidance, integrity, and impactful stewardship as {{ROLE}} in {{EVENT_NAME}}",
        "primary_color": "#581c87",  # Regal Purple
        "secondary_color": "#e11d48",  # Rose Gold
        "accent_color": "#fbcfe8",
        "badge_text": "EXEMPLARY LEADER"
    },
    {
        "name": "Academic Excellence Certificate",
        "category_name": "Courses & Academics",
        "purpose": "Top academic rank, Dean's list, or semester distinction",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "ACADEMIC EXCELLENCE",
        "presentation_line": "This academic honor is awarded to",
        "wording_pattern": "in recognition of superior scholarly distinction, achieving Grade/Rank {{RANK}} in {{EVENT_NAME}}",
        "primary_color": "#7f1d1d",  # University Maroon
        "secondary_color": "#d97706",  # Academic Gold
        "accent_color": "#fef08a",
        "badge_text": "DEAN'S HONORS"
    }
]

def run_seed():
    print("Seeding 15 Certificate Templates for CertiGen...")
    for item in TEMPLATES_DATA:
        category, _ = Category.objects.get_or_create(
            name=item["category_name"],
            defaults={"description": f"Templates for {item['category_name']}"}
        )

        template, created = Template.objects.update_or_create(
            name=item["name"],
            defaults={
                "category": category,
                "purpose": item["purpose"],
                "description": item["purpose"],
                "title_prefix": item["title_prefix"],
                "subtitle": item["subtitle"],
                "presentation_line": item["presentation_line"],
                "wording_pattern": item["wording_pattern"],
                "primary_color": item["primary_color"],
                "secondary_color": item["secondary_color"],
                "accent_color": item["accent_color"],
                "badge_text": item["badge_text"],
                "is_active": True
            }
        )
        status = "Created" if created else "Updated"
        print(f"[{status}] {template.name} ({category.name})")

    print(f"\nTotal Templates in DB: {Template.objects.count()}")

if __name__ == '__main__':
    run_seed()
