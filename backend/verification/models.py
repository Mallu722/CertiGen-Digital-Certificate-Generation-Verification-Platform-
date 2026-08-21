from django.db import models
import uuid


class VerificationLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    certificate_id = models.CharField(max_length=50)
    verified_by_ip = models.GenericIPAddressField(null=True, blank=True)
    verified_by_user_agent = models.CharField(max_length=500, blank=True)
    verified_at = models.DateTimeField(auto_now_add=True)
    is_valid = models.BooleanField()

    class Meta:
        verbose_name = 'verification log'
        verbose_name_plural = 'verification logs'
        ordering = ['-verified_at']

    def __str__(self):
        return f"Verification {self.id} - {'Valid' if self.is_valid else 'Invalid'}"
