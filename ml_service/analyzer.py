import io
import re
from pdfminer.high_level import extract_text
from docx import Document
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Initialize Gemini Embeddings lazily
_embeddings_model = None

def get_embeddings_model():
    global _embeddings_model
    if _embeddings_model is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        _embeddings_model = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001", 
            google_api_key=api_key
        )
    return _embeddings_model

# A static list of common tech skills to look for in resumes
TECH_SKILLS = set([
    "python", "java", "c++", "c", "javascript", "react", "node.js", "django", "flask",
    "fastapi", "sql", "mysql", "postgresql", "mongodb", "aws", "docker", "kubernetes",
    "git", "machine learning", "data science", "html", "css", "typescript", "golang",
    "rust", "ruby", "php", "spring boot", "pandas", "numpy", "scikit-learn", "tensorflow",
    "pytorch", "linux", "bash", "rest api", "graphql"
])

def extract_text_from_file(file_bytes, filename):
    text = ""
    if filename.lower().endswith('.pdf'):
        try:
            text = extract_text(io.BytesIO(file_bytes))
        except Exception as e:
            raise ValueError(f"Error reading PDF: {str(e)}")
    elif filename.lower().endswith('.docx'):
        try:
            doc = Document(io.BytesIO(file_bytes))
            text = "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            raise ValueError(f"Error reading DOCX: {str(e)}")
    else:
        # Fallback to plain text
        try:
            text = file_bytes.decode('utf-8')
        except:
            raise ValueError("Unsupported file format or unable to decode text.")
    return text

def extract_skills(text):
    text = text.lower()
    # Simple keyword extraction using our static set
    # In a production system, this could use a custom trained Spacy NER model
    found_skills = set()
    
    # Spacy tokenization removed for lightweight processing
    # Direct substring and word boundary regex matching handles the required skill extraction
    
    for skill in TECH_SKILLS:
        if skill in text:
            # Basic validation to ensure it's a word boundary match for short skills like "c" or "git"
            # For longer multi-word skills, direct substring is usually fine
            if len(skill) <= 3:
                pattern = r'\b' + re.escape(skill) + r'\b'
                if re.search(pattern, text):
                    found_skills.add(skill)
            else:
                found_skills.add(skill)
                
    return list(found_skills)

def calculate_ats_score(resume_text, target_role, extracted_skills):
    if not resume_text or not target_role:
        return 0, [], []
        
    # Generate contextual role description (could be expanded based on target role)
    target_role_desc = target_role.lower()
    
    # Calculate Semantic Similarity between whole resume and target role title
    # This represents how closely the resume aligns with the role overall
    try:
        embeddings = get_embeddings_model()
        # Truncate to first 2000 chars to avoid API limits and improve speed
        resume_emb = embeddings.embed_query(resume_text[:2000])
        role_emb = embeddings.embed_query(target_role_desc)
        
        # Calculate cosine similarity using pure Python/numpy since embeddings are lists
        import numpy as np
        vec1 = np.array(resume_emb)
        vec2 = np.array(role_emb)
        similarity = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    except Exception as e:
        print(f"Error calling Gemini Embeddings: {e}")
        # Fallback similarity if API fails
        similarity = 0.5
        
    # Map similarity [-1, 1] to a score [0, 50]
    semantic_score = max(0, min(50, (similarity * 50) + 20))
    
    # Keyword Score (0 to 50)
    # Expected number of skills for a solid resume is around 8-10
    keyword_score = min(50, len(extracted_skills) * 5)
    
    total_score = round(semantic_score + keyword_score)
    
    # Missing Skills Logic (Basic mapping for demonstration)
    missing_skills = []
    if "data" in target_role_desc or "machine learning" in target_role_desc:
        expected = ["python", "machine learning", "pandas", "sql"]
    elif "frontend" in target_role_desc or "react" in target_role_desc:
        expected = ["javascript", "react", "html", "css"]
    elif "backend" in target_role_desc or "django" in target_role_desc:
        expected = ["python", "django", "sql", "api"]
    else:
        expected = ["git", "python", "javascript", "sql"]
        
    for ex in expected:
        if ex not in extracted_skills:
            missing_skills.append(ex)
            
    suggestions = []
    if total_score < 50:
        suggestions.append("Your resume lacks keywords strongly associated with the target role. Add more relevant tools and frameworks.")
    if len(missing_skills) > 0:
        suggestions.append(f"Consider learning or highlighting these skills: {', '.join(missing_skills)}.")
    if len(resume_text.split()) < 150:
        suggestions.append("Your resume seems very short. Expand on your project experiences and impact.")
        
    return total_score, missing_skills, suggestions

def analyze_resume(file_bytes, filename, target_role):
    # 1. Extract text
    resume_text = extract_text_from_file(file_bytes, filename)
    
    if not resume_text.strip():
        raise ValueError("Could not extract any text from the document.")
        
    # 2. Extract Skills
    skills = extract_skills(resume_text)
    
    # 3. Calculate Score and get feedback
    score, missing, suggestions = calculate_ats_score(resume_text, target_role, skills)
    
    return {
        "ats_score": score,
        "extracted_skills": skills,
        "missing_skills": missing,
        "suggestions": suggestions,
        "resume_length_words": len(resume_text.split())
    }
