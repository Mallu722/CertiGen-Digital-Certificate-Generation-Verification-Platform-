from django.db import models
from django.utils import timezone
import uuid
import re


def generate_next_certificate_number(year=None):
    """
    Generate next unique sequential certificate number.
    Format: CERT-<YEAR>-<000001>
    Example: CERT-2026-000001
    """
    if not year:
        year = timezone.now().year
    
    prefix = f"CERT-{year}-"
    # Find all certificates with matching prefix
    existing_numbers = Certificate.objects.filter(
        certificate_number__startswith=prefix
    ).values_list('certificate_number', flat=True)

    max_seq = 0
    pattern = re.compile(rf"^{re.escape(prefix)}(\d+)$")
    for num in existing_numbers:
        match = pattern.match(num)
        if match:
            try:
                seq = int(match.group(1))
                if seq > max_seq:
                    max_seq = seq
            except ValueError:
                pass

    next_seq = max_seq + 1
    return f"{prefix}{next_seq:06d}"


class Certificate(models.Model):
    STATUS_CHOICES = [
        ('VALID', 'Valid'),
        ('REVOKED', 'Revoked'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    certificate_number = models.CharField(max_length=100, unique=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    template = models.ForeignKey(
        'certificate_templates.Template',
        on_delete=models.CASCADE,
        related_name='certificates'
    )
    recipient_name = models.CharField(max_length=200)
    recipient_email = models.EmailField()
    achievement = models.CharField(max_length=255, blank=True, default='')
    organization_name = models.CharField(max_length=255, blank=True, default='CertiGen Platform')
    signatory_name = models.CharField(max_length=255, blank=True, default='Authorized Signatory')
    signatory_title = models.CharField(max_length=255, blank=True, default='Program Director')
    metadata = models.JSONField(default=dict, blank=True)
    issued_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='issued_certificates'
    )

    issued_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='VALID')
    revoked_at = models.DateTimeField(null=True, blank=True)
    revocation_reason = models.TextField(blank=True, default='')
    verified = models.BooleanField(default=False)
    verification_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'certificate'
        verbose_name_plural = 'certificates'
        ordering = ['-issued_at']

    def save(self, *args, **kwargs):
        if not self.certificate_number:
            self.certificate_number = generate_next_certificate_number()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.certificate_number} - {self.title} ({self.status})"

