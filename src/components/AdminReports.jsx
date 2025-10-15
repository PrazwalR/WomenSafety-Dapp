import React, { useState, useEffect, useCallback } from 'react';
import {
    getAllComplaints,
    updateComplaintStatus
} from '../utils/ethereum';
import {
    COMPLAINT_STATUS,
    SEVERITY_LEVELS,
    INCIDENT_TYPES,
    STATUS_OPTIONS
} from '../utils/constants';
import { getSeverityColor, getStatusColor, formatAddress } from '../utils/helpers';
import {
    DocumentTextIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    CheckCircleIcon,
    MapPinIcon,
    UserIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminReports = () => {
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [updatingComplaint, setUpdatingComplaint] = useState(null);
    const [updateModal, setUpdateModal] = useState({
        show: false,
        complaint: null,
        newStatus: '',
        adminResponse: '',
    });

    useEffect(() => {
        loadComplaints();
    }, []);

    useEffect(() => {
        filterAndSortComplaints();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [complaints, statusFilter, severityFilter, searchTerm, sortOrder]);

    const loadComplaints = async () => {
        try {
            setLoading(true);
            const allComplaints = await getAllComplaints();
            setComplaints(allComplaints);
        } catch (error) {
            console.error('Error loading complaints:', error);
            toast.error('Failed to load complaints');
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
                complaint.complainant.toLowerCase().includes(term) ||
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
    }, [complaints, statusFilter, severityFilter, searchTerm, sortOrder]);

    const handleUpdateStatus = (complaint) => {
        setUpdateModal({
            show: true,
            complaint,
            newStatus: complaint.status.toString(),
            adminResponse: complaint.adminResponse || '',
        });
    };

    const handleCloseModal = () => {
        setUpdateModal({
            show: false,
            complaint: null,
            newStatus: '',
            adminResponse: '',
        });
    };

    const handleSubmitUpdate = async () => {
        try {
            setUpdatingComplaint(Number(updateModal.complaint.id));

            await updateComplaintStatus(
                Number(updateModal.complaint.id),
                parseInt(updateModal.newStatus),
                updateModal.adminResponse
            );

            // Reload complaints
            await loadComplaints();
            handleCloseModal();
        } catch (error) {
            console.error('Error updating complaint status:', error);
        } finally {
            setUpdatingComplaint(null);
        }
    };

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

    const getPriorityColor = (complaint) => {
        const severity = Number(complaint.severity);
        const status = Number(complaint.status);

        // High priority: Critical/High severity + Pending/In Progress
        if ((severity === 3 || severity === 2) && (status === 0 || status === 1)) {
            return 'border-red-500/50 bg-red-500/5';
        }

        // Medium priority: Medium severity + Pending
        if (severity === 1 && status === 0) {
            return 'border-yellow-500/50 bg-yellow-500/5';
        }

        return '';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading complaints...</p>
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
                        All Complaints
                    </h1>
                    <p className="text-gray-400">
                        Review and manage all user complaints across the platform
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
                                    placeholder="Search complaints, locations, or addresses..."
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
                                <option value="all">All Status</option>
                                <option value="0">Pending</option>
                                <option value="1">In Progress</option>
                                <option value="2">Resolved</option>
                            </select>
                        </div>

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
                            <p className="text-2xl font-bold text-white">{filteredComplaints.length}</p>
                            <p className="text-gray-400 text-sm">Showing Results</p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-400">
                                {filteredComplaints.filter(c => Number(c.status) === 0).length}
                            </p>
                            <p className="text-gray-400 text-sm">Pending Review</p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-400">
                                {filteredComplaints.filter(c => Number(c.severity) >= 2 && Number(c.status) !== 2).length}
                            </p>
                            <p className="text-gray-400 text-sm">High Priority</p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">
                                {filteredComplaints.filter(c => Number(c.status) === 2).length}
                            </p>
                            <p className="text-gray-400 text-sm">Resolved</p>
                        </div>
                    </div>
                </div>

                {/* Complaints List */}
                {filteredComplaints.length === 0 ? (
                    <div className="card text-center py-12">
                        <MagnifyingGlassIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No complaints found</h3>
                        <p className="text-gray-400">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredComplaints.map((complaint, index) => (
                            <div
                                key={index}
                                className={`card hover:border-primary/30 transition-colors ${getPriorityColor(complaint)}`}
                            >
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
                                                <ExclamationTriangleIcon className="w-4 h-4" />
                                                <span className="ml-1">{SEVERITY_LEVELS[Number(complaint.severity)]}</span>
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {INCIDENT_TYPES[Number(complaint.incidentType)]}
                                            </span>
                                            {Number(complaint.severity) >= 2 && Number(complaint.status) !== 2 && (
                                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                                    HIGH PRIORITY
                                                </span>
                                            )}
                                        </div>

                                        {/* User and Location */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div className="flex items-center text-gray-300">
                                                <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                                                <span className="font-mono text-sm">{formatAddress(complaint.complainant)}</span>
                                            </div>
                                            <div className="flex items-center text-white">
                                                <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                                                <span className="font-medium">{complaint.location}</span>
                                            </div>
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
                                            Submitted on {new Date(Number(complaint.timestamp) * 1000).toLocaleDateString()} at{' '}
                                            {new Date(Number(complaint.timestamp) * 1000).toLocaleTimeString()}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="lg:ml-6 flex flex-col space-y-2">
                                        <button
                                            onClick={() => handleUpdateStatus(complaint)}
                                            disabled={updatingComplaint === Number(complaint.id)}
                                            className="btn-primary flex items-center space-x-2 whitespace-nowrap"
                                        >
                                            {updatingComplaint === Number(complaint.id) ? (
                                                <div className="loading-spinner"></div>
                                            ) : (
                                                <PencilSquareIcon className="w-4 h-4" />
                                            )}
                                            <span>Update Status</span>
                                        </button>

                                        {Number(complaint.status) === 0 && (
                                            <div className="text-center">
                                                <div className="w-3 h-3 bg-yellow-400 rounded-full mx-auto mb-1 animate-pulse"></div>
                                                <p className="text-xs text-yellow-400">Needs Review</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Update Status Modal */}
                {updateModal.show && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-dark-lighter rounded-xl p-6 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">
                                    Update Complaint #{Number(updateModal.complaint.id)}
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Complaint Summary */}
                            <div className="bg-dark rounded-lg p-4 mb-6">
                                <p className="text-gray-300 text-sm mb-2">
                                    <strong>Location:</strong> {updateModal.complaint.location}
                                </p>
                                <p className="text-gray-300 text-sm mb-2">
                                    <strong>Type:</strong> {INCIDENT_TYPES[Number(updateModal.complaint.incidentType)]}
                                </p>
                                <p className="text-gray-300 text-sm">
                                    <strong>Severity:</strong> {SEVERITY_LEVELS[Number(updateModal.complaint.severity)]}
                                </p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleSubmitUpdate(); }} className="space-y-4">
                                {/* Status Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Update Status
                                    </label>
                                    <select
                                        value={updateModal.newStatus}
                                        onChange={(e) => setUpdateModal(prev => ({ ...prev, newStatus: e.target.value }))}
                                        className="select-field"
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Admin Response */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Admin Response
                                    </label>
                                    <textarea
                                        value={updateModal.adminResponse}
                                        onChange={(e) => setUpdateModal(prev => ({ ...prev, adminResponse: e.target.value }))}
                                        rows={4}
                                        placeholder="Provide updates or resolution details..."
                                        className="textarea-field"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={updatingComplaint === Number(updateModal.complaint.id)}
                                        className="btn-primary flex-1 flex items-center justify-center space-x-2"
                                    >
                                        {updatingComplaint === Number(updateModal.complaint.id) && (
                                            <div className="loading-spinner"></div>
                                        )}
                                        <span>Update Complaint</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReports;