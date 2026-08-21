from django.contrib import admin
from .models import Template


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'created_at', 'updated_at']
    list_filter = ['category']
    search_fields = ['name', 'description']
    ordering = ['name']