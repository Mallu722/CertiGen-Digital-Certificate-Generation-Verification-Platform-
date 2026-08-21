from django.db import models
import uuid


class Certificate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    certificate_number = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    template = models.ForeignKey(
        'certificate_templates.Template',
        on_delete=models.CASCADE,
        related_name='certificates'
    )
    recipient_name = models.CharField(max_length=200)
    recipient_email = models.EmailField()
    issued_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='issued_certificates'
    )
    issued_at = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)
    verification_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'certificate'
        verbose_name_plural = 'certificates'
        ordering = ['-issued_at']

    def __str__(self):
        return f"{self.certificate_number} - {self.title}"
