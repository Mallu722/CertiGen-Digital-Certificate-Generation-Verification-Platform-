from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated
from .models import Category
from .serializers import CategorySerializer


from rest_framework.pagination import PageNumberPagination

class CategoryPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CategoryPagination

    def list(self, request, *args, **kwargs):
        if Category.objects.count() < 4:
            try:
                from seed_12_templates import run_seed
                run_seed()
            except Exception as e:
                print("Auto-seed error:", e)
        return super().list(request, *args, **kwargs)
