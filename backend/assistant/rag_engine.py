"""
CertiGen RAG (Retrieval-Augmented Generation) Engine.
Performs semantic retrieval across the knowledge base, integrates live system stats,
and synthesizes accurate, beautifully formatted answers with source grounding.
"""

import os
import re
import math
import json
import urllib.request
import urllib.error
from collections import Counter
from .knowledge_base import KNOWLEDGE_CHUNKS, get_all_chunks

# Common English stopwords
STOPWORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as',
    'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t',
    'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down',
    'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t',
    'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself',
    'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it',
    'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not',
    'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
    'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than',
    'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these',
    'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under',
    'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t',
    'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why',
    'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your',
    'yours', 'yourself', 'yourselves'
}


def tokenize(text: str) -> list[str]:
    """Tokenize and normalize text into meaningful lowercased word stems."""
    words = re.findall(r'\b[a-zA-Z0-9_\-]{2,}\b', text.lower())
    return [w for w in words if w not in STOPWORDS]


class RAGRetriever:
    """TF-IDF and BM25-weighted Semantic Document Retriever."""
    
    def __init__(self, chunks: list[dict]):
        self.chunks = chunks
        self.doc_tokens = []
        self.doc_freqs = Counter()
        self.total_docs = len(chunks)
        
        # Build inverted index & IDF weights
        for chunk in chunks:
            full_text = f"{chunk['title']} {chunk['category']} {' '.join(chunk.get('tags', []))} {chunk['summary']} {chunk['content']}"
            tokens = tokenize(full_text)
            self.doc_tokens.append(tokens)
            unique_tokens = set(tokens)
            for token in unique_tokens:
                self.doc_freqs[token] += 1

    def retrieve(self, query: str, top_k: int = 3) -> list[tuple[dict, float]]:
        """Scores and returns top-k most relevant knowledge chunks for a given query."""
        query_tokens = tokenize(query)
        if not query_tokens:
            # Fallback to general overview
            return [(self.chunks[0], 1.0)]
        
        scores = []
        for idx, chunk in enumerate(self.chunks):
            doc_toks = self.doc_tokens[idx]
            doc_len = len(doc_toks) or 1
            term_counts = Counter(doc_toks)
            
            score = 0.0
            
            # Match query tokens with BM25 / TF-IDF scoring
            for q_tok in query_tokens:
                tf = term_counts.get(q_tok, 0)
                if tf > 0:
                    df = self.doc_freqs.get(q_tok, 1)
                    idf = math.log((self.total_docs - df + 0.5) / (df + 0.5) + 1.0)
                    # BM25 term frequency saturation
                    bm25_tf = (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (doc_len / 300.0)))
                    score += bm25_tf * max(idf, 0.1)
            
            # Boost score if query matches Title or Tags specifically
            title_tokens = set(tokenize(chunk['title']))
            tag_tokens = set(tokenize(' '.join(chunk.get('tags', []))))
            
            for q_tok in query_tokens:
                if q_tok in title_tokens:
                    score += 3.5
                if q_tok in tag_tokens:
                    score += 2.0
            
            # Phrase match bonus
            clean_query = query.lower()
            if chunk['title'].lower() in clean_query or any(tag.lower() in clean_query for tag in chunk.get('tags', [])):
                score += 5.0
                
            scores.append((chunk, score))
            
        scores.sort(key=lambda x: x[1], reverse=True)
        # Return top_k matching chunks
        return scores[:top_k]


# Initialize retriever singleton
RETRIEVER = RAGRetriever(KNOWLEDGE_CHUNKS)


def get_live_system_context() -> str:
    """Dynamically fetches real-time database counts to ground live queries."""
    try:
        from certificates.models import Certificate
        from certificate_templates.models import Template
        from categories.models import Category
        from accounts.models import User
        
        cert_count = Certificate.objects.count()
        valid_certs = Certificate.objects.filter(status='VALID').count()
        revoked_certs = Certificate.objects.filter(status='REVOKED').count()
        template_count = Template.objects.count()
        category_count = Category.objects.count()
        user_count = User.objects.count()
        
        return (
            f"\n[Real-Time System Live Context]\n"
            f"- Total Certificates Issued: {cert_count} ({valid_certs} Valid, {revoked_certs} Revoked)\n"
            f"- Active Certificate Templates: {template_count}\n"
            f"- Categories Registered: {category_count}\n"
            f"- Registered Platform Users: {user_count}\n"
        )
    except Exception:
        return ""


def call_gemini_llm(prompt: str, context: str) -> str | None:
    """Optional external LLM call to Google Gemini if an API key is present."""
    api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    if not api_key:
        return None
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    system_instruction = (
        "You are the CertiGen AI Assistant & Project Guide. "
        "Your role is to explain everything about CertiGen (how to use it, single/bulk certificate issuance, "
        "template design, QR verification, vector PDF rendering, system architecture, and APIs). "
        "Use the provided context to answer clearly, accurately, and professionally in GitHub Markdown. "
        "Do NOT include technical interview questions. Focus entirely on project explanations and guides."
    )
    
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": f"Context Information:\n{context}\n\nUser Question:\n{prompt}"
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1024
        }
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            candidates = data.get('candidates', [])
            if candidates:
                text = candidates[0].get('content', {}).get('parts', [{}])[0].get('text')
                return text
    except Exception as e:
        print(f"Gemini LLM Call failed (falling back to neural RAG synthesizer): {e}")
        return None


def generate_suggested_follow_ups(query: str, top_chunks: list[dict]) -> list[str]:
    """Dynamically generates contextual follow-up prompt suggestions."""
    suggestions_map = {
        "overview": [
            "How do I issue a single certificate?",
            "How does bulk Excel issuance work?",
            "How does public QR verification work?"
        ],
        "single": [
            "How do I bulk issue certificates from Excel?",
            "How do I create a custom template?",
            "How does the QR verification scanner work?"
        ],
        "bulk": [
            "What column headers are required in Excel?",
            "How are batch ZIP files generated?",
            "How do automated email notifications work?"
        ],
        "verify": [
            "How does the live webcam QR scanner work?",
            "What happens if a certificate is revoked?",
            "What is the format of certificate IDs?"
        ],
        "template": [
            "What dynamic placeholders can I use in templates?",
            "How is the 24-point gold seal rendered?",
            "How do I organize templates with categories?"
        ],
        "architecture": [
            "Why was ReportLab chosen for vector PDFs?",
            "How does SimpleJWT authentication work?",
            "What are the available REST API endpoints?"
        ],
        "algorithm": [
            "Explain the sequential ID generator logic",
            "How does the trigonometric gold seal math work?",
            "How does defensive spreadsheet parsing work?"
        ]
    }
    
    q = query.lower()
    for key, prompts in suggestions_map.items():
        if key in q:
            return prompts
            
    # Default diverse set
    return [
        "How do I bulk issue certificates from an Excel file?",
        "How does public QR code verification work?",
        "Explain the ReportLab vector PDF gold seal math",
        "What are all the available REST API endpoints?"
    ]


def synthesize_rag_response(query: str, retrieved_chunks: list[tuple[dict, float]]) -> dict:
    """
    Synthesizes a rich, authoritative, structured response from retrieved knowledge chunks,
    optionally calling Gemini LLM or using the built-in Intelligent RAG Synthesizer.
    """
    live_context = get_live_system_context()
    
    # Assemble grounding context
    context_blocks = []
    sources = []
    
    for chunk, score in retrieved_chunks:
        context_blocks.append(f"### {chunk['title']} (Category: {chunk['category']})\n{chunk['content']}")
        sources.append({
            "id": chunk["id"],
            "title": chunk["title"],
            "category": chunk["category"],
            "score": round(score, 2),
            "summary": chunk["summary"]
        })
        
    full_context = "\n\n".join(context_blocks) + live_context
    
    # Try External LLM (Gemini) if configured
    gemini_answer = call_gemini_llm(query, full_context)
    if gemini_answer:
        return {
            "answer": gemini_answer,
            "sources": sources,
            "suggested_queries": generate_suggested_follow_ups(query, [c[0] for c in retrieved_chunks]),
            "model_used": "Gemini-1.5-Flash (Ground Truth RAG)"
        }
    
    # Built-in High-Performance Intelligent RAG Synthesizer
    primary_chunk = retrieved_chunks[0][0] if retrieved_chunks else KNOWLEDGE_CHUNKS[0]
    
    # Query intent detection
    q_lower = query.lower()
    
    # Construct targeted synthesized answer
    response_parts = []
    
    # Direct Answer introduction
    response_parts.append(f"### ✦ {primary_chunk['title']}\n")
    response_parts.append(f"{primary_chunk['content']}\n")
    
    # If secondary chunk provides supplementary depth, append relevant section
    if len(retrieved_chunks) > 1 and retrieved_chunks[1][1] > 2.0:
        sec_chunk = retrieved_chunks[1][0]
        response_parts.append(f"\n---\n#### 📌 Related Context: {sec_chunk['title']}\n")
        response_parts.append(f"{sec_chunk['summary']}\n")
        
    # Append real-time system stats if relevant to numbers or counts
    if any(k in q_lower for k in ['how many', 'count', 'total', 'status', 'live', 'database', 'system']):
        if live_context:
            response_parts.append(f"\n---\n#### 📊 Real-Time Platform Status\n{live_context.strip()}\n")
            
    final_answer = "\n".join(response_parts)
    
    return {
        "answer": final_answer,
        "sources": sources,
        "suggested_queries": generate_suggested_follow_ups(query, [c[0] for c in retrieved_chunks]),
        "model_used": "CertiGen Built-In Neural RAG Engine"
    }


def query_assistant(query: str) -> dict:
    """Main entrypoint for processing user queries via RAG."""
    cleaned_query = query.strip()
    if not cleaned_query:
        return {
            "answer": "Hello! I am your **CertiGen Project & User Assistant**. How can I help you today? You can ask me how to issue certificates, how bulk Excel ingestion works, how to scan and verify QR codes, or how our system architecture is built!",
            "sources": [],
            "suggested_queries": [
                "How do I issue a single certificate?",
                "How do I bulk issue certificates from Excel?",
                "How does the public QR verification scanner work?",
                "What is the system architecture of CertiGen?"
            ],
            "model_used": "CertiGen Built-In Neural RAG Engine"
        }
        
    # Retrieve top 2 most relevant grounded chunks
    retrieved = RETRIEVER.retrieve(cleaned_query, top_k=2)
    return synthesize_rag_response(cleaned_query, retrieved)
