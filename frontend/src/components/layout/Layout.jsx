import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300">
            <Navbar />
            <main className="flex-1 flex flex-col w-full relative">
                <div className="w-full absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                <div className="relative z-10 flex-1 w-full mx-auto animate-fade-in">
                    {children}
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-light-border dark:border-dark-border bg-white dark:bg-dark-bg transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                        <p>&copy; 2026 Silent Skill Gap AI. All rights reserved.</p>
                        <div className="flex space-x-6">
                            <a href="#" className="hover:text-primary-500 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-primary-500 transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
