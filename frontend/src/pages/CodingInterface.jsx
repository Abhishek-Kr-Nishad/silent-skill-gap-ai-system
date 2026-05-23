import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../components/ThemeProvider';
import { Play, Send, Settings, Clock, Server, CheckCircle2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

export default function CodingInterface() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('def twoSum(nums, target):\n    # Write your logic here\n    pass');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    // Mock handlers
    const handleRun = () => {
        setIsRunning(true);
        setTimeout(() => {
            setOutput('Test Case 1: Passed\nTest Case 2: Passed\nExecution Time: 45ms');
            setIsRunning(false);
        }, 1500);
    };

    const handleSubmit = () => {
        setIsRunning(true);
        setTimeout(() => {
            setOutput('Submission Successful!\nAll 15 hidden test cases passed.\nMemory usage: 14MB (Top 95%)');
            setIsRunning(false);

            // Simulate going to report after short delay
            setTimeout(() => {
                navigate('/student/skill-gap-report');
            }, 3000);
        }, 2000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-light-bg dark:bg-[#0d1117] overflow-hidden">

            {/* Top Toolbar */}
            <header className="h-14 border-b border-light-border dark:border-[#30363d] bg-white dark:bg-[#161b22] flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 transition-colors">
                <div className="flex items-center space-x-4">
                    <Link to="/student" className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#21262d] text-slate-500 dark:text-slate-400 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="md:border-l md:border-slate-200 md:dark:border-[#30363d] md:pl-4">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Two Sum (#1)</h2>
                        <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Solved
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="text-sm border border-light-border dark:border-[#30363d] rounded-md px-3 py-1.5 bg-slate-50 dark:bg-[#0d1117] text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
                    >
                        <option value="python">Python 3</option>
                        <option value="cpp">C++ 17</option>
                        <option value="java">Java 11</option>
                    </select>
                    <button className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#21262d] text-slate-500 dark:text-slate-400 transition-colors">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main Split Interface */}
            <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">

                {/* Left Panel: Problem Statement */}
                <div className="w-full lg:w-[40%] flex flex-col border-r border-light-border dark:border-[#30363d] bg-white dark:bg-[#0d1117] z-0 transition-colors">
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="mb-6 flex space-x-2">
                            <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-md">Easy</span>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-[#21262d] text-slate-600 dark:text-slate-300 text-xs rounded-md flex items-center transition-colors"><Clock className="w-3 h-3 mr-1" /> 15 mins</span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors">Problem Statement</h3>
                        <div className="prose prose-sm dark:prose-invert prose-slate max-w-none text-slate-600 dark:text-slate-300 transition-colors">
                            <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
                            <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
                            <p>You can return the answer in any order.</p>

                            <div className="mt-8 mb-4">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2 transition-colors">Example 1:</h4>
                                <div className="bg-slate-50 dark:bg-[#161b22] p-4 rounded-lg font-mono text-sm border border-slate-200 dark:border-[#30363d] transition-colors">
                                    <span className="text-slate-500 dark:text-[#8b949e]">Input:</span> nums = [2,7,11,15], target = 9<br />
                                    <span className="text-slate-500 dark:text-[#8b949e]">Output:</span> [0,1]<br />
                                    <span className="text-slate-500 dark:text-[#8b949e]">Explanation:</span> Because nums[0] + nums[1] == 9, we return [0, 1].
                                </div>
                            </div>

                            <div className="mt-8">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2 transition-colors">Constraints:</h4>
                                <ul className="list-disc pl-5 mt-2 space-y-1 font-mono text-sm bg-slate-50 dark:bg-[#161b22] p-4 rounded-lg transition-colors border border-transparent dark:border-[#30363d]">
                                    <li><code>2 ≤ nums.length ≤ 10^4</code></li>
                                    <li><code>-10^9 ≤ nums[i] ≤ 10^9</code></li>
                                    <li><code>-10^9 ≤ target ≤ 10^9</code></li>
                                    <li><strong>Only one valid answer exists.</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Editor & Controls */}
                <div className="w-full lg:w-[60%] flex flex-col h-full bg-[#1e1e1e] dark:bg-[#0d1117] transition-colors">

                    {/* Editor Area */}
                    <div className="flex-grow relative border-b border-[#333] dark:border-[#30363d] transition-colors">
                        <Editor
                            height="100%"
                            language={language}
                            theme={isDark ? "vs-dark" : "light"}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "JetBrains Mono, 'Courier New', monospace",
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                                padding: { top: 16 },
                                scrollbar: {
                                    verticalScrollbarSize: 8,
                                    horizontalScrollbarSize: 8,
                                }
                            }}
                        />
                    </div>

                    {/* Action Bar & Terminal Output */}
                    <div className="h-1/3 min-h-[200px] flex flex-col bg-white dark:bg-[#0d1117] transition-colors z-10">

                        {/* Toolbar */}
                        <div className="h-12 border-b border-light-border dark:border-[#30363d] bg-slate-50 dark:bg-[#161b22] px-4 flex items-center justify-between shrink-0 transition-colors">
                            <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                                <Server className="w-4 h-4 mr-2" />
                                Console Output
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleRun}
                                    disabled={isRunning}
                                    className="px-4 py-1.5 rounded-md text-sm font-medium bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-[#21262d] dark:hover:bg-[#30363d] dark:text-slate-200 transition-colors flex items-center disabled:opacity-50"
                                >
                                    <Play className="w-3.5 h-3.5 mr-1.5" />
                                    Run Code
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isRunning}
                                    className="px-4 py-1.5 rounded-md text-sm font-medium bg-primary-500 hover:bg-primary-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5 mr-1.5" />
                                    Submit
                                </button>
                            </div>
                        </div>

                        {/* Output Window */}
                        <div className="flex-grow p-4 overflow-y-auto bg-white dark:bg-[#0d1117] font-mono text-sm shadow-inner text-slate-700 dark:text-slate-300 custom-scrollbar transition-colors">
                            <AnimatePresence mode="wait">
                                {isRunning ? (
                                    <motion.div
                                        key="running"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center h-full space-y-4 text-slate-500 dark:text-[#8b949e]"
                                    >
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                            <Settings className="w-6 h-6" />
                                        </motion.div>
                                        <span>Executing in isolated sandbox environment...</span>
                                    </motion.div>
                                ) : output ? (
                                    <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <p className="whitespace-pre-wrap">{output}</p>
                                    </motion.div>
                                ) : (
                                    <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <p className="text-slate-400 dark:text-[#8b949e] italic">Run your code to see the test case evaluation here.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
