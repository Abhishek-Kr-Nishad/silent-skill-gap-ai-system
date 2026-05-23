import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CodingInterface from './pages/CodingInterface';
import SkillGapReport from './pages/SkillGapReport';

import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import CodingTests from './pages/CodingTests';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import AiAssistant from './pages/AiAssistant';
import InterviewPrep from './pages/InterviewPrep';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', backgroundColor: '#fee' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
    const userRole = 'STUDENT'; // ADMIN, TEACHER, STUDENT

    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/courses" element={<Courses />} />

                                {/* Role-based Dashboards */}
                                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                                <Route path="/teacher" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
                                <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />

                                {/* specific features */}
                                <Route path="/student/coding-exam/:id" element={<ProtectedRoute><CodingInterface /></ProtectedRoute>} />
                                <Route path="/student/skill-gap-report" element={<ProtectedRoute><SkillGapReport /></ProtectedRoute>} />

                                {/* New Modules */}
                                <Route path="/problems" element={<Problems />} />
                                <Route path="/problems/:id" element={<ProblemDetail />} />
                                <Route path="/coding-tests" element={<ProtectedRoute><CodingTests /></ProtectedRoute>} />
                                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                                <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
                                <Route path="/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
                            </Routes>
                        </Layout>
                    </BrowserRouter>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
