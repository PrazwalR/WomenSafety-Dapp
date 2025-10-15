import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { getComplaintStats } from '../utils/ethereum';
import {
    ShieldCheckIcon,
    PhoneIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    ArrowRightIcon,
    UserGroupIcon,
    ClockIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const Home = () => {
    const { isConnected, isRegistered, registerUser, loading } = useWeb3();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
    });
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setStatsLoading(true);
            const complaintStats = await getComplaintStats();
            setStats({
                total: Number(complaintStats.total),
                pending: Number(complaintStats.pending),
                inProgress: Number(complaintStats.inProgress),
                resolved: Number(complaintStats.resolved),
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleRegister = async () => {
        try {
            await registerUser();
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };

    const features = [
        {
            icon: ExclamationTriangleIcon,
            title: 'File Complaints',
            description: 'Report incidents securely on the blockchain with complete privacy and transparency.',
            color: 'from-red-500 to-pink-500',
        },
        {
            icon: PhoneIcon,
            title: 'Emergency SOS',
            description: 'One-click emergency alerts to trusted contacts and authorities in critical situations.',
            color: 'from-orange-500 to-red-500',
        },
        {
            icon: UserGroupIcon,
            title: 'Trusted Contacts',
            description: 'Manage up to 5 trusted contacts who will be alerted during emergencies.',
            color: 'from-blue-500 to-purple-500',
        },
        {
            icon: ChartBarIcon,
            title: 'Real-time Tracking',
            description: 'Track complaint status and receive updates from authorities in real-time.',
            color: 'from-green-500 to-blue-500',
        },
    ];

    const statsData = [
        {
            icon: ClockIcon,
            label: 'Total Complaints',
            value: stats.total,
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10',
        },
        {
            icon: ExclamationTriangleIcon,
            label: 'Pending Cases',
            value: stats.pending,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-400/10',
        },
        {
            icon: ClockIcon,
            label: 'In Progress',
            value: stats.inProgress,
            color: 'text-orange-400',
            bgColor: 'bg-orange-400/10',
        },
        {
            icon: CheckCircleIcon,
            label: 'Resolved Cases',
            value: stats.resolved,
            color: 'text-green-400',
            bgColor: 'bg-green-400/10',
        },
    ];

    return (
        <div className="min-h-screen bg-dark">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-transparent"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            Your Safety,{' '}
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Our Priority
                            </span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                            A blockchain-based platform ensuring women's safety through secure complaint filing,
                            emergency alerts, and real-time tracking with complete transparency.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {!isConnected ? (
                                <div className="text-center">
                                    <p className="text-gray-400 mb-4">Connect your wallet to get started</p>
                                    <div className="w-64 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-500">Connect Wallet First</span>
                                    </div>
                                </div>
                            ) : !isRegistered ? (
                                <button
                                    onClick={handleRegister}
                                    disabled={loading}
                                    className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
                                >
                                    {loading && <div className="loading-spinner"></div>}
                                    <span>{loading ? 'Registering...' : 'Register Now'}</span>
                                    <ArrowRightIcon className="w-5 h-5" />
                                </button>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        to="/dashboard"
                                        className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
                                    >
                                        <span>Go to Dashboard</span>
                                        <ArrowRightIcon className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        to="/emergency"
                                        className="btn-danger text-lg px-8 py-4 flex items-center space-x-2 emergency-pulse"
                                    >
                                        <ExclamationTriangleIcon className="w-5 h-5" />
                                        <span>Emergency SOS</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-16 bg-dark-lighter">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Platform Statistics</h2>
                        <p className="text-gray-400">Real-time data from our blockchain network</p>
                    </div>

                    {statsLoading ? (
                        <div className="flex justify-center">
                            <div className="loading-spinner w-8 h-8"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statsData.map((stat, index) => (
                                <div key={index} className="card text-center">
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${stat.bgColor}`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{stat.value}</h3>
                                    <p className="text-gray-400">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Platform Features</h2>
                        <p className="text-gray-400">Comprehensive safety solutions powered by blockchain technology</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="card hover:scale-105 transition-transform duration-300">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-gradient-to-r ${feature.color}`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 bg-dark-lighter">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-gray-400">Simple steps to ensure your safety</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-xl">1</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Connect Wallet</h3>
                            <p className="text-gray-400">Connect your MetaMask wallet and register on the platform</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-xl">2</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Setup Profile</h3>
                            <p className="text-gray-400">Add trusted contacts and configure your emergency settings</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-xl">3</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Stay Protected</h3>
                            <p className="text-gray-400">File complaints or trigger SOS alerts when needed</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8">
                        <ShieldCheckIcon className="w-16 h-16 text-white mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Ready to Enhance Your Safety?
                        </h2>
                        <p className="text-white/90 mb-6 text-lg">
                            Join thousands of women who trust our blockchain-based safety platform
                        </p>

                        {!isConnected && (
                            <p className="text-white/80 mb-4">
                                Connect your wallet in the top right corner to get started
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;