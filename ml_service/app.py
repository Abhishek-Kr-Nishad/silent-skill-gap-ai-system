from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel
from typing import List, Optional
import os
from predict import get_predictions_and_explanations
from analyzer import analyze_resume, extract_text_from_file
from rag_pipeline import ingest_document, query_rag
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
import uvicorn

app = FastAPI(title="Silent Skill Gap AI - ML Service")

class StudentMetrics(BaseModel):
    quiz_score: float
    coding_accuracy: float
    time_per_question: float
    retry_attempts: int
    wrong_answer_ratio: float
    difficulty_level: int
    unit_performance_trend: float

@app.post("/predict-skill-gap")
async def predict_skill_gap(metrics: StudentMetrics):
    try:
        result = get_predictions_and_explanations(metrics.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-resume")
async def process_resume(file: UploadFile = File(...), target_role: str = Form(...)):
    try:
        contents = await file.read()
        result = analyze_resume(contents, file.filename, target_role)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error processing resume: {str(e)}")

# ==========================================
# RAG & LLM Endpoints
# ==========================================

def get_llm():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured on server.")
    return ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key)

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = [] # [{'role': 'user', 'content': 'hi'}]

@app.post("/ingest-document")
async def ingest_file(file: UploadFile = File(...), uploaded_by: str = Form("admin")):
    try:
        contents = await file.read()
        text = extract_text_from_file(contents, file.filename)
        
        chunks_created = ingest_document(text, metadata={"filename": file.filename, "uploaded_by": uploaded_by})
        return {"status": "success", "chunks_created": chunks_created, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ingesting document: {str(e)}")

@app.post("/chat")
async def chat_with_ai(req: ChatRequest):
    try:
        context = query_rag(req.message)
        
        prompt_template = """
        You are a helpful AI Learning Assistant for the Silent Skill Gap platform.
        You help students learn coding, DBMS, DSA, and software engineering concepts.
        
        Use the following retrieved context from uploaded course materials to answer the question.
        If the context doesn't contain the answer, rely on your general knowledge but mention that it's not from the course notes.
        
        Context:
        {context}
        
        Student Question: {question}
        
        Answer professionally and clearly.
        """
        prompt = PromptTemplate.from_template(prompt_template)
        llm = get_llm()
        chain = prompt | llm | StrOutputParser()
        
        response = chain.invoke({"context": context, "question": req.message})
        return {"response": response, "context_used": True if context.strip() else False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

class CodeReviewRequest(BaseModel):
    code: str
    language: str
    problem_statement: str

@app.post("/code-review")
async def ai_code_review(req: CodeReviewRequest):
    try:
        prompt_template = """
        You are an expert Senior Software Engineer. Review the following {language} code submitted by a student.
        
        Problem Context:
        {problem}
        
        Student Code:
        ```{language}
        {code}
        ```
        
        Please provide:
        1. A brief summary of what the code does.
        2. The Time Complexity (Big O).
        3. The Space/Memory Complexity (Big O).
        4. Any bugs or edge cases missed.
        5. Specific optimizations to improve performance or readability.
        
        Format your response clearly using Markdown.
        """
        prompt = PromptTemplate.from_template(prompt_template)
        llm = get_llm()
        chain = prompt | llm | StrOutputParser()
        
        review = chain.invoke({
            "language": req.language, 
            "problem": req.problem_statement, 
            "code": req.code
        })
        return {"review": review}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class InterviewPrepRequest(BaseModel):
    target_role: str
    weak_skills: List[str]
    resume_skills: List[str]

@app.post("/generate-interview")
async def generate_interview(req: InterviewPrepRequest):
    try:
        prompt_template = """
        You are an expert Technical Recruiter interviewing a candidate for the role of {target_role}.
        
        The candidate claims to know: {resume_skills}.
        The platform's analytics show they are currently weak in: {weak_skills}.
        
        Generate a personalized mock interview consisting of:
        1. 2 Technical Questions based on their strong skills to build confidence.
        2. 2 Technical Questions focusing on their weak skills to test their learning ability.
        3. 1 HR/Behavioral question tailored to a {target_role}.
        
        Provide the output in a clean Markdown format. Provide hints below each question.
        """
        prompt = PromptTemplate.from_template(prompt_template)
        llm = get_llm()
        chain = prompt | llm | StrOutputParser()
        
        interview = chain.invoke({
            "target_role": req.target_role,
            "weak_skills": ", ".join(req.weak_skills),
            "resume_skills": ", ".join(req.resume_skills)
        })
        return {"interview": interview}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
