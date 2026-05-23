import io
import re
from pdfminer.high_level import extract_text
from docx import Document
import spacy
from sentence_transformers import SentenceTransformer, util
import numpy as np

# Load NLP Models (Global variables to be loaded once)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

print("Loading Sentence Transformer model...")
# Using a small and fast model for semantic similarity
similarity_model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded successfully.")

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
    
    # Tokenize with spacy to handle word boundaries properly
    doc = nlp(text)
    tokens = [token.text for token in doc]
    
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
    resume_emb = similarity_model.encode(resume_text[:2000]) # Truncate to first 2000 chars for speed
    role_emb = similarity_model.encode(target_role_desc)
    
    similarity = util.cos_sim(resume_emb, role_emb).item()
    
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
