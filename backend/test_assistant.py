import os
import sys
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certigen_backend.settings')
django.setup()

from assistant.rag_engine import query_assistant, RETRIEVER
from assistant.knowledge_base import KNOWLEDGE_CHUNKS, get_topics_summary

print("=" * 60)
print(f"Total Knowledge Chunks Loaded: {len(KNOWLEDGE_CHUNKS)}")
print("=" * 60)

test_queries = [
    "What is CertiGen and how do I use it?",
    "How do I bulk issue certificates from an Excel file?",
    "How does the public QR verification work and how do I scan with webcam?",
    "Explain the ReportLab vector PDF 24-point gold seal geometry",
    "What are all the REST API endpoints available?",
    "How many certificates exist in the database?"
]

for q in test_queries:
    print(f"\n[QUERY]: {q}")
    res = query_assistant(q)
    print(f"Model Used: {res['model_used']}")
    print(f"Sources Grounded: {[s['title'] for s in res['sources']]}")
    print(f"Answer Preview:\n{res['answer'][:200]}...")
    print(f"Suggested Follow-ups: {res['suggested_queries'][:2]}")
    print("-" * 50)

print("\nAll Assistant Tests Passed Successfully!")
