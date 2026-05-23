import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, Code2, Target, TrendingUp, Sparkles, ArrowRight, PlayCircle } from 'lucide-react';

export default function Home() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
    };

    return (
        <div className="overflow-hidden bg-light-bg dark:bg-dark-bg transition-colors duration-300">

            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-screen overflow-hidden -z-10 bg-light-bg dark:bg-dark-bg">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 dark:bg-brand-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-500/20 dark:bg-accent-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex text-center items-center justify-center -mt-16 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-4xl mx-auto space-y-12"
                    initial="hidden" animate="show" variants={container}
                >
                    {/* Badge */}
                    <motion.div variants={item} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full premium-card">
                        <Sparkles className="w-4 h-4 text-accent-500" />
                        <span className="text-sm font-semibold text-light-text dark:text-dark-text">The Future of AI-Driven Coding EdTech</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.div variants={item} className="space-y-6">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-light-text dark:text-dark-text leading-[1.1]">
                            Bridge Your <span className="text-gradient hover:blur-sm transition-all duration-300">Skill Gap</span>
                            <br />With AI Precision
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-light-muted dark:text-dark-muted leading-relaxed">
                            Identify your weaknesses instantly, practice targeted coding exercises, and let our ML engine guide you to senior-level mastery.
                        </p>
                    </motion.div>

                    {/* CTAs */}
                    <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link to="/courses" className="btn-primary w-full sm:w-auto text-lg flex items-center justify-center group">
                            Explore Courses
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/register" className="btn-secondary w-full sm:w-auto text-lg flex items-center justify-center group">
                            <PlayCircle className="mr-2 w-5 h-5 text-brand-500 group-hover:scale-110 transition-transform" />
                            Take Free Diagnostic
                        </Link>
                    </motion.div>

                    {/* Social Proof */}
                    <motion.div variants={item} className="pt-16 border-t border-light-border dark:border-white/10 mt-16 flex flex-col items-center">
                        <p className="text-sm font-semibold text-light-muted dark:text-dark-muted mb-6 uppercase tracking-wider">Trusted by engineers from</p>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Fake logos for premium effect */}
                            {['Google', 'Meta', 'Amazon', 'Netflix', 'Stripe'].map((company, i) => (
                                <div key={i} className="text-xl font-black tracking-tighter text-slate-800 dark:text-white">
                                    {company}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <h2 className="text-sm font-bold text-brand-500 uppercase tracking-widest mb-3">Core Platform Capabilities</h2>
                        <h3 className="text-4xl font-extrabold text-light-text dark:text-dark-text mb-6">Built to accelerate your career</h3>
                        <p className="text-light-muted dark:text-dark-muted text-lg">Stop guessing what to learn next. Let data drive your technical growth.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Brain className="w-8 h-8 text-brand-500" />,
                                title: 'AI Diagnostic Engine',
                                desc: 'Our proprietary ML models analyze your coding patterns to identify exact knowledge gaps down to specific algorithm categories.'
                            },
                            {
                                icon: <Code2 className="w-8 h-8 text-accent-500" />,
                                title: 'HackerRank-Style Sandbox',
                                desc: 'Write, run, and evaluate code in our secure, isolated Monaco-powered IDE supporting Python, Java, and C++.'
                            },
                            {
                                icon: <Target className="w-8 h-8 text-emerald-500" />,
                                title: 'Personalized Curriculums',
                                desc: 'Receive dynamic course and exercise recommendations that adapt in real-time as your skills improve.'
                            },
                            {
                                icon: <TrendingUp className="w-8 h-8 text-rose-500" />,
                                title: 'SHAP Explainability',
                                desc: 'Understand exactly WHY the AI generated your gap report with visual horizontal bar charts analyzing your metrics.'
                            },
                            {
                                icon: <Sparkles className="w-8 h-8 text-amber-500" />,
                                title: 'Role-Based Ecosystem',
                                desc: 'Dedicated interfaces for Students to learn, Teachers to analyze class cohorts, and Admins to manage the platform.'
                            },
                            {
                                icon: <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" className="w-8 h-8 filter grayscale" alt="React" />,
                                title: 'Modern Tech Stack',
                                desc: 'Built with React, Tailwind, Framer Motion, and Django. Ensuring a lightning-fast, production-ready experience.'
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="premium-card p-8 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">{feature.title}</h4>
                                <p className="text-light-muted dark:text-dark-muted leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </section>

            {/* Metrics Section */}
            <section className="py-24 bg-gradient-to-b from-transparent to-brand-50/50 dark:to-brand-900/10 border-t border-light-border dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { value: '250K+', label: 'Lines Evaluated' },
                            { value: '45+', label: 'Algorithm Tropes' },
                            { value: '98%', label: 'Prediction Accuracy' },
                            { value: '12ms', label: 'Sandbox Cold Start' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 200, delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-light-text to-light-muted dark:from-white dark:to-dark-muted mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm md:text-base font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
