from django.contrib import admin
from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['certificate_number', 'title', 'recipient_name', 'recipient_email', 'issued_by', 'issued_at', 'verified']
    list_filter = ['verified', 'issued_at']
    search_fields = ['certificate_number', 'title', 'recipient_name', 'recipient_email']
    ordering = ['-issued_at']
    readonly_fields = ['issued_at', 'verification_id']