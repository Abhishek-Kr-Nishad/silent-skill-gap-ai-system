import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Clock, Video, Filter, ArrowRight } from 'lucide-react';

// Use placeholders from unspash for visual appeal
const allCourses = [
    { id: 1, title: 'Advanced Python Architecture', instructor: 'Dr. Jane Smith', level: 'Advanced', price: '$49', rating: 4.8, students: '1.2k', image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?auto=format&fit=crop&q=80&w=400', tags: ['Python', 'Architecture'] },
    { id: 2, title: 'Mastering System Design', instructor: 'John Doe', level: 'Intermediate', price: 'Free', rating: 4.9, students: '3.4k', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400', tags: ['Architecture', 'Scaling'] },
    { id: 3, title: 'Data Structures Deep Dive', instructor: 'Alice Williams', level: 'Intermediate', price: '$29', rating: 4.7, students: '850', image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=400', tags: ['C++', 'Algorithms'] },
    { id: 4, title: 'Intro to Machine Learning', instructor: 'Dr. Robert Brown', level: 'Beginner', price: '$99', rating: 4.5, students: '5.1k', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400', tags: ['Python', 'AI'] },
    { id: 5, title: 'React Performance Tuning', instructor: 'Evan You', level: 'Advanced', price: '$59', rating: 4.9, students: '2.1k', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400', tags: ['React', 'Frontend'] },
    { id: 6, title: 'Backend with Django & DRF', instructor: 'Simeon Thomas', level: 'Intermediate', price: '$39', rating: 4.6, students: '940', image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=400', tags: ['Python', 'Django'] },
];

export default function Courses() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    const filteredCourses = allCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = activeFilter === 'All' || course.level === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-24 pb-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
                    <div className="max-w-2xl">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-extrabold text-light-text dark:text-dark-text tracking-tight mb-4"
                        >
                            Explore <span className="text-gradient">Premium Courses</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                            className="text-lg text-light-muted dark:text-dark-muted"
                        >
                            Master the skills identified by your AI diagnostic gap report. Curated paths designed to accelerate graduation to senior engineering roles.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="w-full md:w-96 relative group"
                    >
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-light-muted dark:text-dark-muted group-focus-within:text-brand-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="input-premium pl-12 h-14 text-lg"
                            placeholder="Search algorithms, frameworks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                </div>

                {/* Filter Chips */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="flex items-center space-x-3 overflow-x-auto pb-6 mb-8 scrollbar-hide"
                >
                    <div className="flex items-center text-sm font-bold text-light-muted dark:text-dark-muted mr-2 uppercase tracking-wider">
                        <Filter className="w-4 h-4 mr-2" /> Level
                    </div>
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${activeFilter === f
                                    ? 'bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-glow translate-y-[-2px]'
                                    : 'bg-white text-light-muted border border-light-border hover:border-brand-300 hover:text-brand-600 dark:bg-dark-card dark:border-white/10 dark:text-dark-muted dark:hover:border-white/20 dark:hover:text-white dark:hover:bg-white/5'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </motion.div>

                {/* Course Grid */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredCourses.map((course, i) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                key={course.id}
                                className="premium-card p-0 overflow-hidden group flex flex-col h-full cursor-pointer relative"
                            >
                                {/* Image Header */}
                                <div className="relative h-56 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/90 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-100 opacity-80" />
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
                                    />

                                    {/* Floating Badges */}
                                    <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                                        {course.tags.map(tag => (
                                            <span key={tag} className="px-2.5 py-1 bg-black/40 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="absolute top-4 right-4 z-20">
                                        <span className={`px-3 py-1 backdrop-blur-md rounded-full text-xs font-bold shadow-lg border border-white/20 ${course.level === 'Beginner' ? 'bg-emerald-500/80 text-white' :
                                                course.level === 'Intermediate' ? 'bg-amber-500/80 text-white' :
                                                    'bg-rose-500/80 text-white'
                                            }`}>
                                            {course.level}
                                        </span>
                                    </div>

                                    {/* Rating positioned at bottom of image */}
                                    <div className="absolute bottom-4 left-4 z-20 flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1">
                                        <Star className="w-3.5 h-3.5 text-amber-400 mr-1.5 fill-current" />
                                        <span className="font-bold text-white text-sm">{course.rating}</span>
                                        <span className="text-white/60 text-xs ml-1.5 font-medium">({course.students})</span>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="p-6 flex-grow flex flex-col justify-between bg-white dark:bg-dark-card transition-colors">
                                    <div>
                                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2 line-clamp-2 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-500 group-hover:to-accent-500 transition-all duration-300">
                                            {course.title}
                                        </h3>

                                        <p className="text-sm font-medium text-light-muted dark:text-dark-muted mb-6 flex items-center">
                                            <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-400 to-accent-400 mr-2 flex items-center justify-center text-white text-[10px] font-bold">
                                                {course.instructor.charAt(0)}
                                            </span>
                                            {course.instructor}
                                        </p>
                                    </div>

                                    <div className="border-t border-light-border dark:border-white/10 pt-5 mt-auto flex items-center justify-between group-hover:border-brand-500/30 transition-colors">
                                        <div className="flex items-center text-sm font-medium text-light-muted dark:text-dark-muted">
                                            <Clock className="w-4 h-4 mr-1.5 text-brand-500" />
                                            12h 45m
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <span className={`text-xl font-black ${course.price === 'Free' ? 'text-emerald-500' : 'text-light-text dark:text-dark-text'}`}>
                                                {course.price}
                                            </span>

                                            {/* Hidden hover arrow */}
                                            <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-white/5 border border-brand-100 dark:border-white/10 flex items-center justify-center text-brand-500 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredCourses.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-32 premium-card mt-8"
                    >
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto border border-light-border dark:border-white/10 mb-6">
                            <Search className="w-8 h-8 text-light-muted dark:text-dark-muted" />
                        </div>
                        <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">No courses found</h3>
                        <p className="text-light-muted dark:text-dark-muted text-lg mb-6">Try adjusting your filters or search terms.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveFilter('All'); }}
                            className="btn-secondary"
                        >
                            Clear all filters
                        </button>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
