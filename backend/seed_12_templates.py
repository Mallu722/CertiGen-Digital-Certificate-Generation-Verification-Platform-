import os
import django
import uuid
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certigen_backend.settings')
django.setup()

from categories.models import Category
from certificate_templates.models import Template
from certificates.models import Certificate
from accounts.models import User

# The 4 Required Categories
CATEGORIES_DATA = [
    {
        "name": "Sports",
        "description": "Athletic championships, tournaments, track & field meets, and sportsmanship accolades."
    },
    {
        "name": "College Event",
        "description": "Collegiate cultural festivals, technical symposiums, research presentations, and organizing committee leadership."
    },
    {
        "name": "Hackathon",
        "description": "Software engineering hackathons, rapid prototyping, AI buildathons, and elite cybersecurity CTFs."
    },
    {
        "name": "Corporate",
        "description": "Enterprise performance, quarterly MVPs, board-level commendations, and executive leadership honors."
    }
]

# Exactly 12 Pinterest-Inspired Certificate Templates (3 per Category, exactly 2 Private)
TEMPLATES_DATA = [
    # ==================== SPORTS CATEGORY (3 Templates - All Public) ====================
    {
        "name": "Sports Championship Excellence",
        "category_name": "Sports",
        "purpose": "Annual athletic championships, tournament victories, and gold medal honors",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "ATHLETIC EXCELLENCE & VICTORY",
        "presentation_line": "This credential of distinction is proudly conferred upon",
        "wording_pattern": "for demonstrating superior sportsmanship, supreme athletic vigor, and securing First Place in {{EVENT_NAME}}",
        "primary_color": "#0f172a",  # Stadium Slate
        "secondary_color": "#ea580c",  # Olympic Blaze
        "accent_color": "#fed7aa",
        "badge_text": "GOLD MEDAL CHAMPION",
        "is_private": False,
        "access_password": ""
    },
    {
        "name": "Best Athlete of the Tournament",
        "category_name": "Sports",
        "purpose": "Tournament MVP, individual athletic grit, and extraordinary fair play",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "OUTSTANDING SPORTSMANSHIP",
        "presentation_line": "This is enthusiastically presented to",
        "wording_pattern": "in recognition of unrelenting stamina, inspiring teamwork, and emerging as the Most Valuable Player in {{EVENT_NAME}}",
        "primary_color": "#1e3a8a",  # Deep Royal Blue
        "secondary_color": "#fbbf24",  # Golden Laurel
        "accent_color": "#fef3c7",
        "badge_text": "TOURNAMENT MVP",
        "is_private": False,
        "access_password": ""
    },
    {
        "name": "Inter-College Sports Trophy",
        "category_name": "Sports",
        "purpose": "Inter-university athletic representation, relays, and team sports honors",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "INTER-COLLEGE ATHLETIC COMMENDATION",
        "presentation_line": "This certificate is officially awarded to",
        "wording_pattern": "for commendable representation, disciplined conditioning, and exemplary athletic grit representing {{ORGANIZATION_NAME}} in {{EVENT_NAME}}",
        "primary_color": "#064e3b",  # Field Emerald
        "secondary_color": "#d97706",  # Bronze Amber
        "accent_color": "#a7f3d0",
        "badge_text": "OFFICIAL ATHLETE",
        "is_private": False,
        "access_password": ""
    },

    # ==================== COLLEGE EVENT CATEGORY (3 Templates - All Public) ====================
    {
        "name": "Campus Cultural Fest Laureate",
        "category_name": "College Event",
        "purpose": "Music, dance, fine arts, drama, and collegiate cultural festival showcases",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "CULTURAL FESTIVAL MERIT",
        "presentation_line": "In high celebration of artistic brilliance, awarded to",
        "wording_pattern": "for an enthralling and distinguished performance winning {{RANK}} place in the {{EVENT_NAME}} Cultural Extravaganza",
        "primary_color": "#4c1d95",  # Regal Festival Purple
        "secondary_color": "#f43f5e",  # Vibrant Rose
        "accent_color": "#fbcfe8",
        "badge_text": "CULTURAL LAUREATE",
        "is_private": False,
        "access_password": ""
    },
    {
        "name": "Technical Symposium & Paper Presentation",
        "category_name": "College Event",
        "purpose": "College technical symposiums, engineering paper publications, and presentations",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "SCHOLASTIC & RESEARCH DISTINCTION",
        "presentation_line": "This certificate of scholastic distinction recognizes",
        "wording_pattern": "for authoring and presenting innovative technical research on {{TOPIC}} at the Annual National Symposium {{EVENT_NAME}}",
        "primary_color": "#0f2744",  # Academic Navy
        "secondary_color": "#0284c7",  # Electric Cerulean
        "accent_color": "#bae6fd",
        "badge_text": "RESEARCH EXCELLENCE",
        "is_private": False,
        "access_password": ""
    },
    {
        "name": "College Organizing Committee Award",
        "category_name": "College Event",
        "purpose": "Student coordinators, core committee heads, and event organizers",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "LEADERSHIP & ORGANIZING SERVICE",
        "presentation_line": "With sincere gratitude and high commendation to",
        "wording_pattern": "for tireless dedication, operational leadership, and remarkable execution as Student Coordinator of {{EVENT_NAME}}",
        "primary_color": "#334155",  # Slate Navy
        "secondary_color": "#10b981",  # Emerald Seal
        "accent_color": "#d1fae5",
        "badge_text": "ORGANIZING HERO",
        "is_private": False,
        "access_password": ""
    },

    # ==================== HACKATHON CATEGORY (3 Templates - 1 PRIVATE, 2 Public) ====================
    {
        "name": "Hackathon Grand Champion Award",
        "category_name": "Hackathon",
        "purpose": "Grand champion, 1st place overall winner, and best product prototype in 36h hackathon",
        "title_prefix": "HACKATHON INNOVATION",
        "subtitle": "GRAND CHAMPION TROPHY",
        "presentation_line": "This prestigious engineering credential is presented to",
        "wording_pattern": "for engineering an extraordinary, scalable prototype and claiming 1st Place overall in {{EVENT_NAME}} with Team {{TEAM_NAME}}",
        "primary_color": "#020617",  # Cyber Midnight
        "secondary_color": "#06b6d4",  # Neon Cyan
        "accent_color": "#67e8f9",
        "badge_text": "1ST PLACE HACKER",
        "is_private": False,
        "access_password": ""
    },
    {
        "name": "Best Prototype & AI Innovation Award",
        "category_name": "Hackathon",
        "purpose": "AI track winners, innovative machine learning architecture, and product craftsmanship",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "BEST AI & TECH INNOVATION",
        "presentation_line": "Awarded with technical acclaim to",
        "wording_pattern": "for pioneering the most inventive AI-driven architecture and product execution in {{EVENT_NAME}}",
        "primary_color": "#18181b",  # Developer Obsidian
        "secondary_color": "#8b5cf6",  # AI Violet
        "accent_color": "#c4b5fd",
        "badge_text": "AI INNOVATOR",
        "is_private": False,
        "access_password": ""
    },
    {
        "name": "Elite Cyber Security CTF Champion",  # PRIVATE TEMPLATE 1
        "category_name": "Hackathon",
        "purpose": "Restricted credential for confidential Capture-The-Flag (CTF) and defense operations",
        "title_prefix": "EXCLUSIVE CITATION",
        "subtitle": "ELITE CYBERSECURITY DEFENDER",
        "presentation_line": "This confidential master credential is authorized and conferred upon",
        "wording_pattern": "for demonstrating elite offensive & defensive cybersecurity prowess and dominating the Classified National CTF in {{EVENT_NAME}}",
        "primary_color": "#09090b",  # Deep Darknet Black
        "secondary_color": "#10b981",  # Matrix Hacker Green
        "accent_color": "#a7f3d0",
        "badge_text": "CERTIFIED DEFENDER",
        "is_private": True,
        "access_password": "HACK2026"
    },

    # ==================== CORPORATE CATEGORY (3 Templates - 1 PRIVATE, 2 Public) ====================
    {
        "name": "Corporate Excellence & MVP Award",
        "category_name": "Corporate",
        "purpose": "Annual corporate MVP, strategic cross-functional impact, and exceptional business delivery",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "CORPORATE EXCELLENCE & MVP",
        "presentation_line": "This corporate distinction is proudly presented to",
        "wording_pattern": "in recognition of stellar professional commitment, extraordinary teamwork, and exemplary business outcomes in {{EVENT_NAME}}",
        "primary_color": "#111827",  # Corporate Charcoal
        "secondary_color": "#c59b27",  # Imperial Gold
        "accent_color": "#fef08a",
        "badge_text": "ANNUAL MVP",
        "is_private": False,
        "access_password": ""
    },
    {
        "name": "Star Performer of the Year",
        "category_name": "Corporate",
        "purpose": "Outstanding annual delivery, team acceleration, and engineering/operational excellence",
        "title_prefix": "CERTIFICATE OF",
        "subtitle": "STAR PERFORMER COMMENDATION",
        "presentation_line": "Conferred with highest corporate regards upon",
        "wording_pattern": "for consistently exceeding key performance benchmarks, inspiring colleagues, and setting new standards of enterprise excellence",
        "primary_color": "#1e1b4b",  # Executive Indigo
        "secondary_color": "#f59e0b",  # Radiant Amber
        "accent_color": "#fde68a",
        "badge_text": "TOP PERFORMER",
        "is_private": False,
        "access_password": ""
    },
    {
        "name": "Executive Leadership & Board Commendation",  # PRIVATE TEMPLATE 2
        "category_name": "Corporate",
        "purpose": "Restricted board-level executive leadership, confidential governance, and C-suite honors",
        "title_prefix": "PRIVATE CITATION",
        "subtitle": "EXECUTIVE LEADERSHIP COMMENDATION",
        "presentation_line": "By unanimous decree of the Governing Board, conferred upon",
        "wording_pattern": "in distinguished tribute to visionary enterprise leadership, strategic governance, and transformative stewardship of {{ORGANIZATION_NAME}}",
        "primary_color": "#1c1917",  # Luxury Onyx
        "secondary_color": "#e11d48",  # Rose Gold Imperial
        "accent_color": "#fecdd3",
        "badge_text": "EXECUTIVE HONORS",
        "is_private": True,
        "access_password": "CORP2026"
    }
]

