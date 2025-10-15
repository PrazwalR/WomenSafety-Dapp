import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { getUserComplaints, getTrustedContacts } from '../utils/ethereum';
import {
    DocumentTextIcon,
    UserGroupIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    PlusIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { COMPLAINT_STATUS, SEVERITY_LEVELS } from '../utils/constants';

const UserDashboard = () => {
    const { account, getFormattedAddress } = useWeb3();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalComplaints: 0,
        pendingComplaints: 0,
        resolvedComplaints: 0,
        contactsCount: 0,
    });

    useEffect(() => {
        if (account) {
            loadUserData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account]);

    const loadUserData = useCallback(async () => {
        try {
            setLoading(true);
            const [userComplaints, contacts] = await Promise.all([
                getUserComplaints(),
                getTrustedContacts(account),
            ]);

            setComplaints(userComplaints);

            // Calculate stats
            const pendingCount = userComplaints.filter(c => Number(c.status) === 0).length;
            const resolvedCount = userComplaints.filter(c => Number(c.status) === 2).length;

            setStats({
                totalComplaints: userComplaints.length,
                pendingComplaints: pendingCount,
                resolvedComplaints: resolvedCount,
                contactsCount: contacts.length,
            });
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    }, [account]);

    const quickActions = [
        {
            icon: DocumentTextIcon,
            title: 'File New Complaint',
            description: 'Report an incident securely',
            href: '/complaint',
            color: 'from-blue-500 to-purple-500',
            buttonText: 'File Complaint',
        },
        {
            icon: UserGroupIcon,
            title: 'Manage Contacts',
            description: 'Add or remove trusted contacts',
            href: '/contacts',
            color: 'from-green-500 to-blue-500',
            buttonText: 'Manage Contacts',
        },
        {
            icon: ExclamationTriangleIcon,
            title: 'Emergency SOS',
            description: 'Send immediate alert',
            href: '/emergency',
            color: 'from-red-500 to-pink-500',
            buttonText: 'Emergency SOS',
            emergency: true,
        },
        {
            icon: EyeIcon,
            title: 'View Reports',
            description: 'Check complaint status',
            href: '/reports',
            color: 'from-purple-500 to-pink-500',
            buttonText: 'View Reports',
        },
    ];

    const statCards = [
        {
            title: 'Total Complaints',
            value: stats.totalComplaints,
            icon: ChartBarIcon,
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10',
        },
        {
            title: 'Pending Cases',
            value: stats.pendingComplaints,
            icon: ExclamationTriangleIcon,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-400/10',
        },
        {
            title: 'Resolved Cases',
            value: stats.resolvedComplaints,
            icon: DocumentTextIcon,
            color: 'text-green-400',
            bgColor: 'bg-green-400/10',
        },
        {
            title: 'Trusted Contacts',
            value: `${stats.contactsCount}/5`,
            icon: UserGroupIcon,
            color: 'text-purple-400',
            bgColor: 'bg-purple-400/10',
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back!
                    </h1>
                    <p className="text-gray-400">
                        Account: <span className="text-white font-mono">{getFormattedAddress()}</span>
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <div key={index} className="card">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">{stat.title}</p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
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
                            <div key={index} className="card hover:scale-105 transition-transform duration-300">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-gradient-to-r ${action.color}`}>
                                    <action.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                                <p className="text-gray-400 mb-4 text-sm">{action.description}</p>
                                <Link
                                    to={action.href}
                                    className={`inline-flex items-center justify-center w-full py-2 px-4 rounded-lg font-medium transition-colors ${action.emergency
                                            ? 'bg-emergency hover:bg-red-600 text-white emergency-pulse'
                                            : 'bg-primary hover:bg-primary/80 text-white'
                                        }`}
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    {action.buttonText}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Complaints */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Recent Complaints</h2>
                        <Link
                            to="/reports"
                            className="text-primary hover:text-primary/80 font-medium flex items-center"
                        >
                            View All
                            <EyeIcon className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    {complaints.length === 0 ? (
                        <div className="card text-center py-12">
                            <DocumentTextIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No complaints filed yet</h3>
                            <p className="text-gray-400 mb-4">Start by filing your first complaint to track incidents</p>
                            <Link to="/complaint" className="btn-primary">
                                File First Complaint
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {complaints.slice(0, 3).map((complaint, index) => (
                                <div key={index} className="card">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="text-sm text-gray-400">
                                                    Complaint #{Number(complaint.id)}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${Number(complaint.status) === 0
                                                        ? 'bg-yellow-400/10 text-yellow-400'
                                                        : Number(complaint.status) === 1
                                                            ? 'bg-blue-400/10 text-blue-400'
                                                            : 'bg-green-400/10 text-green-400'
                                                    }`}>
                                                    {COMPLAINT_STATUS[Number(complaint.status)]}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${Number(complaint.severity) === 0
                                                        ? 'bg-green-400/10 text-green-400'
                                                        : Number(complaint.severity) === 1
                                                            ? 'bg-yellow-400/10 text-yellow-400'
                                                            : Number(complaint.severity) === 2
                                                                ? 'bg-orange-400/10 text-orange-400'
                                                                : 'bg-red-400/10 text-red-400'
                                                    }`}>
                                                    {SEVERITY_LEVELS[Number(complaint.severity)]}
                                                </span>
                                            </div>
                                            <p className="text-white font-medium mb-1">{complaint.location}</p>
                                            <p className="text-gray-400 text-sm line-clamp-2">
                                                {complaint.description.length > 100
                                                    ? `${complaint.description.substring(0, 100)}...`
                                                    : complaint.description
                                                }
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {new Date(Number(complaint.timestamp) * 1000).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Safety Tips */}
                <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Safety Reminder</h3>
                            <p className="text-gray-300 mb-4">
                                Always keep your trusted contacts updated and ensure your emergency SOS is easily accessible.
                                In case of immediate danger, don't hesitate to contact local authorities.
                            </p>
                            <div className="flex space-x-4">
                                <Link to="/contacts" className="btn-primary text-sm">
                                    Update Contacts
                                </Link>
                                <Link to="/emergency" className="btn-danger text-sm">
                                    Emergency SOS
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;