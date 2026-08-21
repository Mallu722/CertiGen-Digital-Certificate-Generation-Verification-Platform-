from django.contrib import admin
from .models import VerificationLog


@admin.register(VerificationLog)
class VerificationLogAdmin(admin.ModelAdmin):
    list_display = ['certificate_id', 'verified_by_ip', 'is_valid', 'verified_at']
    list_filter = ['is_valid', 'verified_at']
    search_fields = ['certificate_id', 'verified_by_ip']
    ordering = ['-verified_at']