# Sample Certificates to Issue Across the 4 Categories
CERTIFICATES_DATA = [
    # Sports Certificates
    {
        "certificate_number": "CERT-2026-SP001",
        "title": "Inter-University Track & Field Championship 2026",
        "template_name": "Sports Championship Excellence",
        "recipient_name": "Mallikarjun Hiremath",
        "recipient_email": "mallikarjun.hiremath.s72@kalvium.community",
        "achievement": "1st Place - 400m Sprint Gold Medalist",
        "organization_name": "National Collegiate Athletics Association",
        "signatory_name": "Coach Marcus Vance",
        "signatory_title": "Athletics Director",
        "description": "Awarded for exceptional speed, sportsmanship, and breaking the collegiate 400m record."
    },
    {
        "certificate_number": "CERT-2026-SP002",
        "title": "National Inter-College Badminton Championship",
        "template_name": "Best Athlete of the Tournament",
        "recipient_name": "Priya Patel",
        "recipient_email": "priya.patel@sportsmail.edu",
        "achievement": "Tournament MVP & Women's Singles Champion",
        "organization_name": "All India Badminton Federation",
        "signatory_name": "Dr. Sunita Deshmukh",
        "signatory_title": "Tournament Commissioner",
        "description": "Honoring unmatched agility, tactical precision, and undefeated tournament record."
    },
    {
        "certificate_number": "CERT-2026-SP003",
        "title": "State University Football League 2026",
        "template_name": "Inter-College Sports Trophy",
        "recipient_name": "Rohan Nair",
        "recipient_email": "rohan.nair@stateuniv.edu",
        "achievement": "Team Captain - Champion Trophy Representation",
        "organization_name": "State Collegiate Sports Council",
        "signatory_name": "David Sterling",
        "signatory_title": "Chief Sports Officer",
        "description": "Awarded for inspiring on-field leadership and guiding the varsity team to victory."
    },

    # College Event Certificates
    {
        "certificate_number": "CERT-2026-CE001",
        "title": "Sanskriti National Cultural Fest 2026",
        "template_name": "Campus Cultural Fest Laureate",
        "recipient_name": "Diya Sengupta",
        "recipient_email": "diya.sengupta@artsfest.org",
        "achievement": "1st Place - Classical & Fusion Vocal Solo",
        "organization_name": "Apex University Arts Society",
        "signatory_name": "Dr. Ananya Roy",
        "signatory_title": "Dean of Student Affairs",
        "description": "Conferred for an enthralling, soul-stirring vocal performance."
    },
    {
        "certificate_number": "CERT-2026-CE002",
        "title": "TechNext AI & Robotics National Symposium",
        "template_name": "Technical Symposium & Paper Presentation",
        "recipient_name": "Amit Kumar",
        "recipient_email": "amit.kumar@techsymp.org",
        "achievement": "Best Research Paper - Neural Interface Systems",
        "organization_name": "Institute of Electrical & Computer Engineering",
        "signatory_name": "Prof. Arvind Ramanathan",
        "signatory_title": "Symposium Chair",
        "description": "Recognizing pioneering technical research and innovative live hardware demonstration."
    },
    {
        "certificate_number": "CERT-2026-CE003",
        "title": "Annual Technovation Festival 2026",
        "template_name": "College Organizing Committee Award",
        "recipient_name": "Sneha Reddy",
        "recipient_email": "sneha.reddy@campusfests.org",
        "achievement": "Head Coordinator - Operations & Public Relations",
        "organization_name": "Campus Student Council",
        "signatory_name": "Dr. Rajesh Kumar",
        "signatory_title": "Principal & Patron",
        "description": "Acknowledging outstanding organizing prowess, logistics management, and community impact."
    },

    # Hackathon Certificates
    {
        "certificate_number": "CERT-2026-HK001",
        "title": "Global HackSprint 36-Hour Hackathon",
        "template_name": "Hackathon Grand Champion Award",
        "recipient_name": "Mallikarjun Hiremath",
        "recipient_email": "mallikarjun.hiremath.s72@kalvium.community",
        "achievement": "Grand Champion - Built CertiGen Platform (Team Alpha)",
        "organization_name": "Global Tech Innovators Foundation",
        "signatory_name": "Satya Nadella",
        "signatory_title": "Honorary Jury Member",
        "description": "Winner among 250+ teams for creating a production-grade verified credential ecosystem."
    },
    {
        "certificate_number": "CERT-2026-HK002",
        "title": "NextGen AI Buildathon 2026",
        "template_name": "Best Prototype & AI Innovation Award",
        "recipient_name": "Vikramaditya Rao",
        "recipient_email": "vikram.rao@aihack.dev",
        "achievement": "Best AI Innovation - Multi-Modal Voice Agent",
        "organization_name": "Deep Tech Founders Club",
        "signatory_name": "Elena Rostova",
        "signatory_title": "Head of AI Research",
        "description": "Awarded for exceptional engineering in deploying sub-second local LLM inference."
    },
    {
        "certificate_number": "CERT-2026-HK003",
        "title": "Classified National Cyber Defense CTF 2026",
        "template_name": "Elite Cyber Security CTF Champion",
        "recipient_name": "Aarav Sharma",
        "recipient_email": "aarav.sharma@cyberdefense.org",
        "achievement": "Top CTF Solver - Binary Exploitation & Cryptography",
        "organization_name": "National Cyber Defense Agency",
        "signatory_name": "Col. Jonathan Miller",
        "signatory_title": "Director of Cyber Operations",
        "description": "Restricted honor for successfully defusing high-severity vulnerability simulations."
    },

    # Corporate Certificates
    {
        "certificate_number": "CERT-2026-CP001",
        "title": "Annual Enterprise Excellence Awards 2026",
        "template_name": "Corporate Excellence & MVP Award",
        "recipient_name": "David Miller",
        "recipient_email": "david.miller@enterprise.corp",
        "achievement": "Global MVP - Enterprise Architecture & Cloud Scale",
        "organization_name": "Apex Global Solutions Inc.",
        "signatory_name": "Katherine Dupont",
        "signatory_title": "Chief Executive Officer",
        "description": "Recognizing unparalleled leadership in driving multimillion-dollar cloud infrastructure."
    },
    {
        "certificate_number": "CERT-2026-CP002",
        "title": "Q3 Engineering & Product Performance Honors",
        "template_name": "Star Performer of the Year",
        "recipient_name": "Ananya Joshi",
        "recipient_email": "ananya.joshi@techcorp.com",
        "achievement": "Star Performer - High-Throughput Microservices",
        "organization_name": "Nova Systems Worldwide",
        "signatory_name": "Siddharth Malhotra",
        "signatory_title": "VP of Engineering",
        "description": "Honoring flawless product reliability, mentorship, and high-velocity sprint execution."
    },
    {
        "certificate_number": "CERT-2026-CP003",
        "title": "Executive Board Leadership Summit 2026",
        "template_name": "Executive Leadership & Board Commendation",
        "recipient_name": "Mallikarjun Hiremath",
        "recipient_email": "mallikarjun.hiremath.s72@kalvium.community",
        "achievement": "Distinguished Board Member & Technology Governor",
        "organization_name": "CertiGen Governance Directorate",
        "signatory_name": "Board of Governors",
        "signatory_title": "Executive Committee",
        "description": "Conferred by unanimous decree for visionary direction, corporate stewardship, and digital trust."
    }
]

