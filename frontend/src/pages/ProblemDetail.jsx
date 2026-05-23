import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Play, Send, RefreshCw, CheckCircle, XCircle, AlertCircle, ChevronLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ProblemDetail() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('# Write your Python code here\n\ndef solve():\n    pass\n');
    const [output, setOutput] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [activeTab, setActiveTab] = useState('description'); // description, editorial, submissions
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProblem();
    }, [id]);

    const fetchProblem = async () => {
        try {
            const res = await api.get(`/shared/problems/${id}/`);
            setProblem(res.data);
        } catch (error) {
            console.error("Failed to fetch problem", error);
            // Fallback mock data
            setProblem({
                title: 'Two Sum',
                difficulty: 'Easy',
                tags: 'Hash Table, Arrays',
                statement: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
                constraints: '- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- -10^9 <= target <= 10^9\n- Only one valid answer exists.',
                examples: [
                    { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGetAiReview = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setIsExecuting(true);
        setOutput('Generating AI Code Review...\nThis may take a few seconds.');
        
        try {
            const res = await api.post('/shared/ai-code-review/', {
                code: code,
                language: language,
                problem_statement: problem.statement
            });
            
            setOutput(`=== AI CODE REVIEW ===\n\n${res.data.review}`);
        } catch (error) {
            setOutput(`Failed to get AI Review.\n\nDetails: ${error.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleRunCode = async () => {
        setIsExecuting(true);
        setOutput('Executing...\n');
        
        try {
            // Note: In a real environment, you might have a dedicated /run endpoint that doesn't save to DB.
            // For now, we'll just hit the submission endpoint which tests and saves.
            const res = await api.post('/shared/submissions/', {
                problem: id,
                language: language,
                code: code
            });
            
            const result = res.data.execution_result;
            if (result) {
                let outText = `Status: ${result.status}\n`;
                outText += `Runtime: ${result.runtime}ms\n`;
                outText += `Memory: ${result.memory}MB\n\n`;
                if (result.stdout) outText += `--- STDOUT ---\n${result.stdout}\n`;
                if (result.stderr) outText += `--- STDERR ---\n${result.stderr}\n`;
                setOutput(outText);
            } else {
                setOutput('Execution completed but no result was returned.');
            }
        } catch (error) {
            setOutput(`Error connecting to execution service.\n\nDetails: ${error.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setIsExecuting(true);
        setOutput('Submitting and testing against hidden cases...\n');
        
        try {
            const res = await api.post('/shared/submissions/', {
                problem: id,
                language: language,
                code: code
            });
            
            const result = res.data.execution_result;
            if (result) {
                let outText = `=== SUBMISSION RESULTS ===\n`;
                outText += `Status: ${result.status} ${result.status === 'Accepted' ? '🎉' : '❌'}\n`;
                outText += `Runtime: ${result.runtime}ms\n`;
                outText += `Memory: ${result.memory}MB\n\n`;
                if (result.stdout) outText += `--- Output ---\n${result.stdout}\n`;
                if (result.stderr) outText += `--- Errors ---\n${result.stderr}\n`;
                setOutput(outText);
            } else {
                setOutput('Submission processed, but no execution result provided.');
            }
        } catch (error) {
            setOutput(`Submission failed.\n\nDetails: ${error.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    if (loading || !problem) {
        return <div className="min-h-screen flex items-center justify-center text-light-text dark:text-dark-text">Loading problem...</div>;
    }

    return (
        <div className="h-screen pt-16 flex flex-col bg-slate-50 dark:bg-dark-bg overflow-hidden">
            {/* Top Navbar for Editor */}
            <div className="h-14 bg-white dark:bg-dark-card border-b border-light-border dark:border-white/5 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center space-x-4">
                    <Link to="/problems" className="text-light-muted dark:text-dark-muted hover:text-brand-500 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <h2 className="font-bold text-light-text dark:text-dark-text truncate max-w-[200px] md:max-w-md">
                        {problem.title}
                    </h2>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                        problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-rose-500/10 text-rose-500'
                    }`}>
                        {problem.difficulty}
                    </span>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={handleRunCode}
                        disabled={isExecuting}
                        className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-light-text dark:text-dark-text text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        <Play className="w-4 h-4" />
                        <span>Run</span>
                    </button>
                    <button 
                        onClick={handleGetAiReview}
                        disabled={(!code && user) || isExecuting}
                        className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>{!user ? "Login for AI Review" : "AI Review"}</span>
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isExecuting}
                        className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-glow"
                    >
                        <Send className="w-4 h-4" />
                        <span>{!user ? "Login to Submit" : "Submit"}</span>
                    </button>
                </div>
            </div>

            {/* Main Split Pane */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Panel: Problem Statement */}
                <div className="w-full md:w-1/2 flex flex-col border-r border-light-border dark:border-white/5 bg-white dark:bg-dark-card overflow-hidden">
                    <div className="flex border-b border-light-border dark:border-white/5 shrink-0">
                        <button 
                            onClick={() => setActiveTab('description')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'description' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'}`}
                        >
                            Description
                        </button>
                        <button 
                            onClick={() => setActiveTab('editorial')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'editorial' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'}`}
                        >
                            Editorial
                        </button>
                        <button 
                            onClick={() => setActiveTab('submissions')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'submissions' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'}`}
                        >
                            Submissions
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 prose dark:prose-invert max-w-none">
                        {activeTab === 'description' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="text-light-text dark:text-dark-text whitespace-pre-wrap font-medium">
                                    {problem.statement}
                                </div>
                                
                                {problem.examples && problem.examples.length > 0 && (
                                    <div className="mt-8 space-y-6">
                                        <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Examples</h3>
                                        {problem.examples.map((ex, idx) => (
                                            <div key={idx} className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-light-border dark:border-white/10">
                                                <p className="mb-2"><strong className="text-light-text dark:text-dark-text">Input:</strong> <span className="font-mono text-sm text-brand-600 dark:text-brand-400">{ex.input}</span></p>
                                                <p className="mb-2"><strong className="text-light-text dark:text-dark-text">Output:</strong> <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">{ex.output}</span></p>
                                                {ex.explanation && <p><strong className="text-light-text dark:text-dark-text">Explanation:</strong> <span className="text-light-muted dark:text-dark-muted text-sm">{ex.explanation}</span></p>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {problem.constraints && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Constraints</h3>
                                        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-light-border dark:border-white/10">
                                            <pre className="text-sm text-light-muted dark:text-dark-muted font-mono whitespace-pre-wrap">{problem.constraints}</pre>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                        {activeTab === 'editorial' && (
                            <div className="text-center text-light-muted dark:text-dark-muted mt-10">Editorial is locked until you solve the problem.</div>
                        )}
                        {activeTab === 'submissions' && (
                            <div className="text-center text-light-muted dark:text-dark-muted mt-10">You have no recent submissions for this problem.</div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Code Editor & Console */}
                <div className="w-full md:w-1/2 flex flex-col h-[50vh] md:h-auto">
                    {/* Language Selector */}
                    <div className="h-12 bg-white dark:bg-dark-card border-b border-light-border dark:border-white/5 flex items-center px-4 shrink-0">
                        <select 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-slate-100 dark:bg-white/5 border-none rounded-lg px-3 py-1 text-sm text-light-text dark:text-dark-text focus:ring-0 cursor-pointer outline-none"
                        >
                            <option value="python">Python 3</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                            <option value="javascript">JavaScript</option>
                        </select>
                        <button 
                            onClick={() => setCode('# Write your code here\n')}
                            className="ml-auto p-1.5 text-light-muted hover:text-brand-500 dark:text-dark-muted dark:hover:text-brand-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                            title="Reset Code"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 overflow-hidden relative border-b border-light-border dark:border-white/5">
                        <Editor
                            height="100%"
                            language={language === 'python' ? 'python' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'javascript'}
                            theme="vs-dark" // Will ideally sync with global theme, forcing dark for "hacker" feel
                            value={code}
                            onChange={(val) => setCode(val)}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: 'JetBrains Mono, Consolas, monospace',
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                                cursorBlinking: "smooth",
                                cursorSmoothCaretAnimation: "on",
                            }}
                        />
                    </div>

                    {/* Console Output */}
                    <div className="h-1/3 bg-slate-900 flex flex-col shrink-0 relative z-10">
                        <div className="h-10 bg-slate-950 flex items-center px-4 border-b border-slate-800">
                            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Console Output</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                            {output ? (
                                <pre className={`${output.includes('Accepted') ? 'text-emerald-400' : output.includes('Error') ? 'text-rose-400' : 'text-slate-300'} whitespace-pre-wrap`}>
                                    {output}
                                </pre>
                            ) : (
                                <div className="text-slate-600 italic">Run or submit code to see output here.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
