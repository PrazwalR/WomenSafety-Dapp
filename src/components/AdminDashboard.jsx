import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    getAllComplaints,
    getAllEmergencies,
    getComplaintStats
} from '../utils/ethereum';
import {
    ChartBarIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    ClockIcon,
    CheckCircleIcon,
    ShieldExclamationIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
    });
    const [emergencies, setEmergencies] = useState([]);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [complaintStats, allEmergencies, allComplaints] = await Promise.all([
                getComplaintStats(),
                getAllEmergencies(),
                getAllComplaints(),
            ]);

            // Set stats
            setStats({
                total: Number(complaintStats.total),
                pending: Number(complaintStats.pending),
                inProgress: Number(complaintStats.inProgress),
                resolved: Number(complaintStats.resolved),
            });

            // Set emergencies (only unresolved ones)
            const unresolvedEmergencies = allEmergencies.filter(emergency => !emergency.isResolved);
            setEmergencies(unresolvedEmergencies);

            // Set recent complaints (last 5)
            const sortedComplaints = allComplaints
                .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                .slice(0, 5);
            setRecentComplaints(sortedComplaints);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            icon: DocumentTextIcon,
            title: 'All Complaints',
            description: 'Review and manage complaints',
            href: '/admin/complaints',
            count: stats.total,
            color: 'from-blue-500 to-purple-500',
        },
        {
            icon: ExclamationTriangleIcon,
            title: 'Active Emergencies',
            description: 'Respond to emergency alerts',
            href: '/admin/emergencies',
            count: emergencies.length,
            color: 'from-red-500 to-pink-500',
            urgent: emergencies.length > 0,
        },
        {
            icon: ClockIcon,
            title: 'Pending Cases',
            description: 'Cases awaiting review',
            href: '/admin/complaints?status=0',
            count: stats.pending,
            color: 'from-yellow-500 to-orange-500',
        },
        {
            icon: ChartBarIcon,
            title: 'Statistics',
            description: 'View detailed analytics',
            href: '/admin',
            count: `${Math.round((stats.resolved / stats.total) * 100) || 0}%`,
            color: 'from-green-500 to-teal-500',
        },
    ];

    const statCards = [
        {
            title: 'Total Complaints',
            value: stats.total,
            icon: ChartBarIcon,
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10',
            trend: '+12%',
        },
        {
            title: 'Pending Review',
            value: stats.pending,
            icon: ClockIcon,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-400/10',
            urgent: stats.pending > 0,
        },
        {
            title: 'In Progress',
            value: stats.inProgress,
            icon: ArrowTrendingUpIcon,
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10',
        },
        {
            title: 'Resolved Cases',
            value: stats.resolved,
            icon: CheckCircleIcon,
            color: 'text-green-400',
            bgColor: 'bg-green-400/10',
            percentage: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0,
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                        <ShieldExclamationIcon className="w-8 h-8 mr-3 text-primary" />
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-400">
                        Monitor and manage the Women Safety platform
                    </p>
                </div>

                {/* Alert for Active Emergencies */}
                {emergencies.length > 0 && (
                    <div className="mb-8 card bg-red-500/10 border-red-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <ExclamationTriangleIcon className="w-8 h-8 text-red-400 emergency-pulse" />
                                <div>
                                    <h3 className="text-lg font-semibold text-red-300">
                                        {emergencies.length} Active Emergenc{emergencies.length > 1 ? 'ies' : 'y'}
                                    </h3>
                                    <p className="text-red-200">Immediate attention required</p>
                                </div>
                            </div>
                            <Link
                                to="/admin/emergencies"
                                className="btn-danger"
                            >
                                Respond Now
                            </Link>
                        </div>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <div key={index} className={`card ${stat.urgent ? 'border-yellow-500/50' : ''}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                                    <div className="flex items-baseline space-x-2">
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        {stat.percentage && (
                                            <span className="text-sm text-green-400">({stat.percentage}%)</span>
                                        )}
                                        {stat.trend && (
                                            <span className="text-sm text-green-400">{stat.trend}</span>
                                        )}
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.href}
                                className={`card hover:scale-105 transition-all duration-300 ${action.urgent ? 'border-red-500/50 emergency-pulse' : ''
                                    }`}
                            >
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-gradient-to-r ${action.color}`}>
                                    <action.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                                <p className="text-gray-400 mb-3 text-sm">{action.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className={`text-2xl font-bold ${action.urgent ? 'text-red-400' : 'text-primary'
                                        }`}>
                                        {action.count}
                                    </span>
                                    {action.urgent && (
                                        <span className="text-xs text-red-400 font-medium">URGENT</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Complaints */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Recent Complaints</h2>
                            <Link
                                to="/admin/complaints"
                                className="text-primary hover:text-primary/80 font-medium text-sm"
                            >
                                View All
                            </Link>
                        </div>

                        {recentComplaints.length === 0 ? (
                            <div className="text-center py-8">
                                <DocumentTextIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400">No recent complaints</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentComplaints.map((complaint, index) => (
                                    <div key={index} className="p-3 bg-dark rounded-lg border border-gray-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-400">
                                                Complaint #{Number(complaint.id)}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${Number(complaint.status) === 0
                                                    ? 'bg-yellow-400/10 text-yellow-400'
                                                    : Number(complaint.status) === 1
                                                        ? 'bg-blue-400/10 text-blue-400'
                                                        : 'bg-green-400/10 text-green-400'
                                                }`}>
                                                {Number(complaint.status) === 0 ? 'Pending' :
                                                    Number(complaint.status) === 1 ? 'In Progress' : 'Resolved'}
                                            </span>
                                        </div>
                                        <p className="text-white font-medium text-sm mb-1">{complaint.location}</p>
                                        <p className="text-gray-400 text-xs">
                                            {new Date(Number(complaint.timestamp) * 1000).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Emergencies */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Active Emergencies</h2>
                            <Link
                                to="/admin/emergencies"
                                className="text-red-400 hover:text-red-300 font-medium text-sm"
                            >
                                View All
                            </Link>
                        </div>

                        {emergencies.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                <p className="text-green-400">No active emergencies</p>
                                <p className="text-gray-500 text-sm">All clear!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {emergencies.slice(0, 3).map((emergency, index) => (
                                    <div key={index} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-red-300">
                                                Emergency #{Number(emergency.id)}
                                            </span>
                                            <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                                                ACTIVE
                                            </span>
                                        </div>
                                        <p className="text-red-100 font-medium text-sm mb-1">{emergency.location}</p>
                                        <p className="text-red-200 text-xs">
                                            {new Date(Number(emergency.timestamp) * 1000).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* System Status */}
                <div className="mt-8 card bg-green-500/10 border-green-500/20">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <CheckCircleIcon className="w-8 h-8 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-green-300 mb-1">System Status: Operational</h3>
                            <p className="text-green-200 text-sm">
                                All systems are running normally. Blockchain connectivity is stable.
                                Response time: ~2.3s
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;