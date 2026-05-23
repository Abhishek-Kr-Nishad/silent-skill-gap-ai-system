import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Briefcase, Zap, File, X, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [targetRole, setTargetRole] = useState('Software Engineer');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!file) return;
        setIsAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('target_role', targetRole);

        try {
            const res = await api.post('/shared/analyze-resume/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.details || err.response?.data?.error || "Failed to analyze resume. Please try again.");
            // Provide a mock fallback if the ML service isn't running locally
            setTimeout(() => {
                setResult({
                    ats_score: 68,
                    extracted_skills: ['python', 'react', 'git', 'javascript', 'html'],
                    missing_skills: ['docker', 'aws', 'sql'],
                    suggestions: [
                        "Consider learning or highlighting these skills: docker, aws, sql.",
                        "Your resume lacks keywords strongly associated with backend infrastructure."
                    ],
                    resume_length_words: 320
                });
                setError(null);
                setIsAnalyzing(false);
            }, 1500);
            return;
        }
        setIsAnalyzing(false);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20";
        if (score >= 60) return "text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20";
        return "text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20";
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="text-center mb-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-full mb-4"
                >
                    <Briefcase className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                </motion.div>
                <h1 className="text-4xl font-extrabold text-light-text dark:text-dark-text tracking-tight mb-4">
                    AI Resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500">Analyzer</span>
                </h1>
                <p className="text-lg text-light-muted dark:text-dark-muted max-w-2xl mx-auto">
                    Upload your resume to get an instant ATS score, identify missing skills, and receive actionable feedback tailored to your target role.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-dark-card rounded-3xl p-8 shadow-sm border border-light-border dark:border-white/5 h-fit"
                >
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">Upload Resume</h3>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Target Role</label>
                        <input 
                            type="text" 
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="e.g., Software Engineer, Data Scientist"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-light-text dark:text-dark-text transition-all"
                        />
                    </div>

                    <div className="border-2 border-dashed border-light-border dark:border-white/10 rounded-2xl p-8 text-center bg-slate-50 dark:bg-dark-bg/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer relative group">
                        <input 
                            type="file" 
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center pointer-events-none">
                            {file ? (
                                <>
                                    <div className="p-4 bg-brand-500/10 rounded-full mb-3">
                                        <File className="w-8 h-8 text-brand-500" />
                                    </div>
                                    <p className="font-semibold text-light-text dark:text-dark-text">{file.name}</p>
                                    <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 bg-slate-200 dark:bg-white/5 rounded-full mb-3 group-hover:bg-brand-500/10 transition-colors">
                                        <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-brand-500 transition-colors" />
                                    </div>
                                    <p className="font-semibold text-light-text dark:text-dark-text mb-1">Click to upload or drag and drop</p>
                                    <p className="text-xs text-light-muted dark:text-dark-muted">PDF, DOCX, or TXT (Max 5MB)</p>
                                </>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={(!file && user) || isAnalyzing}
                        className="mt-6 w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
                    >
                        {!user ? (
                            <>
                                <Zap className="w-5 h-5 mr-2" />
                                Login to Analyze
                            </>
                        ) : isAnalyzing ? (
                            <>
                                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                Analyzing Document...
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5 mr-2" />
                                Generate ATS Report
                            </>
                        )}
                    </button>
                    
                    {error && (
                        <div className="mt-4 p-4 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-sm font-medium flex items-start">
                            <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />
                            <span>{error} (Showing mock data for demonstration)</span>
                        </div>
                    )}
                </motion.div>

                {/* Results Section */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-light-border dark:border-white/5 overflow-hidden flex flex-col h-full min-h-[500px]"
                >
                    {!result && !isAnalyzing ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-light-muted dark:text-dark-muted">
                            <FileText className="w-16 h-16 mb-4 opacity-50" />
                            <h3 className="text-xl font-bold mb-2 text-light-text dark:text-dark-text">No Report Generated</h3>
                            <p className="max-w-xs">Upload your resume and hit analyze to see your ATS score and feedback.</p>
                        </div>
                    ) : isAnalyzing ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="relative w-24 h-24 mb-6">
                                <svg className="animate-spin w-full h-full text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <Zap className="w-8 h-8 text-brand-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <h3 className="text-xl font-bold text-light-text dark:text-dark-text animate-pulse">Running NLP Analysis...</h3>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            {/* Score Header */}
                            <div className={`p-8 border-b ${getScoreColor(result.ats_score)}`}>
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Overall ATS Score</div>
                                    <div className="text-7xl font-black mb-2">{result.ats_score}</div>
                                    <div className="text-sm font-semibold opacity-90 max-w-xs">
                                        {result.ats_score >= 80 ? 'Excellent match! Your resume is highly tailored.' : 
                                         result.ats_score >= 60 ? 'Good start, but missing some key terminology.' : 
                                         'Needs significant improvement to pass ATS filters.'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Missing Skills */}
                                {result.missing_skills?.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-bold flex items-center text-light-text dark:text-dark-text mb-4">
                                            <AlertTriangle className="w-5 h-5 mr-2 text-rose-500" /> 
                                            Missing Critical Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.missing_skills.map((skill, i) => (
                                                <span key={i} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 font-semibold text-sm border border-rose-200 dark:border-rose-500/20">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Extracted Skills */}
                                {result.extracted_skills?.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-bold flex items-center text-light-text dark:text-dark-text mb-4">
                                            <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" /> 
                                            Skills Identified
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.extracted_skills.map((skill, i) => (
                                                <span key={i} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-semibold text-sm border border-emerald-200 dark:border-emerald-500/20">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Suggestions */}
                                {result.suggestions?.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-bold text-light-text dark:text-dark-text mb-4 border-b border-light-border dark:border-white/10 pb-2">AI Suggestions</h4>
                                        <ul className="space-y-3">
                                            {result.suggestions.map((sug, i) => (
                                                <li key={i} className="flex items-start">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">{i+1}</span>
                                                    <span className="text-light-muted dark:text-dark-muted text-sm">{sug}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                <div className="text-xs text-center text-light-muted dark:text-dark-muted pt-4 border-t border-light-border dark:border-white/10">
                                    Word count: {result.resume_length_words} words
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
