from django.urls import path
from . import views

app_name = 'assistant'

urlpatterns = [
    path('chat/', views.chat_view, name='assistant-chat'),
    path('suggestions/', views.suggestions_view, name='assistant-suggestions'),
    path('topics/', views.topics_view, name='assistant-topics'),
]
