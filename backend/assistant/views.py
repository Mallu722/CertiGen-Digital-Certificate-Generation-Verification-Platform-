"""
Views for CertiGen AI Assistant & Knowledge Base.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .rag_engine import query_assistant
from .knowledge_base import get_topics_summary, KNOWLEDGE_CHUNKS


@api_view(['POST'])
@permission_classes([AllowAny])
def chat_view(request):
    """
    POST /api/assistant/chat/
    Payload: { "query": "How do I bulk issue certificates?" }
    Returns grounded RAG answer, source citations, and follow-up prompts.
    """
    query = request.data.get('query', '')
    if not query:
        return Response(
            {"error": "Query string is required."},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    result = query_assistant(query)
    return Response(result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def suggestions_view(request):
    """
    GET /api/assistant/suggestions/
    Returns curated quick questions across categories.
    """
    suggestions = [
        {
            "category": "Getting Started & User Guides",
            "items": [
                "What is CertiGen and what does it do?",
                "How do I issue a single certificate step-by-step?",
                "How do I bulk issue certificates from an Excel file?",
                "How do I create and customize certificate templates?"
            ]
        },
        {
            "category": "Verification & QR Scanner",
            "items": [
                "How does the public verification portal work?",
                "How does the live webcam QR scanner work?",
                "What is the format of certificate IDs (e.g. CERT-2026-000001)?"
            ]
        },
        {
            "category": "Architecture & Engineering",
            "items": [
                "What is the system architecture of CertiGen?",
                "Why was ReportLab chosen for vector PDFs?",
                "Explain the mathematical 24-point gold seal geometry",
                "What REST API endpoints are available in CertiGen?"
            ]
        },
        {
            "category": "Troubleshooting & Setup",
            "items": [
                "What headers are required for bulk Excel uploads?",
                "How do I fix camera permission errors in QR scanning?",
                "How does role-based access differ between Admin and Mentor?"
            ]
        }
    ]
    return Response({"suggestions": suggestions}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def topics_view(request):
    """
    GET /api/assistant/topics/
    Returns table of contents and knowledge base chunks.
    """
    topics = get_topics_summary()
    return Response({"topics": topics, "total_chunks": len(KNOWLEDGE_CHUNKS)}, status=status.HTTP_200_OK)
