import React, { useState, useEffect, useCallback } from 'react';
import {
    getAllEmergencies,
    resolveEmergency
} from '../utils/ethereum';
import { formatAddress } from '../utils/helpers';
import {
    ExclamationTriangleIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ClockIcon,
    MapPinIcon,
    UserIcon,
    PhoneIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminEmergencies = () => {
    const [emergencies, setEmergencies] = useState([]);
    const [filteredEmergencies, setFilteredEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [resolvingEmergency, setResolvingEmergency] = useState(null);
    const [selectedEmergency, setSelectedEmergency] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        loadEmergencies();
    }, []);

    useEffect(() => {
        filterAndSortEmergencies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [emergencies, searchTerm, statusFilter, sortOrder]);

    const loadEmergencies = async () => {
        try {
            setLoading(true);
            const allEmergencies = await getAllEmergencies();
            setEmergencies(allEmergencies);
        } catch (error) {
            console.error('Error loading emergencies:', error);
            toast.error('Failed to load emergencies');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortEmergencies = useCallback(() => {
        let filtered = [...emergencies];

        // Apply status filter
        if (statusFilter === 'active') {
            filtered = filtered.filter(emergency => !emergency.isResolved);
        } else if (statusFilter === 'resolved') {
            filtered = filtered.filter(emergency => emergency.isResolved);
        }

        // Apply search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(emergency =>
                emergency.location.toLowerCase().includes(term) ||
                emergency.message.toLowerCase().includes(term) ||
                emergency.user.toLowerCase().includes(term)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'newest':
                    return Number(b.timestamp) - Number(a.timestamp);
                case 'oldest':
                    return Number(a.timestamp) - Number(b.timestamp);
                case 'status':
                    return a.isResolved - b.isResolved; // Active first
                default:
                    return 0;
            }
        });

        setFilteredEmergencies(filtered);
    }, [emergencies, searchTerm, statusFilter, sortOrder]);

    const handleResolveEmergency = async (emergencyId) => {
        try {
            setResolvingEmergency(emergencyId);
            await resolveEmergency(emergencyId);

            // Reload emergencies
            await loadEmergencies();
        } catch (error) {
            console.error('Error resolving emergency:', error);
        } finally {
            setResolvingEmergency(null);
        }
    };

    const handleShowDetails = (emergency) => {
        setSelectedEmergency(emergency);
        setShowDetailsModal(true);
    };

    const handleCloseModal = () => {
        setSelectedEmergency(null);
        setShowDetailsModal(false);
    };

    const getEmergencyPriority = (emergency) => {
        const hoursAgo = (Date.now() - Number(emergency.timestamp) * 1000) / (1000 * 60 * 60);

        if (!emergency.isResolved) {
            if (hoursAgo > 24) return 'critical';
            if (hoursAgo > 12) return 'high';
            if (hoursAgo > 2) return 'medium';
            return 'urgent';
        }
        return 'resolved';
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical':
                return 'border-red-600 bg-red-600/10';
            case 'urgent':
                return 'border-red-500 bg-red-500/10';
            case 'high':
                return 'border-orange-500 bg-orange-500/10';
            case 'medium':
                return 'border-yellow-500 bg-yellow-500/10';
            case 'resolved':
                return 'border-green-500 bg-green-500/10';
            default:
                return '';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'critical':
                return 'CRITICAL - 24+ Hours';
            case 'urgent':
                return 'URGENT - Recent';
            case 'high':
                return 'HIGH - 12+ Hours';
            case 'medium':
                return 'MEDIUM - 2+ Hours';
            case 'resolved':
                return 'RESOLVED';
            default:
                return '';
        }
    };

    const activeEmergencies = emergencies.filter(e => !e.isResolved);
    const resolvedEmergencies = emergencies.filter(e => e.isResolved);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading emergencies...</p>
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
                        <ExclamationTriangleIcon className="w-8 h-8 mr-3 text-emergency" />
                        Emergency Management
                    </h1>
                    <p className="text-gray-400">
                        Monitor and respond to emergency alerts across the platform
                    </p>
                </div>

                {/* Alert Banner for Active Emergencies */}
                {activeEmergencies.length > 0 && (
                    <div className="mb-8 card bg-red-500/10 border-red-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <ExclamationTriangleIcon className="w-8 h-8 text-red-400 emergency-pulse" />
                                <div>
                                    <h3 className="text-lg font-semibold text-red-300">
                                        {activeEmergencies.length} Active Emergenc{activeEmergencies.length > 1 ? 'ies' : 'y'}
                                    </h3>
                                    <p className="text-red-200">Immediate attention required</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-red-400">{activeEmergencies.length}</p>
                                <p className="text-red-300 text-sm">Active Alerts</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="card mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search emergencies by location, message, or user..."
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center space-x-2">
                            <FunnelIcon className="w-5 h-5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="select-field"
                            >
                                <option value="all">All Emergencies</option>
                                <option value="active">Active Only</option>
                                <option value="resolved">Resolved Only</option>
                            </select>
                        </div>

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="select-field"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="status">Active First</option>
                        </select>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="card">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{filteredEmergencies.length}</p>
                            <p className="text-gray-400 text-sm">Total Shown</p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-400">{activeEmergencies.length}</p>
                            <p className="text-gray-400 text-sm">Active Alerts</p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-400">
                                {activeEmergencies.filter(e => {
                                    const hoursAgo = (Date.now() - Number(e.timestamp) * 1000) / (1000 * 60 * 60);
                                    return hoursAgo > 12;
                                }).length}
                            </p>
                            <p className="text-gray-400 text-sm">High Priority</p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">{resolvedEmergencies.length}</p>
                            <p className="text-gray-400 text-sm">Resolved</p>
                        </div>
                    </div>
                </div>

                {/* Emergencies List */}
                {filteredEmergencies.length === 0 ? (
                    <div className="card text-center py-12">
                        {emergencies.length === 0 ? (
                            <>
                                <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-green-400 mb-2">No emergencies reported</h3>
                                <p className="text-gray-400">All systems are operating normally</p>
                            </>
                        ) : (
                            <>
                                <MagnifyingGlassIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">No emergencies match your filters</h3>
                                <p className="text-gray-400">Try adjusting your search or filters</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredEmergencies.map((emergency, index) => {
                            const priority = getEmergencyPriority(emergency);
                            const priorityColor = getPriorityColor(priority);
                            const priorityLabel = getPriorityLabel(priority);

                            return (
                                <div
                                    key={index}
                                    className={`card hover:border-primary/30 transition-colors ${priorityColor}`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        {/* Main Content */}
                                        <div className="flex-1">
                                            {/* Header */}
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className="text-sm text-gray-400">
                                                    Emergency #{Number(emergency.id)}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${emergency.isResolved
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {emergency.isResolved ? 'RESOLVED' : 'ACTIVE'}
                                                </span>
                                                {!emergency.isResolved && (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority === 'critical' ? 'bg-red-600 text-white' :
                                                            priority === 'urgent' ? 'bg-red-500 text-white' :
                                                                priority === 'high' ? 'bg-orange-500 text-white' :
                                                                    'bg-yellow-500 text-white'
                                                        }`}>
                                                        {priorityLabel}
                                                    </span>
                                                )}
                                            </div>

                                            {/* User and Location */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                <div className="flex items-center text-gray-300">
                                                    <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="font-mono text-sm">{formatAddress(emergency.user)}</span>
                                                </div>
                                                <div className="flex items-center text-white">
                                                    <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="font-medium">{emergency.location}</span>
                                                </div>
                                            </div>

                                            {/* Message */}
                                            <p className="text-gray-300 mb-3 leading-relaxed">
                                                <strong>Message:</strong> {emergency.message}
                                            </p>

                                            {/* Contacts Alerted */}
                                            {emergency.trustedContactsAlerted && emergency.trustedContactsAlerted.length > 0 && (
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                                                    <p className="text-blue-300 font-medium text-sm mb-2">
                                                        Trusted Contacts Alerted ({emergency.trustedContactsAlerted.length}):
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {emergency.trustedContactsAlerted.map((contact, idx) => (
                                                            <span key={idx} className="inline-flex items-center text-blue-200 text-xs bg-blue-500/20 px-2 py-1 rounded">
                                                                <PhoneIcon className="w-3 h-3 mr-1" />
                                                                {contact}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Timestamp */}
                                            <div className="flex items-center text-sm text-gray-500">
                                                <ClockIcon className="w-4 h-4 mr-1" />
                                                Reported on {new Date(Number(emergency.timestamp) * 1000).toLocaleDateString()} at{' '}
                                                {new Date(Number(emergency.timestamp) * 1000).toLocaleTimeString()}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="lg:ml-6 flex flex-col space-y-2">
                                            <button
                                                onClick={() => handleShowDetails(emergency)}
                                                className="btn-secondary whitespace-nowrap"
                                            >
                                                View Details
                                            </button>

                                            {!emergency.isResolved && (
                                                <button
                                                    onClick={() => handleResolveEmergency(Number(emergency.id))}
                                                    disabled={resolvingEmergency === Number(emergency.id)}
                                                    className="btn-primary whitespace-nowrap flex items-center space-x-2"
                                                >
                                                    {resolvingEmergency === Number(emergency.id) ? (
                                                        <div className="loading-spinner"></div>
                                                    ) : (
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                    )}
                                                    <span>Mark Resolved</span>
                                                </button>
                                            )}

                                            {emergency.isResolved && (
                                                <div className="text-center">
                                                    <CheckCircleIcon className="w-6 h-6 text-green-400 mx-auto mb-1" />
                                                    <p className="text-xs text-green-400">Case Closed</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Emergency Details Modal */}
                {showDetailsModal && selectedEmergency && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-dark-lighter rounded-xl p-6 max-w-2xl w-full border border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">
                                    Emergency #{Number(selectedEmergency.id)} Details
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Status */}
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-400">Status:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedEmergency.isResolved
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {selectedEmergency.isResolved ? 'RESOLVED' : 'ACTIVE'}
                                    </span>
                                </div>

                                {/* User */}
                                <div>
                                    <span className="text-gray-400">User Address: </span>
                                    <span className="text-white font-mono">{selectedEmergency.user}</span>
                                </div>

                                {/* Location */}
                                <div>
                                    <span className="text-gray-400">Location: </span>
                                    <span className="text-white">{selectedEmergency.location}</span>
                                </div>

                                {/* Message */}
                                <div>
                                    <span className="text-gray-400">Message: </span>
                                    <span className="text-white">{selectedEmergency.message}</span>
                                </div>

                                {/* Timestamp */}
                                <div>
                                    <span className="text-gray-400">Reported: </span>
                                    <span className="text-white">
                                        {new Date(Number(selectedEmergency.timestamp) * 1000).toLocaleString()}
                                    </span>
                                </div>

                                {/* Trusted Contacts */}
                                {selectedEmergency.trustedContactsAlerted && selectedEmergency.trustedContactsAlerted.length > 0 && (
                                    <div>
                                        <p className="text-gray-400 mb-2">
                                            Trusted Contacts Alerted ({selectedEmergency.trustedContactsAlerted.length}):
                                        </p>
                                        <div className="bg-dark rounded-lg p-3 space-y-1">
                                            {selectedEmergency.trustedContactsAlerted.map((contact, idx) => (
                                                <div key={idx} className="flex items-center text-white">
                                                    <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="font-mono">{contact}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-3 pt-6">
                                {!selectedEmergency.isResolved && (
                                    <button
                                        onClick={() => {
                                            handleResolveEmergency(Number(selectedEmergency.id));
                                            handleCloseModal();
                                        }}
                                        disabled={resolvingEmergency === Number(selectedEmergency.id)}
                                        className="btn-primary flex-1 flex items-center justify-center space-x-2"
                                    >
                                        {resolvingEmergency === Number(selectedEmergency.id) ? (
                                            <div className="loading-spinner"></div>
                                        ) : (
                                            <CheckCircleIcon className="w-4 h-4" />
                                        )}
                                        <span>Mark as Resolved</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleCloseModal}
                                    className="btn-secondary flex-1"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminEmergencies;