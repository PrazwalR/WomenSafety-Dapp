import React, { useState, useEffect, useCallback } from 'react';
import { getUserComplaints } from '../utils/ethereum';
import {
    COMPLAINT_STATUS,
    SEVERITY_LEVELS,
    INCIDENT_TYPES
} from '../utils/constants';
import { getSeverityColor, getStatusColor } from '../utils/helpers';
import {
    DocumentTextIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    CheckCircleIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';

const ViewReports = () => {
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');

    useEffect(() => {
        loadComplaints();
    }, []);

    useEffect(() => {
        filterAndSortComplaints();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [complaints, searchTerm, statusFilter, severityFilter, sortOrder]);

    const loadComplaints = async () => {
        try {
            setLoading(true);
            const userComplaints = await getUserComplaints();
            setComplaints(userComplaints);
        } catch (error) {
            console.error('Error loading complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortComplaints = useCallback(() => {
        let filtered = [...complaints];

        // Apply filters
        if (statusFilter !== 'all') {
            filtered = filtered.filter(complaint =>
                Number(complaint.status) === parseInt(statusFilter)
            );
        }

        if (severityFilter !== 'all') {
            filtered = filtered.filter(complaint =>
                Number(complaint.severity) === parseInt(severityFilter)
            );
        }

        // Apply search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(complaint =>
                complaint.description.toLowerCase().includes(term) ||
                complaint.location.toLowerCase().includes(term) ||
                INCIDENT_TYPES[Number(complaint.incidentType)].toLowerCase().includes(term)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'newest':
                    return Number(b.timestamp) - Number(a.timestamp);
                case 'oldest':
                    return Number(a.timestamp) - Number(b.timestamp);
                case 'severity':
                    return Number(b.severity) - Number(a.severity);
                case 'status':
                    return Number(a.status) - Number(b.status);
                default:
                    return 0;
            }
        });

        setFilteredComplaints(filtered);
    }, [complaints, searchTerm, statusFilter, severityFilter, sortOrder]);

    const getStatusIcon = (status) => {
        switch (Number(status)) {
            case 0:
                return <ClockIcon className="w-5 h-5" />;
            case 1:
                return <ExclamationTriangleIcon className="w-5 h-5" />;
            case 2:
                return <CheckCircleIcon className="w-5 h-5" />;
            default:
                return <ClockIcon className="w-5 h-5" />;
        }
    };

    const getSeverityIcon = (severity) => {
        return <ExclamationTriangleIcon className="w-5 h-5" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading reports...</p>
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
                        <DocumentTextIcon className="w-8 h-8 mr-3 text-primary" />
                        My Reports
                    </h1>
                    <p className="text-gray-400">
                        Track the status of your filed complaints and view detailed information
                    </p>
                </div>

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
                                    placeholder="Search complaints..."
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center space-x-2">
                            <FunnelIcon className="w-5 h-5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="select-field"
                            >
                                <option value="all">All Status</option>
                                <option value="0">Pending</option>
                                <option value="1">In Progress</option>
                                <option value="2">Resolved</option>
                            </select>
                        </div>

                        {/* Severity Filter */}
                        <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            className="select-field"
                        >
                            <option value="all">All Severity</option>
                            <option value="0">Low</option>
                            <option value="1">Medium</option>
                            <option value="2">High</option>
                            <option value="3">Critical</option>
                        </select>

                        {/* Sort Order */}
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="select-field"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="severity">By Severity</option>
                            <option value="status">By Status</option>
                        </select>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="card">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{complaints.length}</p>
                            <p className="text-gray-400 text-sm">Total Reports</p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-400">
                                {complaints.filter(c => Number(c.status) === 0).length}
                            </p>
                            <p className="text-gray-400 text-sm">Pending</p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-400">
                                {complaints.filter(c => Number(c.status) === 1).length}
                            </p>
                            <p className="text-gray-400 text-sm">In Progress</p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">
                                {complaints.filter(c => Number(c.status) === 2).length}
                            </p>
                            <p className="text-gray-400 text-sm">Resolved</p>
                        </div>
                    </div>
                </div>

                {/* Complaints List */}
                {filteredComplaints.length === 0 ? (
                    <div className="card text-center py-12">
                        {complaints.length === 0 ? (
                            <>
                                <DocumentTextIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">No complaints filed yet</h3>
                                <p className="text-gray-400 mb-4">Start by filing your first complaint</p>
                                <button
                                    onClick={() => window.location.href = '/complaint'}
                                    className="btn-primary"
                                >
                                    File First Complaint
                                </button>
                            </>
                        ) : (
                            <>
                                <MagnifyingGlassIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">No complaints match your filters</h3>
                                <p className="text-gray-400">Try adjusting your search or filters</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredComplaints.map((complaint, index) => (
                            <div key={index} className="card hover:border-primary/30 transition-colors">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    {/* Main Content */}
                                    <div className="flex-1">
                                        {/* Header */}
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span className="text-sm text-gray-400">
                                                Complaint #{Number(complaint.id)}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(Number(complaint.status))}`}>
                                                {getStatusIcon(Number(complaint.status))}
                                                <span className="ml-1">{COMPLAINT_STATUS[Number(complaint.status)]}</span>
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(Number(complaint.severity))}`}>
                                                {getSeverityIcon(Number(complaint.severity))}
                                                <span className="ml-1">{SEVERITY_LEVELS[Number(complaint.severity)]}</span>
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {INCIDENT_TYPES[Number(complaint.incidentType)]}
                                            </span>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center text-white mb-2">
                                            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="font-medium">{complaint.location}</span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-300 mb-3 leading-relaxed">
                                            {complaint.description}
                                        </p>

                                        {/* Admin Response */}
                                        {complaint.adminResponse && complaint.adminResponse.trim() && (
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                                                <p className="text-blue-300 font-medium text-sm mb-1">Admin Response:</p>
                                                <p className="text-blue-200 text-sm">{complaint.adminResponse}</p>
                                            </div>
                                        )}

                                        {/* Timestamp */}
                                        <div className="flex items-center text-sm text-gray-500">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            Filed on {new Date(Number(complaint.timestamp) * 1000).toLocaleDateString()} at{' '}
                                            {new Date(Number(complaint.timestamp) * 1000).toLocaleTimeString()}
                                        </div>
                                    </div>

                                    {/* Status Actions */}
                                    <div className="lg:ml-6">
                                        <div className="flex lg:flex-col gap-2">
                                            {Number(complaint.status) === 0 && (
                                                <div className="text-center">
                                                    <div className="w-3 h-3 bg-yellow-400 rounded-full mx-auto mb-1"></div>
                                                    <p className="text-xs text-yellow-400">Under Review</p>
                                                </div>
                                            )}
                                            {Number(complaint.status) === 1 && (
                                                <div className="text-center">
                                                    <div className="w-3 h-3 bg-blue-400 rounded-full mx-auto mb-1 animate-pulse"></div>
                                                    <p className="text-xs text-blue-400">Being Processed</p>
                                                </div>
                                            )}
                                            {Number(complaint.status) === 2 && (
                                                <div className="text-center">
                                                    <CheckCircleIcon className="w-6 h-6 text-green-400 mx-auto mb-1" />
                                                    <p className="text-xs text-green-400">Case Closed</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Help Section */}
                <div className="mt-8 card bg-purple-500/10 border-purple-500/20">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Understanding Complaint Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                                <ClockIcon className="w-4 h-4 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-yellow-300 font-medium">Pending</p>
                                <p className="text-yellow-200">Complaint received, awaiting review</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-400/20 rounded-lg flex items-center justify-center">
                                <ExclamationTriangleIcon className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-blue-300 font-medium">In Progress</p>
                                <p className="text-blue-200">Actively being investigated</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center">
                                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                            </div>
                            <div>
                                <p className="text-green-300 font-medium">Resolved</p>
                                <p className="text-green-200">Case closed with resolution</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewReports;