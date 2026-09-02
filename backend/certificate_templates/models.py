from django.db import models
import uuid
import os


def template_upload_path(instance, filename):
    return f'templates/{uuid.uuid4()}/{filename}'


class Template(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    purpose = models.CharField(max_length=255, blank=True, default="General Recognition")
    title_prefix = models.CharField(max_length=100, blank=True, default="CERTIFICATE OF")
    subtitle = models.CharField(max_length=100, blank=True, default="ACHIEVEMENT")
    presentation_line = models.CharField(max_length=255, blank=True, default="This is proudly presented to")
    wording_pattern = models.TextField(blank=True, default="for outstanding achievement and dedication in {{EVENT_NAME}}")
    primary_color = models.CharField(max_length=50, blank=True, default="#0f2744")
    secondary_color = models.CharField(max_length=50, blank=True, default="#c59b27")
    accent_color = models.CharField(max_length=50, blank=True, default="#e2d19f")
    badge_text = models.CharField(max_length=100, blank=True, default="VERIFIED CREDENTIAL")
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.CASCADE,
        related_name='templates'
    )
    image = models.ImageField(upload_to=template_upload_path, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_private = models.BooleanField(default=False)
    access_password = models.CharField(max_length=128, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



    class Meta:
        verbose_name = 'template'
        verbose_name_plural = 'templates'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None
