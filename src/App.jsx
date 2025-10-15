import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import Navbar from './components/Navbar';
import Home from './components/Home';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ComplaintForm from './components/ComplaintForm';
import TrustedContacts from './components/TrustedContacts';
import EmergencySOS from './components/EmergencySOS';
import ViewReports from './components/ViewReports';
import AdminReports from './components/AdminReports';
import AdminEmergencies from './components/AdminEmergencies';
import './styles/globals.css';

// Protected Route Component for User Features
const ProtectedUserRoute = ({ children }) => {
    const { isConnected, isRegistered, initialLoading } = useWeb3();

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isConnected) {
        return <Navigate to="/" replace />;
    }

    if (!isRegistered) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Protected Route Component for Admin Features
const ProtectedAdminRoute = ({ children }) => {
    const { isConnected, isAdmin, initialLoading } = useWeb3();

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isConnected || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Main App Component
const AppRoutes = () => {
    return (
        <div className="min-h-screen bg-dark text-white">
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />

                {/* Protected User Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedUserRoute>
                            <UserDashboard />
                        </ProtectedUserRoute>
                    }
                />
                <Route
                    path="/complaint"
                    element={
                        <ProtectedUserRoute>
                            <ComplaintForm />
                        </ProtectedUserRoute>
                    }
                />
                <Route
                    path="/contacts"
                    element={
                        <ProtectedUserRoute>
                            <TrustedContacts />
                        </ProtectedUserRoute>
                    }
                />
                <Route
                    path="/emergency"
                    element={
                        <ProtectedUserRoute>
                            <EmergencySOS />
                        </ProtectedUserRoute>
                    }
                />
                <Route
                    path="/reports"
                    element={
                        <ProtectedUserRoute>
                            <ViewReports />
                        </ProtectedUserRoute>
                    }
                />

                {/* Protected Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedAdminRoute>
                            <AdminDashboard />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/complaints"
                    element={
                        <ProtectedAdminRoute>
                            <AdminReports />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/emergencies"
                    element={
                        <ProtectedAdminRoute>
                            <AdminEmergencies />
                        </ProtectedAdminRoute>
                    }
                />

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1f2937',
                        color: '#ffffff',
                        border: '1px solid #374151',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#ffffff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#ffffff',
                        },
                    },
                }}
            />
        </div>
    );
};

// Root App Component
function App() {
    return (
        <Web3Provider>
            <Router>
                <AppRoutes />
            </Router>
        </Web3Provider>
    );
}

export default App;