def run_seed():
    print("==================================================")
    print(" Seeding 4 Categories, 12 Pinterest Templates & Certificates ")
    print("==================================================")

    # 1. Ensure issuer user exists
    issuer = User.objects.filter(role='ADMIN').first() or User.objects.first()

    # 2. Seed Categories
    category_map = {}
    for cat_data in CATEGORIES_DATA:
        category, created = Category.objects.update_or_create(
            name=cat_data["name"],
            defaults={"description": cat_data["description"]}
        )
        category_map[cat_data["name"]] = category
        status = "Created" if created else "Updated"
        print(f"[{status} Category] {category.name}")

    # 3. Clean up non-matching old categories
    allowed_names = {c["name"] for c in CATEGORIES_DATA}
    Category.objects.exclude(name__in=allowed_names).delete()
    print("[Cleaned up non-standard categories]")

    # 4. Seed the 12 Templates
    template_map = {}
    created_count = 0
    private_count = 0

    for t_data in TEMPLATES_DATA:
        cat = category_map[t_data["category_name"]]
        template, created = Template.objects.update_or_create(
            name=t_data["name"],
            defaults={
                "category": cat,
                "purpose": t_data["purpose"],
                "description": t_data["purpose"],
                "title_prefix": t_data["title_prefix"],
                "subtitle": t_data["subtitle"],
                "presentation_line": t_data["presentation_line"],
                "wording_pattern": t_data["wording_pattern"],
                "primary_color": t_data["primary_color"],
                "secondary_color": t_data["secondary_color"],
                "accent_color": t_data["accent_color"],
                "badge_text": t_data["badge_text"],
                "is_active": True,
                "is_private": t_data["is_private"],
                "access_password": t_data["access_password"]
            }
        )
        template_map[t_data["name"]] = template
        if created:
            created_count += 1
        if t_data["is_private"]:
            private_count += 1
        priv_label = f" [PRIVATE (Pwd: {t_data['access_password']})]" if t_data["is_private"] else " [PUBLIC]"
        print(f"[{'Created' if created else 'Updated'} Template] {template.name} -> {cat.name}{priv_label}")

    # Remove any extra templates that don't belong to the 12
    target_names = {t["name"] for t in TEMPLATES_DATA}
    obsolete_templates = Template.objects.exclude(name__in=target_names)
    for ot in obsolete_templates:
        # If no certificates linked, delete
        if ot.certificates.count() == 0:
            ot.delete()
            print(f"[Removed Excess Template] {ot.name}")
        else:
            # Re-link certificates to matching category template
            matching_template = Template.objects.filter(category__name="Corporate").first() or template
            ot.certificates.all().update(template=matching_template)
            ot.delete()
            print(f"[Reassigned & Removed Old Template] {ot.name}")

    # 5. Seed Certificates
    for c_data in CERTIFICATES_DATA:
        tmpl = template_map.get(c_data["template_name"])
        if not tmpl:
            continue
        cert, c_created = Certificate.objects.update_or_create(
            certificate_number=c_data["certificate_number"],
            defaults={
                "title": c_data["title"],
                "template": tmpl,
                "recipient_name": c_data["recipient_name"],
                "recipient_email": c_data["recipient_email"],
                "achievement": c_data["achievement"],
                "organization_name": c_data["organization_name"],
                "signatory_name": c_data["signatory_name"],
                "signatory_title": c_data["signatory_title"],
                "description": c_data["description"],
                "status": "VALID",
                "issued_by": issuer,
                "metadata": {
                    "category": tmpl.category.name,
                    "template": tmpl.name,
                    "is_private": tmpl.is_private,
                    "badge": tmpl.badge_text
                }
            }
        )
        print(f"[{'Issued' if c_created else 'Updated'} Cert] {cert.certificate_number} -> {cert.recipient_name} ({tmpl.category.name})")

    print("\n================== SUMMARY ==================")
    print(f"Total Categories : {Category.objects.count()} (Sports, College Event, Hackathon, Corporate)")
    print(f"Total Templates  : {Template.objects.count()} (Exactly 12 templates)")
    print(f"Private Templates: {Template.objects.filter(is_private=True).count()} (Exactly 2 private)")
    print(f"Public Templates : {Template.objects.filter(is_private=False).count()} (10 public)")
    print(f"Total Certificates: {Certificate.objects.count()} (All categories populated)")
    print("=============================================\n")

if __name__ == '__main__':
    run_seed()
