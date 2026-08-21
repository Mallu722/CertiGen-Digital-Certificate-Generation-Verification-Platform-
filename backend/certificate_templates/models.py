from django.db import models
import uuid
import os


def template_upload_path(instance, filename):
    return f'templates/{uuid.uuid4()}/{filename}'


class Template(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.CASCADE,
        related_name='templates'
    )
    image = models.ImageField(upload_to=template_upload_path)
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
