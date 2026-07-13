import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UploadCloud, FileText, CheckCircle, AlertTriangle, Briefcase, Zap, File, X, RefreshCw, 
    ChevronRight, Copy, Download, Trash2, Award, BookOpen, Layers, Settings, Eye, HelpCircle, 
    Sparkles, ArrowRight, Edit, ThumbsUp, History, RefreshCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function ResumeAnalyzer() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Wizard Upload States
    const [file, setFile] = useState(null);
    const [jdFile, setJdFile] = useState(null);
    const [jdText, setJdText] = useState('');
    const [targetRole, setTargetRole] = useState('Software Engineer');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isRewriting, setIsRewriting] = useState(false);
    const [error, setError] = useState(null);

    // Analysis Result States
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // overview, parser, keywords, linebyline, rewriter, history
    const [activeRewriteTab, setActiveRewriteTab] = useState('optimized'); // optimized, tailored, keyword, interview
    
    // Interactive Weak Words Editor States
    const [editableResumeText, setEditableResumeText] = useState('');
    const [comparisonReportA, setComparisonReportA] = useState(null);
    const [comparisonReportB, setComparisonReportB] = useState(null);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/resume/history/');
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch analysis history", err);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleJdFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setJdFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleDeleteReport = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        try {
            await api.delete(`/resume/report/${id}/`);
            setHistory(history.filter(item => item.id !== id));
            if (result && result.id === id) {
                setResult(null);
            }
        } catch (err) {
            console.error("Failed to delete report", err);
        }
    };

    const handleLoadReport = async (id) => {
        setIsAnalyzing(true);
        try {
            const res = await api.get(`/resume/report/${id}/`);
            setResult(res.data);
            setEditableResumeText(res.data.report_data?.parser_raw_text || '');
            setActiveTab('overview');
        } catch (err) {
            console.error("Failed to load report", err);
            setError("Failed to load details of the selected report.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleRunAnalysis = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!file) {
            setError("Please upload a resume file first.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            // Step 1: Upload and extract resume text
            const resumeFormData = new FormData();
            resumeFormData.append('resume', file);
            const resumeUploadRes = await api.post('/resume/upload/', resumeFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const extractedResumeText = resumeUploadRes.data.resume_text;
            const resumeFileName = resumeUploadRes.data.resume_name;

            // Step 2: Upload and extract job description text if provided
            let finalJdText = jdText;
            if (jdFile) {
                const jdFormData = new FormData();
                jdFormData.append('job_description_file', jdFile);
                const jdUploadRes = await api.post('/resume/job-description/', jdFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalJdText = jdUploadRes.data.jd_text;
            } else if (jdText.trim()) {
                const jdUploadRes = await api.post('/resume/job-description/', {
                    job_description_text: jdText
                });
                finalJdText = jdUploadRes.data.jd_text;
            }

            // Step 3: Run comprehensive ATS analysis
            const analyzeRes = await api.post('/resume/analyze/', {
                resume_text: extractedResumeText,
                jd_text: finalJdText,
                target_role: targetRole,
                resume_name: resumeFileName
            });

            setResult(analyzeRes.data);
            setEditableResumeText(extractedResumeText);
            fetchHistory();
            setActiveTab('overview');
        } catch (err) {
            console.error("Analysis process failed", err);
            setError(err.response?.data?.details || err.response?.data?.error || "An error occurred during resume analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerateRewrite = async () => {
        if (!result) return;
        setIsRewriting(true);
        try {
            const res = await api.post('/resume/rewrite/', {
                report_id: result.id,
                resume_text: editableResumeText,
                jd_text: result.job_description,
                target_role: result.target_role
            });
            setResult({
                ...result,
                rewritten_resumes: res.data
            });
        } catch (err) {
            console.error("Failed to generate rewritten resumes", err);
        } finally {
            setIsRewriting(false);
        }
    };

    const handleReplaceWord = (weakWord, strongWord) => {
        const regex = new RegExp(`\\b${weakWord}\\b`, 'gi');
        const updated = editableResumeText.replace(regex, strongWord);
        setEditableResumeText(updated);
    };

    const handleCopyText = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
        if (score >= 60) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
        return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    };

    const renderMarkdown = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, idx) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('# ')) {
                return <h1 key={idx} className="text-2xl font-bold border-b border-light-border dark:border-white/5 pb-2 mt-4 mb-2 text-gradient">{trimmed.replace('# ', '')}</h1>;
            }
            if (trimmed.startsWith('## ')) {
                return <h2 key={idx} className="text-xl font-bold mt-3 mb-2 text-light-text dark:text-dark-text">{trimmed.replace('## ', '')}</h2>;
            }
            if (trimmed.startsWith('### ')) {
                return <h3 key={idx} className="text-lg font-semibold mt-2 mb-1 text-light-text dark:text-dark-text">{trimmed.replace('### ', '')}</h3>;
            }
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                return <li key={idx} className="ml-5 list-disc text-light-muted dark:text-dark-muted py-0.5">{trimmed.substring(2)}</li>;
            }
            return <p key={idx} className="text-light-muted dark:text-dark-muted my-1">{trimmed}</p>;
        });
    };

    // Prepare Radar Data
    const scores = result?.report_data?.scores || {};
    const radarData = [
        { subject: 'Formatting', A: scores.formatting || 50, fullMark: 100 },
        { subject: 'Keywords', A: scores.keyword_match || 50, fullMark: 100 },
        { subject: 'Skills', A: scores.skill_match || 50, fullMark: 100 },
        { subject: 'Experience', A: scores.experience || 50, fullMark: 100 },
        { subject: 'Projects', A: scores.projects || 50, fullMark: 100 },
        { subject: 'Education', A: scores.education || 50, fullMark: 100 },
        { subject: 'Grammar', A: scores.grammar || 50, fullMark: 100 },
        { subject: 'Readability', A: scores.readability || 50, fullMark: 100 },
        { subject: 'Writing', A: scores.professional_writing || 50, fullMark: 100 },
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors">
            
            {/* Header Title */}
            <div className="text-center mb-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-full mb-4"
                >
                    <Briefcase className="w-8 h-8 text-brand-500" />
                </motion.div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-4">
                    AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500">ATS Resume Coach</span>
                </h1>
                <p className="text-lg text-light-muted dark:text-dark-muted max-w-2xl mx-auto">
                    Evaluate your resume against real Job Descriptions. Receive line-by-line coaching, formatting feedback, keyword optimization, and download interview-ready resumes.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-3 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Area Split */}
            {!result ? (
                // WIZARD INTERFACE
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Setup / Upload Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-dark-card rounded-3xl p-8 shadow-premium border border-light-border dark:border-white/5 flex flex-col justify-between"
                    >
                        <div>
                            <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-6 flex items-center">
                                <Sparkles className="w-6 h-6 mr-2 text-brand-500" />
                                Analysis Workspace
                            </h3>
                            
                            {/* Target Role */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-2">Target Job Title</label>
                                <input 
                                    type="text" 
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    placeholder="e.g., Software Engineer, Backend Lead"
                                    className="input-premium"
                                />
                            </div>

                            {/* Resume File Upload */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-2">Upload Resume (PDF, DOCX, TXT)</label>
                                <div className="border-2 border-dashed border-light-border dark:border-white/10 rounded-2xl p-6 text-center bg-slate-50 dark:bg-dark-bg/20 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer relative group">
                                    <input 
                                        type="file" 
                                        accept=".pdf,.docx,.txt"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center justify-center pointer-events-none">
                                        {file ? (
                                            <>
                                                <File className="w-8 h-8 text-brand-500 mb-2" />
                                                <p className="font-semibold text-sm">{file.name}</p>
                                                <p className="text-xs text-light-muted mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-brand-500 transition-colors mb-2" />
                                                <p className="font-semibold text-sm">Drag and drop or click to upload</p>
                                                <p className="text-xs text-light-muted mt-1">Supported: PDF, DOCX, TXT</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Job Description Options */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold">Job Description (Optional)</label>
                                    <span className="text-xs text-brand-500 font-medium">Improves ATS Accuracy</span>
                                </div>
                                
                                <textarea 
                                    value={jdText}
                                    onChange={(e) => setJdText(e.target.value)}
                                    rows={4}
                                    placeholder="Paste the job description text here..."
                                    className="input-premium font-sans text-sm mb-4"
                                />

                                <div className="relative border border-light-border dark:border-white/5 rounded-xl p-3 flex items-center bg-slate-50 dark:bg-dark-bg/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                    <input 
                                        type="file" 
                                        accept=".pdf,.docx,.txt"
                                        onChange={handleJdFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <FileText className="w-5 h-5 text-brand-500 mr-2" />
                                    <span className="text-xs font-semibold text-light-muted dark:text-dark-muted">
                                        {jdFile ? `Uploaded JD: ${jdFile.name}` : "Or upload Job Description file (PDF/DOCX)"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleRunAnalysis}
                            disabled={isAnalyzing}
                            className="btn-primary w-full py-4 mt-4 font-bold flex items-center justify-center"
                        >
                            {isAnalyzing ? (
                                <>
                                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                    Running Semantic NLP Parser...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5 mr-2 animate-pulse" />
                                    Generate Comprehensive Coach Report
                                </>
                            )}
                        </button>
                    </motion.div>

                    {/* Historical Reports Sidebar */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-dark-card rounded-3xl p-8 shadow-premium border border-light-border dark:border-white/5 flex flex-col h-[650px] overflow-hidden"
                    >
                        <h3 className="text-2xl font-bold mb-6 flex items-center">
                            <History className="w-6 h-6 mr-2 text-accent-500" />
                            Recent Appraisals
                        </h3>
                        
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {history.length > 0 ? (
                                history.map((report) => (
                                    <div 
                                        key={report.id}
                                        onClick={() => handleLoadReport(report.id)}
                                        className="p-4 rounded-2xl border border-light-border dark:border-white/5 bg-slate-50 dark:bg-dark-bg/20 hover:bg-brand-500/5 hover:border-brand-500/20 transition-all cursor-pointer flex justify-between items-center group"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-xl border ${getScoreColor(report.ats_score)}`}>
                                                <span className="font-extrabold text-sm">{report.ats_score}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-light-text dark:text-dark-text group-hover:text-brand-500 transition-colors truncate max-w-[200px]">
                                                    {report.resume_name}
                                                </h4>
                                                <p className="text-xs text-light-muted dark:text-dark-muted font-medium mt-0.5">
                                                    {report.target_role} • {new Date(report.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <ChevronRight className="w-5 h-5 text-light-muted group-hover:text-brand-500 transition-colors" />
                                            <button 
                                                onClick={(e) => handleDeleteReport(report.id, e)}
                                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-light-muted">
                                    <FileText className="w-12 h-12 mb-3 opacity-40" />
                                    <p className="text-sm font-semibold">No reports generated yet</p>
                                    <p className="text-xs">Upload your resume above to start building your career gap profile.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            ) : (
                // DETAILED APP WORKSPACE
                <div className="space-y-6">
                    {/* Top Stats Banner */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-6 shadow-premium space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => setResult(null)}
                                className="p-2.5 rounded-xl border border-light-border dark:border-white/10 hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
                                title="Back to upload"
                            >
                                <RefreshCcw className="w-5 h-5" />
                            </button>
                            <div>
                                <div className="text-xs font-semibold text-brand-500">Resume Report Workspace</div>
                                <h2 className="text-xl font-bold flex items-center mt-1">
                                    {result.resume_name} 
                                    <span className="ml-3 px-2 py-0.5 text-xs bg-brand-500/10 text-brand-500 border border-brand-500/20 rounded-full font-bold">
                                        {result.target_role}
                                    </span>
                                </h2>
                            </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center space-x-3">
                            <a 
                                href={`${api.defaults.baseURL}/resume/report/${result.id}/download-pdf`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center border-brand-500/20 text-brand-500 hover:bg-brand-500/5 hover:border-brand-500/40 rounded-xl"
                            >
                                <Download className="w-4 h-4 mr-2" /> Download PDF Report
                            </a>
                            <a 
                                href={`${api.defaults.baseURL}/resume/report/${result.id}/download-docx`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center rounded-xl"
                            >
                                <Download className="w-4 h-4 mr-2" /> Download DOCX Resume
                            </a>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-light-border dark:border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none font-semibold text-sm">
                        {[
                            { id: 'overview', label: 'Dashboard', icon: Layers },
                            { id: 'parser', label: 'Resume Parser', icon: BookOpen },
                            { id: 'keywords', label: 'Keyword Cloud', icon: Sparkles },
                            { id: 'linebyline', label: 'Line-by-Line Coach', icon: Edit },
                            { id: 'rewriter', label: 'AI Rewriter & Builder', icon: Sparkles },
                            { id: 'compare', label: 'Compare Reports', icon: History },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all ${
                                    activeTab === t.id 
                                    ? 'border-brand-500 text-brand-500 bg-brand-500/5' 
                                    : 'border-transparent text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                                }`}
                            >
                                <t.icon className="w-4 h-4" />
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content View Area */}
                    <div className="min-h-[500px]">
                        {/* TAB 1: OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left: ATS Score Gauge */}
                                <div className="lg:col-span-1 bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-premium">
                                    <h3 className="font-bold text-lg mb-6">Overall ATS Score</h3>
                                    
                                    <div className="relative w-44 h-44 mb-6">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <circle 
                                                cx="50" cy="50" r="40" 
                                                stroke="rgba(99, 102, 241, 0.1)" strokeWidth="8" fill="none"
                                            />
                                            <circle 
                                                cx="50" cy="50" r="40" 
                                                stroke="url(#gradientScore)" strokeWidth="8" fill="none"
                                                strokeDasharray="251.2"
                                                strokeDashoffset={251.2 - (251.2 * scores.overall) / 100}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000 ease-out"
                                            />
                                            <defs>
                                                <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#6366f1" />
                                                    <stop offset="100%" stopColor="#d946ef" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-5xl font-black tracking-tight">{scores.overall}</span>
                                            <span className="text-xs text-light-muted font-bold mt-1">out of 100</span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-3 rounded-2xl bg-brand-500/5 border border-brand-500/10 text-xs font-semibold text-light-muted dark:text-dark-muted max-w-xs leading-relaxed">
                                        {scores.overall >= 80 ? 'Excellent match! Your resume is highly tailored.' : 
                                         scores.overall >= 60 ? 'Good start, but missing some key terminology.' : 
                                         'Needs significant improvement to pass ATS filters.'}
                                    </div>
                                </div>

                                {/* Center: Radar Chart */}
                                <div className="lg:col-span-1 bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-6 shadow-premium flex flex-col items-center">
                                    <h3 className="font-bold text-lg mb-4">Aptitude Blueprint</h3>
                                    <div className="w-full h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 8 }} />
                                                <Radar name="Candidate" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Right: Category Scores Grid */}
                                <div className="lg:col-span-1 bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-6 shadow-premium space-y-4">
                                    <h3 className="font-bold text-lg mb-2">Detailed Category Scores</h3>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                        {Object.entries(scores).map(([category, val], i) => (
                                            <div key={i} className="text-xs">
                                                <div className="flex justify-between font-bold mb-1">
                                                    <span className="capitalize">{category.replace('_', ' ')}</span>
                                                    <span>{val}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 dark:bg-dark-bg h-2 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-gradient-to-r from-brand-500 to-accent-500 h-full rounded-full transition-all duration-1000"
                                                        style={{ width: `${val}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recruiter Top 10 Suggestions */}
                                <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-8 shadow-premium">
                                    <h3 className="text-xl font-bold text-gradient mb-6 flex items-center">
                                        <Award className="w-6 h-6 mr-2" /> Top Coach Recommendation Tasks
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.report_data?.recruiter_suggestions?.slice(0, 10).map((sug, idx) => (
                                            <div key={idx} className="flex items-start p-3 bg-slate-50 dark:bg-dark-bg/30 border border-light-border dark:border-white/5 rounded-2xl hover:border-brand-500/20 transition-all">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center text-xs font-extrabold mr-3">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-sm font-semibold text-light-text dark:text-dark-text">{sug}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Strengths and Weaknesses */}
                                <div className="lg:col-span-1 bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-6 shadow-premium space-y-6">
                                    {/* Formatting Layout review */}
                                    <div>
                                        <h4 className="font-bold text-sm mb-3 flex items-center text-rose-500">
                                            <AlertTriangle className="w-4 h-4 mr-2" /> ATS Formatting Warnings
                                        </h4>
                                        <div className="space-y-2 text-xs">
                                            {result.report_data?.formatting_review?.issues?.length > 0 ? (
                                                result.report_data.formatting_review.issues.map((iss, idx) => (
                                                    <div key={idx} className="p-2 rounded-xl bg-rose-500/5 text-rose-400 border border-rose-500/10">
                                                        {iss}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-2 rounded-xl bg-emerald-500/5 text-emerald-400 border border-emerald-500/10">
                                                    Perfect parsing layouts. No major formatting warning found.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Section Checks */}
                                    <div>
                                        <h4 className="font-bold text-sm mb-3 flex items-center">
                                            <CheckCircle className="w-4 h-4 mr-2 text-brand-500" /> Structure Health Check
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.report_data?.section_validation?.present?.map((sec, i) => (
                                                <span key={i} className="px-2.5 py-1 text-[10px] rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                                                    {sec} Present
                                                </span>
                                            ))}
                                            {result.report_data?.section_validation?.missing?.map((sec, i) => (
                                                <span key={i} className="px-2.5 py-1 text-[10px] rounded-lg bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                                                    Missing {sec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: RESUME PARSER */}
                        {activeTab === 'parser' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Side: Profile Card */}
                                <div className="lg:col-span-1 bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-6 shadow-premium h-fit">
                                    <div className="text-center pb-6 border-b border-light-border dark:border-white/5">
                                        <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center text-brand-500 font-black text-2xl mx-auto mb-4 border border-brand-500/20">
                                            {result.report_data?.parser?.name?.substring(0, 2).toUpperCase() || 'CV'}
                                        </div>
                                        <h3 className="text-xl font-bold">{result.report_data?.parser?.name || 'Jane Doe'}</h3>
                                        <p className="text-xs text-light-muted mt-1">{result.target_role}</p>
                                    </div>

                                    {/* Contact info list */}
                                    <div className="pt-6 space-y-4 text-xs font-semibold text-light-text dark:text-dark-text">
                                        {Object.entries({
                                            Email: result.report_data?.parser?.email,
                                            Phone: result.report_data?.parser?.phone,
                                            LinkedIn: result.report_data?.parser?.linkedin,
                                            GitHub: result.report_data?.parser?.github,
                                            Portfolio: result.report_data?.parser?.portfolio,
                                            Address: result.report_data?.parser?.address
                                        }).map(([key, val]) => val && (
                                            <div key={key} className="flex justify-between border-b border-light-border dark:border-white/5 pb-2">
                                                <span className="text-light-muted">{key}</span>
                                                <span className="text-right select-all">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Side: Tabulated structured sections */}
                                <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-8 shadow-premium space-y-8">
                                    {/* Work Experience parser */}
                                    <div>
                                        <h4 className="text-lg font-bold border-b border-light-border dark:border-white/5 pb-2 mb-4 flex items-center">
                                            <Briefcase className="w-5 h-5 mr-2 text-brand-500" /> Professional Experience
                                        </h4>
                                        <div className="space-y-4">
                                            {result.report_data?.parser?.experience?.map((exp, idx) => (
                                                <div key={idx} className="p-4 bg-slate-50 dark:bg-dark-bg/20 rounded-2xl border border-light-border dark:border-white/5">
                                                    <div className="flex justify-between font-bold text-sm">
                                                        <span className="text-light-text dark:text-dark-text">{exp.role}</span>
                                                        <span className="text-brand-500">{exp.duration}</span>
                                                    </div>
                                                    <div className="text-xs text-light-muted mt-0.5">{exp.company}</div>
                                                    <p className="text-xs text-light-muted mt-2 leading-relaxed">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Education parser */}
                                    <div>
                                        <h4 className="text-lg font-bold border-b border-light-border dark:border-white/5 pb-2 mb-4 flex items-center">
                                            <BookOpen className="w-5 h-5 mr-2 text-accent-500" /> Academic Credentials
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {result.report_data?.parser?.education?.map((edu, idx) => (
                                                <div key={idx} className="p-4 bg-slate-50 dark:bg-dark-bg/20 rounded-2xl border border-light-border dark:border-white/5">
                                                    <div className="font-bold text-sm">{edu.degree}</div>
                                                    <div className="text-xs text-light-muted mt-1">{edu.school}</div>
                                                    <div className="text-[10px] text-brand-500 font-bold mt-1">{edu.year}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Projects parser */}
                                    <div>
                                        <h4 className="text-lg font-bold border-b border-light-border dark:border-white/5 pb-2 mb-4 flex items-center">
                                            <Layers className="w-5 h-5 mr-2 text-violet-500" /> Project Achievements
                                        </h4>
                                        <div className="space-y-4">
                                            {result.report_data?.parser?.projects?.map((proj, idx) => (
                                                <div key={idx} className="p-4 bg-slate-50 dark:bg-dark-bg/20 rounded-2xl border border-light-border dark:border-white/5">
                                                    <div className="font-bold text-sm">{proj.title}</div>
                                                    <p className="text-xs text-light-muted mt-2">{proj.description}</p>
                                                    {proj.technologies && (
                                                        <div className="flex flex-wrap gap-1 mt-3">
                                                            {proj.technologies.map((t, i) => (
                                                                <span key={i} className="px-2 py-0.5 text-[10px] bg-brand-500/10 text-brand-500 border border-brand-500/20 rounded-lg">
                                                                    {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: KEYWORD CLOUD */}
                        {activeTab === 'keywords' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Side: Cloud Visualizer */}
                                <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-8 shadow-premium flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">Word Frequency Target Cloud</h3>
                                        <p className="text-xs text-light-muted mb-6">Visual map of keywords: Green represents matched elements; Purple displays missing terms.</p>
                                        
                                        <div className="flex flex-wrap gap-3 p-8 border border-light-border dark:border-white/5 bg-slate-50 dark:bg-dark-bg/30 rounded-2xl justify-center items-center min-h-[300px]">
                                            {result.report_data?.keywords?.matched?.map((word, idx) => (
                                                <span 
                                                    key={`match-${idx}`} 
                                                    className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-sm cursor-help hover:scale-105 transition-transform"
                                                    title="Match verified"
                                                >
                                                    {word}
                                                </span>
                                            ))}
                                            {result.report_data?.keywords?.missing?.map((word, idx) => (
                                                <span 
                                                    key={`miss-${idx}`} 
                                                    className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl font-bold text-sm cursor-help hover:scale-105 transition-transform animate-pulse"
                                                    title="Missing requirement"
                                                >
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Match Metrics cards */}
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center">
                                            <div className="text-3xl font-black text-emerald-500">{result.report_data?.keywords?.matched_percentage}%</div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mt-1">Matched Keywords</div>
                                        </div>
                                        <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center">
                                            <div className="text-3xl font-black text-rose-500">{result.report_data?.keywords?.missing_percentage}%</div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mt-1">Missing Keywords</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Missing, Low Frequency and suggested list */}
                                <div className="lg:col-span-1 bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-6 shadow-premium space-y-6">
                                    {/* Critical domain skills present check */}
                                    <div>
                                        <h4 className="font-bold text-sm mb-3">Domain Match Breakdown</h4>
                                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                                            {Object.entries(result.report_data?.skills_analysis || {}).map(([domain, data], i) => (
                                                <div key={i} className="p-3 bg-slate-50 dark:bg-dark-bg/20 border border-light-border dark:border-white/5 rounded-2xl text-xs">
                                                    <div className="font-bold capitalize border-b border-light-border dark:border-white/5 pb-1 mb-2 text-brand-500">
                                                        {domain.replace('_', ' ')}
                                                    </div>
                                                    <div className="space-y-2">
                                                        {data.present?.length > 0 && (
                                                            <div>
                                                                <span className="text-[10px] text-light-muted block mb-1">Present:</span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {data.present.map((skill, idx) => (
                                                                        <span key={idx} className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-bold text-[10px]">
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {data.missing?.length > 0 && (
                                                            <div>
                                                                <span className="text-[10px] text-light-muted block mb-1">Missing:</span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {data.missing.map((skill, idx) => (
                                                                        <span key={idx} className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded-md font-bold text-[10px]">
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: LINE-BY-LINE COACH */}
                        {activeTab === 'linebyline' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Side: Sentence Analyzer table */}
                                <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-8 shadow-premium space-y-6">
                                    <h3 className="text-2xl font-bold">Line-by-Line Sentence Enhancements</h3>
                                    
                                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                                        {result.report_data?.line_by_line_review?.map((line, idx) => (
                                            <div key={idx} className="p-4 border border-light-border dark:border-white/5 rounded-2xl bg-slate-50 dark:bg-dark-bg/30 relative group">
                                                <div className="text-xs text-rose-500 font-bold flex items-center mb-1">
                                                    <AlertTriangle className="w-4 h-4 mr-1 shrink-0" /> ISSUE: {line.issue}
                                                </div>
                                                <p className="text-sm font-semibold italic text-light-muted dark:text-dark-muted mb-3 border-l-2 border-slate-300 dark:border-white/10 pl-3">
                                                    "{line.original}"
                                                </p>
                                                <div className="p-3 bg-brand-500/5 border border-brand-500/10 rounded-xl">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider">AI Suggestions:</span>
                                                        <button 
                                                            onClick={() => handleCopyText(line.improved)}
                                                            className="p-1 rounded text-light-muted hover:text-brand-500 hover:bg-brand-500/10 transition-colors"
                                                            title="Copy suggestion"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-light-text dark:text-dark-text font-medium leading-relaxed">
                                                        {line.improved}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Side: Weak Words & Grammar review */}
                                <div className="lg:col-span-1 bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-6 shadow-premium space-y-6">
                                    {/* Interactive Editor click to replace weak words */}
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-bold text-sm">Action Verb Replacer</h4>
                                            <span className="text-[10px] text-brand-500 font-medium">Click to substitute</span>
                                        </div>
                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                            {result.report_data?.word_suggestions?.map((item, idx) => (
                                                <div key={idx} className="p-3 bg-slate-50 dark:bg-dark-bg/20 border border-light-border dark:border-white/5 rounded-2xl text-xs space-y-2">
                                                    <div className="flex justify-between font-bold">
                                                        <span className="text-rose-500">Weak: "{item.weak_word}"</span>
                                                        <span className="text-light-muted">Replace in draft</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.suggestions.map((strong, sIdx) => (
                                                            <button 
                                                                key={sIdx}
                                                                onClick={() => handleReplaceWord(item.weak_word, strong)}
                                                                className="px-2 py-1 rounded bg-brand-500/10 text-brand-500 font-semibold border border-brand-500/20 hover:bg-brand-500 hover:text-white transition-all text-[10px]"
                                                            >
                                                                {strong}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Interactive text container */}
                                    <div>
                                        <label className="block text-xs font-bold mb-2">Active Draft Editor</label>
                                        <textarea 
                                            value={editableResumeText}
                                            onChange={(e) => setEditableResumeText(e.target.value)}
                                            rows={6}
                                            className="input-premium font-sans text-xs w-full bg-[#0F1523] border-white/5 rounded-2xl focus:ring-1 focus:ring-brand-500 leading-relaxed"
                                        />
                                        <button 
                                            onClick={() => handleCopyText(editableResumeText)}
                                            className="btn-secondary w-full py-2 mt-2 text-xs font-bold rounded-xl flex items-center justify-center border-brand-500/10 text-brand-500 hover:bg-brand-500/5"
                                        >
                                            <Copy className="w-4 h-4 mr-2" /> Copy Active Draft
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 5: REWRITER */}
                        {activeTab === 'rewriter' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Side: Editor Variations */}
                                <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-8 shadow-premium space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                                        <h3 className="text-2xl font-bold flex items-center">
                                            <Sparkles className="w-6 h-6 mr-2 text-brand-500" />
                                            Professional Variations Builder
                                        </h3>
                                        
                                        {!result.rewritten_resumes && (
                                            <button 
                                                onClick={handleGenerateRewrite}
                                                disabled={isRewriting}
                                                className="btn-primary py-2 px-4 text-xs font-bold flex items-center rounded-xl"
                                            >
                                                {isRewriting ? (
                                                    <span className="flex items-center">
                                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                        Generating...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center">
                                                        <Sparkles className="w-4 h-4 mr-2" />
                                                        Synthesize 4 Tailored Resumes
                                                    </span>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {result.rewritten_resumes ? (
                                        <div className="space-y-6">
                                            {/* Subtab selection */}
                                            <div className="flex border-b border-light-border dark:border-white/5 font-semibold text-xs whitespace-nowrap overflow-x-auto">
                                                {['optimized', 'tailored', 'keyword_optimized', 'interview_ready'].map((variation) => (
                                                    <button
                                                        key={variation}
                                                        onClick={() => setActiveRewriteTab(variation)}
                                                        className={`px-4 py-3 border-b-2 capitalize transition-all ${
                                                            activeRewriteTab === variation 
                                                            ? 'border-brand-500 text-brand-500' 
                                                            : 'border-transparent text-light-muted hover:text-light-text dark:hover:text-dark-text'
                                                        }`}
                                                    >
                                                        {variation.replace('_', ' ')}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Render parsed markdown text */}
                                            <div className="p-6 bg-slate-50 dark:bg-dark-bg/30 border border-light-border dark:border-white/5 rounded-2xl max-h-[500px] overflow-y-auto relative font-sans leading-relaxed text-sm select-text">
                                                <button 
                                                    onClick={() => handleCopyText(result.rewritten_resumes[activeRewriteTab])}
                                                    className="absolute top-4 right-4 p-2 bg-brand-500/10 hover:bg-brand-500 hover:text-white text-brand-500 rounded-xl transition-all"
                                                    title="Copy Resume Content"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <div className="prose dark:prose-invert max-w-none">
                                                    {renderMarkdown(result.rewritten_resumes[activeRewriteTab])}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-12 border border-light-border dark:border-white/5 bg-slate-50 dark:bg-dark-bg/20 rounded-3xl text-center text-light-muted">
                                            <Sparkles className="w-12 h-12 text-brand-500 mx-auto mb-4 animate-float" />
                                            <h4 className="font-bold text-sm mb-2 text-light-text dark:text-dark-text">Synthesize Optimized Variations</h4>
                                            <p className="text-xs max-w-sm mx-auto mb-6">Use Gemini to generate customized resumes tailored directly to the Job Description, focusing on Keywords, ATS scores, and Interview alignment.</p>
                                            <button 
                                                onClick={handleGenerateRewrite}
                                                disabled={isRewriting}
                                                className="btn-primary rounded-xl"
                                            >
                                                {isRewriting ? "Building and Tailoring..." : "Generate AI Resumes"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Summary Tailor & bullet enhancement tools */}
                                <div className="lg:col-span-1 bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-6 shadow-premium space-y-6">
                                    {/* Tailored Professional Summary Generator */}
                                    <div>
                                        <h4 className="font-bold text-sm mb-2">Tailored Summary Generator</h4>
                                        <div className="p-4 bg-slate-50 dark:bg-dark-bg/20 border border-light-border dark:border-white/5 rounded-2xl text-xs space-y-4">
                                            {result.report_data?.professional_summary?.suggested ? (
                                                <>
                                                    <p className="leading-relaxed text-light-muted dark:text-dark-muted select-all font-medium">
                                                        {result.report_data.professional_summary.suggested}
                                                    </p>
                                                    <button 
                                                        onClick={() => handleCopyText(result.report_data.professional_summary.suggested)}
                                                        className="btn-secondary w-full py-2 text-xs font-bold rounded-xl flex items-center justify-center border-brand-500/10 text-brand-500 hover:bg-brand-500/5"
                                                    >
                                                        <Copy className="w-4 h-4 mr-2" /> Copy AI Summary
                                                    </button>
                                                </>
                                            ) : (
                                                <p className="text-light-muted">No tailored summary available for this profile.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Project Enhancements modules */}
                                    <div>
                                        <h4 className="font-bold text-sm mb-3">Project Descriptions Enhancer</h4>
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                            {result.report_data?.project_enhancements?.map((proj, idx) => (
                                                <div key={idx} className="p-3 bg-slate-50 dark:bg-dark-bg/20 border border-light-border dark:border-white/5 rounded-2xl text-xs space-y-3">
                                                    <div className="font-bold text-brand-500">Project: "{proj.original_title}"</div>
                                                    <div>
                                                        <span className="text-[10px] text-light-muted block mb-1">Enhanced AI Version:</span>
                                                        <p className="leading-relaxed italic text-light-muted select-all pl-2 border-l border-brand-500/30">
                                                            {proj.enhanced_description}
                                                        </p>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleCopyText(proj.enhanced_description)}
                                                        className="btn-secondary w-full py-1 text-[10px] font-bold rounded-lg flex items-center justify-center border-brand-500/10 text-brand-500 hover:bg-brand-500/5"
                                                    >
                                                        <Copy className="w-3.5 h-3.5 mr-2" /> Copy Enhanced Bullet
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 6: COMPARE REPORTS */}
                        {activeTab === 'compare' && (
                            <div className="bg-white dark:bg-dark-card border border-light-border dark:border-white/5 rounded-3xl p-8 shadow-premium space-y-6">
                                <h3 className="text-2xl font-bold">Compare Historical Appraisals</h3>
                                <p className="text-xs text-light-muted mb-4">Select two previous resume reports from your log to compare differences in ATS Scores, keywords, and sections.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Selector A */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold">Report A</label>
                                        <select 
                                            onChange={(e) => setComparisonReportA(history.find(h => h.id === parseInt(e.target.value)))}
                                            className="input-premium py-2.5 text-xs"
                                        >
                                            <option value="">Select Report...</option>
                                            {history.map((h) => (
                                                <option key={h.id} value={h.id}>{h.resume_name} ({h.target_role}) - {h.ats_score}%</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Selector B */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold">Report B</label>
                                        <select 
                                            onChange={(e) => setComparisonReportB(history.find(h => h.id === parseInt(e.target.value)))}
                                            className="input-premium py-2.5 text-xs"
                                        >
                                            <option value="">Select Report...</option>
                                            {history.map((h) => (
                                                <option key={h.id} value={h.id}>{h.resume_name} ({h.target_role}) - {h.ats_score}%</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {comparisonReportA && comparisonReportB && (
                                    <div className="mt-8 border-t border-light-border dark:border-white/5 pt-6 grid grid-cols-3 gap-4 text-center items-center text-sm">
                                        <div className="font-bold text-left text-light-muted">Metric Comparison</div>
                                        <div className="p-3 bg-brand-500/5 rounded-2xl font-bold border border-brand-500/10">Report A: {comparisonReportA.resume_name}</div>
                                        <div className="p-3 bg-accent-500/5 rounded-2xl font-bold border border-accent-500/10">Report B: {comparisonReportB.resume_name}</div>
                                        
                                        <div className="font-bold text-left">Overall Score</div>
                                        <div className="text-2xl font-black text-brand-500">{comparisonReportA.ats_score}%</div>
                                        <div className="text-2xl font-black text-accent-500">{comparisonReportB.ats_score}%</div>

                                        <div className="font-bold text-left">Target Role</div>
                                        <div className="font-semibold text-xs text-light-muted">{comparisonReportA.target_role}</div>
                                        <div className="font-semibold text-xs text-light-muted">{comparisonReportB.target_role}</div>

                                        <div className="font-bold text-left">Generated Date</div>
                                        <div className="text-xs font-medium">{new Date(comparisonReportA.created_at).toLocaleDateString()}</div>
                                        <div className="text-xs font-medium">{new Date(comparisonReportB.created_at).toLocaleDateString()}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
