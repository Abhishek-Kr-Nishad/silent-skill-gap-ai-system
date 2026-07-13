import os
import json
import logging
from typing import List, Dict, Any, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

logger = logging.getLogger(__name__)

# Fallback parser if JSON output contains markdown code blocks
def clean_json_string(output_str: str) -> str:
    output_str = output_str.strip()
    if output_str.startswith("```json"):
        output_str = output_str[7:]
    elif output_str.startswith("```"):
        output_str = output_str[3:]
    if output_str.endswith("```"):
        output_str = output_str[:-3]
    return output_str.strip()


def get_llm():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not found in environment. Using fallback mode.")
        return None
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.2,
        model_kwargs={"response_format": {"type": "json_object"}}
    )


def generate_mock_analysis(resume_text: str, jd_text: str, target_role: str) -> Dict[str, Any]:
    """Generates a high-quality mock report when Gemini API is unavailable."""
    # Analyze the input to make the mock somewhat customized
    detected_skills = []
    resume_lower = resume_text.lower()
    for skill in ["python", "react", "django", "javascript", "docker", "aws", "postgresql", "git", "kubernetes", "sql"]:
        if skill in resume_lower:
            detected_skills.append(skill)
            
    if not detected_skills:
        detected_skills = ["python", "git", "javascript"]
        
    jd_skills = []
    if jd_text:
        jd_lower = jd_text.lower()
        for skill in ["python", "react", "django", "javascript", "docker", "aws", "postgresql", "git", "kubernetes", "sql", "ci/cd", "rest api"]:
            if skill in jd_lower:
                jd_skills.append(skill)
                
    if not jd_skills:
        jd_skills = ["python", "django", "postgresql", "docker", "aws", "kubernetes", "git"]
        
    missing_skills = [s for s in jd_skills if s not in detected_skills]
    if not missing_skills:
        missing_skills = ["docker", "kubernetes", "aws"]

    # Overall score mapping
    skill_match_score = max(30, min(95, round(len(detected_skills) / max(1, len(jd_skills)) * 100)))
    overall_score = round((skill_match_score + 80 + 75 + 70 + 85 + 90) / 6)
    
    return {
        "parser_raw_text": resume_text,
        "parser": {
            "name": "Jane Doe",
            "email": "jane.doe@example.com",
            "phone": "+1 (555) 019-2834",
            "linkedin": "linkedin.com/in/janedoe",
            "github": "github.com/janedoe",
            "portfolio": "janedoe.dev",
            "address": "San Francisco, CA",
            "education": [
                { "degree": "Bachelor of Science in Computer Science", "school": "State University", "year": "2020 - 2024" }
            ],
            "experience": [
                {
                    "role": "Software Engineering Intern",
                    "company": "Tech Corp",
                    "duration": "June 2023 - Present",
                    "description": "Worked on Django project. Helped deploy containers. Created APIs."
                }
            ],
            "projects": [
                {
                    "title": "Resume Analyzer App",
                    "description": "Built Resume Analyzer with Django.",
                    "technologies": ["Django", "Python", "SQLite"]
                }
            ],
            "skills": detected_skills,
            "certifications": ["AWS Certified Cloud Practitioner"],
            "achievements": ["First Place at University Hackathon 2023"],
            "languages": ["English", "Spanish"]
        },
        "scores": {
            "overall": overall_score,
            "formatting": 85,
            "keyword_match": skill_match_score - 5 if skill_match_score > 40 else 40,
            "skill_match": skill_match_score,
            "experience": 65,
            "projects": 60,
            "education": 90,
            "grammar": 95,
            "readability": 80,
            "professional_writing": 75
        },
        "keywords": {
            "matched_percentage": skill_match_score,
            "missing_percentage": 100 - skill_match_score,
            "matched": detected_skills,
            "missing": missing_skills,
            "low_frequency": [
                { "word": "python", "count": 1, "suggested_count": 4 }
            ],
            "suggested": ["restful apis", "ci/cd pipelines", "unit testing"]
        },
        "skills_analysis": {
            "programming_languages": {
                "present": [s for s in ["python", "javascript", "golang", "java"] if s in detected_skills],
                "missing": [s for s in ["python", "javascript", "golang", "java"] if s in missing_skills],
                "recommended": ["python", "javascript"]
            },
            "frameworks": {
                "present": [s for s in ["react", "django", "fastapi"] if s in detected_skills],
                "missing": [s for s in ["react", "django", "fastapi"] if s in missing_skills],
                "recommended": ["react", "django"]
            },
            "databases": {
                "present": [s for s in ["postgresql", "mysql", "mongodb"] if s in detected_skills],
                "missing": [s for s in ["postgresql", "mysql", "mongodb"] if s in missing_skills],
                "recommended": ["postgresql"]
            },
            "cloud_platforms": {
                "present": [s for s in ["aws", "gcp"] if s in detected_skills],
                "missing": [s for s in ["aws", "gcp"] if s in missing_skills],
                "recommended": ["aws"]
            },
            "big_data": { "present": [], "missing": ["spark"], "recommended": ["spark"] },
            "devops": {
                "present": [s for s in ["docker", "kubernetes", "git"] if s in detected_skills],
                "missing": [s for s in ["docker", "kubernetes", "git"] if s in missing_skills],
                "recommended": ["docker", "kubernetes"]
            },
            "ml": { "present": [], "missing": [], "recommended": [] },
            "ai": { "present": [], "missing": [], "recommended": [] },
            "data_engineering": { "present": [], "missing": [], "recommended": [] }
        },
        "line_by_line_review": [
            {
                "original": "Worked on Django project.",
                "issue": "Weak action verb and lacks technical detail.",
                "suggestion": "Developed a scalable Django-based web application utilizing PostgreSQL and REST APIs.",
                "improved": "Developed a scalable Django-based web application utilizing PostgreSQL and REST APIs."
            },
            {
                "original": "Helped deploy containers.",
                "issue": "Vague description and lacks metrics.",
                "suggestion": "Containerized application microservices using Docker, improving local development boot time by 30%.",
                "improved": "Containerized application microservices using Docker, improving local development boot time by 30%."
            },
            {
                "original": "Created APIs.",
                "issue": "Too brief. Doesn't mention tools, protocols, or security.",
                "suggestion": "Designed and implemented secure RESTful endpoints with JWT Authentication, reducing request latency by 15%.",
                "improved": "Designed and implemented secure RESTful endpoints with JWT Authentication, reducing request latency by 15%."
            }
        ],
        "word_suggestions": [
            { "weak_word": "worked", "suggestions": ["engineered", "developed", "architected"] },
            { "weak_word": "helped", "suggestions": ["orchestrated", "spearheaded", "collaborated"] },
            { "weak_word": "created", "suggestions": ["implemented", "designed", "constructed"] }
        ],
        "grammar_review": {
            "issues": [
                {
                    "type": "Vague Subject",
                    "original": "Worked on Django project.",
                    "correction": "Developed and engineered Django-based web applications."
                }
            ]
        },
        "professional_summary": {
            "original": "",
            "suggested": f"Aspiring Computer Science graduate with hands-on internship experience developing web applications using Python and Django. Skilled in containerization with Docker and version control with Git. Passionate about engineering high-quality, scalable solutions as a {target_role}.",
            "action": "Generate"
        },
        "project_enhancements": [
            {
                "original_title": "Resume Analyzer App",
                "original_description": "Built Resume Analyzer with Django.",
                "enhanced_description": "Architected and built an automated AI-powered resume parser and scoring engine using Django, REST APIs, and SQLite, improving candidate ranking accuracy by 40%.",
                "suggestions": [
                    "Add mention of specific algorithms or LLM APIs used.",
                    "Include metrics on throughput or processing speeds."
                ]
            }
        ],
        "experience_enhancements": [
            {
                "original": "Worked on Django project. Helped deploy containers. Created APIs.",
                "enhanced": "Developed a scalable Django-based web application with PostgreSQL, containerized microservices using Docker to reduce boot time by 30%, and created secure RESTful endpoints with JWT authentication.",
                "suggestions": [
                    "Lead with powerful action verbs like 'Developed' and 'Containerized'.",
                    "Add measurable metrics such as the 30% local boot time optimization."
                ]
            }
        ],
        "formatting_review": {
            "issues": ["No layout issues detected. Document size is optimal."],
            "recommendations": [
                "Use standard 0.75-1 inch margins.",
                "Avoid decorative tables or headers that may obstruct ATS parser engines."
            ]
        },
        "section_validation": {
            "present": ["Summary", "Education", "Experience", "Projects", "Skills", "Certifications", "Achievements", "Languages"],
            "missing": [],
            "suggestions": []
        },
        "recruiter_suggestions": [
            "Add quantitative metrics (e.g. percentages, money saved, hours reduced) to experience items.",
            "Integrate PostgreSQL or PostgreSQL Neon in project tech stacks.",
            "Highlight dockerization and CI/CD pipelines under DevOps skills.",
            "Verify all links (LinkedIn, GitHub) are active and clickable.",
            "Include REST API standards in framework descriptions."
        ]
    }


def analyze_ats_resume(resume_text: str, jd_text: str, target_role: str) -> Dict[str, Any]:
    llm = get_llm()
    if not llm:
        return generate_mock_analysis(resume_text, jd_text, target_role)
        
    prompt_template = """
    You are an expert ATS (Applicant Tracking System) Resume Coach comparable to Jobscan.
    Analyze the following resume text against the provided Job Description (or generic requirements for the target role if no Job Description is provided).
    
    Target Role: {target_role}
    Job Description: {jd_text}
    
    Resume Text:
    {resume_text}
    
    Your response MUST be a JSON object matching the following structure.
    Do NOT include any markdown wraps in the JSON output, or any additional text. Return ONLY the JSON object.
    
    JSON Schema to return:
    {{
      "parser_raw_text": "the full raw resume text supplied",
      "parser": {{
        "name": "Extracted candidate name",
        "email": "Extracted email",
        "phone": "Extracted phone",
        "linkedin": "Extracted LinkedIn URL or handle",
        "github": "Extracted GitHub URL or handle",
        "portfolio": "Extracted portfolio URL",
        "address": "Extracted address or location",
        "education": [
          {{ "degree": "degree name", "school": "school name", "year": "graduation year/range" }}
        ],
        "experience": [
          {{ "role": "role title", "company": "company name", "duration": "employment duration", "description": "original description/bullet points" }}
        ],
        "projects": [
          {{ "title": "project title", "description": "original description", "technologies": ["tech1", "tech2"] }}
        ],
        "skills": ["list of all extracted skills"],
        "certifications": ["list of certifications"],
        "achievements": ["list of achievements"],
        "languages": ["list of languages"]
      }},
      "scores": {{
        "overall": 0-100 score,
        "formatting": 0-100 score,
        "keyword_match": 0-100 score,
        "skill_match": 0-100 score,
        "experience": 0-100 score,
        "projects": 0-100 score,
        "education": 0-100 score,
        "grammar": 0-100 score,
        "readability": 0-100 score,
        "professional_writing": 0-100 score
      }},
      "keywords": {{
        "matched_percentage": 0-100 percentage of JD keywords present,
        "missing_percentage": 0-100 percentage of JD keywords missing,
        "matched": ["list of keywords present in resume that match JD"],
        "missing": ["list of keywords from JD missing in resume"],
        "low_frequency": [
          {{ "word": "keyword", "count": 1, "suggested_count": 3 }}
        ],
        "suggested": ["list of suggested keywords to add"]
      }},
      "skills_analysis": {{
        "programming_languages": {{ "present": [], "missing": [], "recommended": [] }},
        "frameworks": {{ "present": [], "missing": [], "recommended": [] }},
        "databases": {{ "present": [], "missing": [], "recommended": [] }},
        "cloud_platforms": {{ "present": [], "missing": [], "recommended": [] }},
        "big_data": {{ "present": [], "missing": [], "recommended": [] }},
        "devops": {{ "present": [], "missing": [], "recommended": [] }},
        "ml": {{ "present": [], "missing": [], "recommended": [] }},
        "ai": {{ "present": [], "missing": [], "recommended": [] }},
        "data_engineering": {{ "present": [], "missing": [], "recommended": [] }}
      }},
      "line_by_line_review": [
        {{
          "original": "Original sentence from resume",
          "issue": "Specific issue with the sentence (e.g. weak verbs, no metrics, generic)",
          "suggestion": "Recruiter-friendly suggestion",
          "improved": "Full improved sentence ready for use"
        }}
      ],
      "word_suggestions": [
        {{
          "weak_word": "e.g. worked",
          "suggestions": ["e.g. engineered", "developed", "architected"]
        }}
      ],
      "grammar_review": {{
        "issues": [
          {{ "type": "Grammar/Spelling/Passive Voice/Repetitive Words/Long Sentences", "original": "original sentence", "correction": "suggested correction" }}
        ]
      }},
      "professional_summary": {{
        "original": "existing summary or blank",
        "suggested": "Generated summary tailored to JD or target role",
        "action": "Generate" or "Improve"
      }},
      "project_enhancements": [
        {{
          "original_title": "project title",
          "original_description": "description",
          "enhanced_description": "enhanced professional description with metrics/impact",
          "suggestions": ["specific suggestions for this project"]
        }}
      ],
      "experience_enhancements": [
        {{
          "original": "original experience description block",
          "enhanced": "enhanced professional recruiter-ready block",
          "suggestions": ["specific recommendations for bullet points"]
        }}
      ],
      "formatting_review": {{
        "issues": ["list of potential ATS issues (icons, tables, columns, text boxes, headers/footers)"],
        "recommendations": ["recommendations for clean formatting"]
      }},
      "section_validation": {{
        "present": ["list of sections found"],
        "missing": ["list of missing standard sections from: Summary, Education, Experience, Projects, Skills, Certifications, Achievements, Languages"],
        "suggestions": ["reasons and suggestions to add the missing sections"]
      }},
      "recruiter_suggestions": [
        "top 10 improvements before applying (e.g. add achievements, mention docker, mention CI/CD, use action verbs)"
      ]
    }}
    """
    
    try:
        prompt = PromptTemplate.from_template(prompt_template)
        chain = prompt | llm | StrOutputParser()
        
        raw_res = chain.invoke({
            "resume_text": resume_text,
            "jd_text": jd_text or "General Industry requirements for " + target_role,
            "target_role": target_role
        })
        
        cleaned_res = clean_json_string(raw_res)
        data = json.loads(cleaned_res)
        # Ensure parser_raw_text is set
        data["parser_raw_text"] = resume_text
        return data
    except Exception as e:
        logger.error(f"Error calling Gemini in ATS analyze: {e}. Falling back to mock data.")
        return generate_mock_analysis(resume_text, jd_text, target_role)


def improve_bullet_point(text: str, improve_type: str, jd_text: str) -> Dict[str, str]:
    llm = get_llm()
    if not llm:
        # Fallback simple generator
        return {
            "original": text,
            "improved": f"Spearheaded and engineered advanced mechanisms for '{text}' aligning with industry standards, achieving 25% efficiency gains and optimizing delivery.",
            "suggestions": ["Include specific technologies used.", "Add a measurable success metric."]
        }
        
    prompt_template = """
    You are an expert Technical Recruiter.
    Improve the following bullet point from a resume. Make it professional, action-oriented, and highlight metrics, technologies, and achievements.
    
    Type: {type} (experience bullet or project bullet)
    Job Description Context: {jd_text}
    
    Original Bullet Point:
    {text}
    
    Provide your output as a JSON object containing:
    {{
      "original": "the original text",
      "improved": "the fully enhanced, recruiter-ready description",
      "suggestions": ["suggestions for what metrics or additional tech they could add to make it even stronger"]
    }}
    """
    try:
        prompt = PromptTemplate.from_template(prompt_template)
        chain = prompt | llm | StrOutputParser()
        
        raw_res = chain.invoke({
            "text": text,
            "type": improve_type,
            "jd_text": jd_text or "General software engineering principles"
        })
        cleaned_res = clean_json_string(raw_res)
        return json.loads(cleaned_res)
    except Exception as e:
        logger.error(f"Error in improve_bullet_point: {e}")
        return {
            "original": text,
            "improved": f"Developed and implemented scalable solutions for {text} integrating REST APIs and modern framework libraries.",
            "suggestions": ["Add metrics/quantifiable accomplishments."]
        }


def rewrite_resume_variations(resume_text: str, jd_text: str, target_role: str) -> Dict[str, str]:
    llm = get_llm()
    if not llm:
        # Generate mock resume variations
        summary = f"Results-driven software professional with experience in full-stack applications. Proven record of developing robust APIs and containerized microservices. Expert in collaborating with cross-functional teams to engineer performance-critical applications tailored to {target_role} guidelines."
        return {
            "optimized": f"# Jane Doe\nsf, CA | jane.doe@example.com\n\n## Professional Summary\n{summary}\n\n## Experience\n**Software Engineer** - Tech Corp (2023 - Present)\n- Engineered RESTful APIs and integrated relational PostgreSQL databases.\n- Automated Docker container deployments, reducing startup latency.",
            "tailored": f"# Jane Doe\n\n## Summary\nHighly motivated developer specializing in {target_role} requirements outlined in the Job Description, including Git and modern databases.\n\n## Experience\n- Leveraged python script automation to streamline database management.",
            "keyword_optimized": f"# Jane Doe\n\n## Technical Core\nLanguages: Python, JavaScript, SQL\nDevOps: Docker, Git, CI/CD, AWS Cloud\n\n## Work History\n- Implemented cloud solutions with AWS, utilizing Docker containers to deploy Django services.",
            "interview_ready": f"# Jane Doe\n\n## Impact Highlights\n- Developed Django APIs achieving 40% automated resume evaluation accuracy.\n- Dockerized infrastructure reducing local build times by 30%."
        }
        
    prompt_template = """
    You are an expert Resume Writer.
    Rewrite the candidate's resume based on the target role and job description.
    You must output four different variations of the resume:
    1. Optimized: General best resume practices (standard layout, metrics-oriented, strong action verbs).
    2. Tailored: Explicitly aligned with the Job Description requirements and target role duties.
    3. Keyword Optimized: Focused heavily on adding the missing keywords and core skills required.
    4. Interview Ready: Bullet points structured in STAR format (Situation, Task, Action, Result) with strong metrics.
    
    Target Role: {target_role}
    Job Description: {jd_text}
    
    Resume Text:
    {resume_text}
    
    Your response MUST be a JSON object matching this schema. Do not include markdown code ticks outside the JSON. Return only the JSON object.
    {{
      "optimized": "The fully rewritten optimized resume in Markdown format",
      "tailored": "The fully rewritten tailored resume in Markdown format",
      "keyword_optimized": "The fully rewritten keyword optimized resume in Markdown format",
      "interview_ready": "The fully rewritten interview ready resume in Markdown format"
    }}
    """
    try:
        prompt = PromptTemplate.from_template(prompt_template)
        chain = prompt | llm | StrOutputParser()
        
        raw_res = chain.invoke({
            "resume_text": resume_text,
            "jd_text": jd_text or "General Industry requirements for " + target_role,
            "target_role": target_role
        })
        cleaned_res = clean_json_string(raw_res)
        return json.loads(cleaned_res)
    except Exception as e:
        logger.error(f"Error in rewrite_resume_variations: {e}")
        return {
            "optimized": "# Optimized Resume\n" + resume_text,
            "tailored": "# Tailored Resume\n" + resume_text,
            "keyword_optimized": "# Keyword Optimized Resume\n" + resume_text,
            "interview_ready": "# Interview Ready Resume\n" + resume_text
        }
