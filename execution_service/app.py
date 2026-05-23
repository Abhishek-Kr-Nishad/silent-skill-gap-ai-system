from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import tempfile
import os
import time

app = FastAPI()

class ExecutionRequest(BaseModel):
    language: str
    code: str
    input_data: str = ""

@app.post("/execute")
def execute_code(req: ExecutionRequest):
    language = req.language.lower()
    code = req.code
    input_data = req.input_data

    # Map language to file extension and execution command
    lang_config = {
        "python": {"ext": ".py", "compile": None, "run": ["python3"]},
        "cpp": {"ext": ".cpp", "compile": ["g++", "-O2", "-o", "a.out"], "run": ["./a.out"]},
        "java": {"ext": ".java", "compile": ["javac"], "run": ["java"]},
        "javascript": {"ext": ".js", "compile": None, "run": ["node"]},
    }

    if language not in lang_config:
        raise HTTPException(status_code=400, detail="Unsupported language")

    config = lang_config[language]
    
    with tempfile.TemporaryDirectory() as temp_dir:
        # For Java, the class name might be 'Main'. Let's enforce 'Main.java' if java, otherwise generic name.
        file_name = "Main.java" if language == "java" else f"solution{config['ext']}"
        source_path = os.path.join(temp_dir, file_name)
        
        with open(source_path, "w") as f:
            f.write(code)

        start_time = time.time()
        
        # Compile if necessary
        if config["compile"]:
            compile_cmd = config["compile"] + [source_path]
            try:
                comp_process = subprocess.run(compile_cmd, cwd=temp_dir, capture_output=True, text=True, timeout=10)
                if comp_process.returncode != 0:
                    return {
                        "status": "Compilation Error",
                        "stdout": "",
                        "stderr": comp_process.stderr,
                        "runtime": 0,
                        "memory": 0
                    }
            except subprocess.TimeoutExpired:
                return {
                    "status": "Time Limit Exceeded (Compilation)",
                    "stdout": "",
                    "stderr": "Compilation timed out.",
                    "runtime": 0,
                    "memory": 0
                }

        # Execute
        run_cmd = config["run"].copy()
        if language == "java":
            run_cmd.append("Main")
        elif language != "cpp":
            run_cmd.append(source_path)

        try:
            run_process = subprocess.run(
                run_cmd,
                cwd=temp_dir,
                input=input_data,
                capture_output=True,
                text=True,
                timeout=5  # Strict 5 seconds timeout
            )
            
            runtime = (time.time() - start_time) * 1000 # runtime in ms
            
            status = "Accepted" if run_process.returncode == 0 else "Runtime Error"
            
            return {
                "status": status,
                "stdout": run_process.stdout,
                "stderr": run_process.stderr,
                "runtime": round(runtime, 2),
                "memory": 12.5 # Mock memory usage for now, actual extraction requires more complex setup like time -v
            }
            
        except subprocess.TimeoutExpired:
            return {
                "status": "Time Limit Exceeded",
                "stdout": "",
                "stderr": "Execution timed out.",
                "runtime": 5000,
                "memory": 0
            }
