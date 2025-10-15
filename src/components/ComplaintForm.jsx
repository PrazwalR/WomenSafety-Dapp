import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fileComplaint } from '../utils/ethereum';
import { validateComplaintForm, getCurrentLocation } from '../utils/helpers';
import { INCIDENT_TYPE_OPTIONS, SEVERITY_OPTIONS } from '../utils/constants';
import {
    DocumentTextIcon,
    MapPinIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ComplaintForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        incidentType: '',
        severity: '',
        description: '',
        location: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleGetLocation = async () => {
        try {
            setLocationLoading(true);
            const location = await getCurrentLocation();
            setFormData(prev => ({
                ...prev,
                location: location.formatted,
            }));
            toast.success('Location retrieved successfully');
        } catch (error) {
            console.error('Error getting location:', error);
            toast.error('Could not get location: ' + error.message);
        } finally {
            setLocationLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validation = validateComplaintForm(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            toast.error('Please fix the errors and try again');
            return;
        }

        try {
            setLoading(true);

            // Convert values to numbers for blockchain
            const complaintData = {
                incidentType: parseInt(formData.incidentType),
                severity: parseInt(formData.severity),
                description: formData.description.trim(),
                location: formData.location.trim(),
            };

            await fileComplaint(complaintData);

            // Reset form
            setFormData({
                incidentType: '',
                severity: '',
                description: '',
                location: '',
            });
            setErrors({});

            // Navigate to reports page
            navigate('/reports');
        } catch (error) {
            console.error('Error filing complaint:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                        <DocumentTextIcon className="w-8 h-8 mr-3 text-primary" />
                        File Complaint
                    </h1>
                    <p className="text-gray-400">
                        Report an incident securely on the blockchain. All information is encrypted and stored permanently.
                    </p>
                </div>

                {/* Form */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Incident Type */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Incident Type *
                            </label>
                            <select
                                name="incidentType"
                                value={formData.incidentType}
                                onChange={handleInputChange}
                                className={`select-field ${errors.incidentType ? 'border-red-500' : ''}`}
                            >
                                <option value="">Select incident type</option>
                                {INCIDENT_TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.incidentType && (
                                <p className="text-red-400 text-sm mt-1 flex items-center">
                                    <XMarkIcon className="w-4 h-4 mr-1" />
                                    {errors.incidentType}
                                </p>
                            )}
                        </div>

                        {/* Severity Level */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Severity Level *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {SEVERITY_OPTIONS.map((option) => (
                                    <label
                                        key={option.value}
                                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.severity === option.value.toString()
                                                ? 'border-primary bg-primary/10'
                                                : 'border-gray-600 hover:border-gray-500'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="severity"
                                            value={option.value}
                                            checked={formData.severity === option.value.toString()}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-3 ${option.value === 0 ? 'bg-green-400' :
                                                    option.value === 1 ? 'bg-yellow-400' :
                                                        option.value === 2 ? 'bg-orange-400' : 'bg-red-400'
                                                }`}></div>
                                            <span className={`text-sm font-medium ${formData.severity === option.value.toString() ? 'text-white' : 'text-gray-300'
                                                }`}>
                                                {option.label}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.severity && (
                                <p className="text-red-400 text-sm mt-1 flex items-center">
                                    <XMarkIcon className="w-4 h-4 mr-1" />
                                    {errors.severity}
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Location *
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Enter location or use GPS"
                                    className={`input-field flex-1 ${errors.location ? 'border-red-500' : ''}`}
                                />
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    disabled={locationLoading}
                                    className="btn-secondary whitespace-nowrap flex items-center space-x-2"
                                >
                                    {locationLoading ? (
                                        <div className="loading-spinner"></div>
                                    ) : (
                                        <MapPinIcon className="w-4 h-4" />
                                    )}
                                    <span>{locationLoading ? 'Getting...' : 'Get GPS'}</span>
                                </button>
                            </div>
                            {errors.location && (
                                <p className="text-red-400 text-sm mt-1 flex items-center">
                                    <XMarkIcon className="w-4 h-4 mr-1" />
                                    {errors.location}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Description * (minimum 50 characters)
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={6}
                                placeholder="Provide detailed description of the incident..."
                                className={`textarea-field ${errors.description ? 'border-red-500' : ''}`}
                            />
                            <div className="flex justify-between items-center mt-1">
                                {errors.description ? (
                                    <p className="text-red-400 text-sm flex items-center">
                                        <XMarkIcon className="w-4 h-4 mr-1" />
                                        {errors.description}
                                    </p>
                                ) : (
                                    <p className={`text-sm ${formData.description.length >= 50 ? 'text-green-400' : 'text-gray-400'
                                        }`}>
                                        {formData.description.length >= 50 && (
                                            <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                                        )}
                                        Character count: {formData.description.length}/50 minimum
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Privacy Notice */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <div className="flex">
                                <ExclamationTriangleIcon className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="text-blue-300 font-medium mb-1">Privacy & Security</p>
                                    <p className="text-blue-200">
                                        Your complaint will be stored on the blockchain with encryption.
                                        Only you and authorized administrators can view the details.
                                        This ensures transparency while maintaining your privacy.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1 flex items-center justify-center space-x-2 py-3"
                            >
                                {loading && <div className="loading-spinner"></div>}
                                <DocumentTextIcon className="w-5 h-5" />
                                <span>{loading ? 'Filing Complaint...' : 'File Complaint'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="btn-secondary px-8 py-3"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Section */}
                <div className="mt-8 card bg-yellow-500/10 border-yellow-500/20">
                    <div className="flex">
                        <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-semibold text-yellow-300 mb-2">Need Immediate Help?</h3>
                            <p className="text-yellow-200 mb-4">
                                If you're in immediate danger, please contact emergency services or use our SOS feature.
                            </p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => navigate('/emergency')}
                                    className="bg-emergency hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors emergency-pulse"
                                >
                                    Emergency SOS
                                </button>
                                <a
                                    href="tel:911"
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Call 911
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintForm;