import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { declareEmergency, getTrustedContacts } from '../utils/ethereum';
import { getCurrentLocation } from '../utils/helpers';
import {
    ExclamationTriangleIcon,
    MapPinIcon,
    PhoneIcon,
    ClockIcon,
    UserGroupIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EmergencySOS = () => {
    const { account } = useWeb3();
    const [contacts, setContacts] = useState([]);
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [lastEmergency, setLastEmergency] = useState(null);

    useEffect(() => {
        if (account) {
            loadContacts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account]);

    useEffect(() => {
        // Auto-detect location on component mount
        handleAutoLocation();
    }, []);

    const loadContacts = useCallback(async () => {
        try {
            const contactsList = await getTrustedContacts(account);
            setContacts(contactsList);
        } catch (error) {
            console.error('Error loading contacts:', error);
        }
    }, [account]);

    const handleAutoLocation = async () => {
        try {
            setLocationLoading(true);
            const currentLocation = await getCurrentLocation();
            setLocation(currentLocation.formatted);
        } catch (error) {
            console.error('Auto location failed:', error);
            setLocation('Location not available - please enter manually');
        } finally {
            setLocationLoading(false);
        }
    };

    const handleGetLocation = async () => {
        try {
            setLocationLoading(true);
            const currentLocation = await getCurrentLocation();
            setLocation(currentLocation.formatted);
            toast.success('Location updated successfully');
        } catch (error) {
            console.error('Error getting location:', error);
            toast.error('Could not get location: ' + error.message);
        } finally {
            setLocationLoading(false);
        }
    };

    const handleEmergencyClick = () => {
        if (contacts.length === 0) {
            toast.error('Please add at least one trusted contact first');
            return;
        }

        if (!location.trim()) {
            toast.error('Please provide your location');
            return;
        }

        setShowConfirmation(true);
    };

    const handleConfirmEmergency = async () => {
        try {
            setLoading(true);

            const emergencyMessage = message.trim() || 'Emergency! Please help me.';
            const emergencyLocation = location.trim();

            await declareEmergency(emergencyLocation, emergencyMessage);

            // Record the emergency details
            setLastEmergency({
                location: emergencyLocation,
                message: emergencyMessage,
                timestamp: new Date(),
                contactsAlerted: contacts.length,
            });

            // Reset form
            setMessage('');
            setShowConfirmation(false);

            toast.success(`Emergency alert sent to ${contacts.length} contact${contacts.length > 1 ? 's' : ''}!`);
        } catch (error) {
            console.error('Error sending emergency alert:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEmergency = () => {
        setShowConfirmation(false);
    };

    return (
        <div className="min-h-screen bg-dark">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                        <ExclamationTriangleIcon className="w-8 h-8 mr-3 text-emergency" />
                        Emergency SOS
                    </h1>
                    <p className="text-gray-400">
                        Send immediate alerts to your trusted contacts in case of emergency
                    </p>
                </div>

                {/* Contact Status */}
                <div className="card mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white flex items-center">
                            <UserGroupIcon className="w-6 h-6 mr-2 text-primary" />
                            Emergency Contacts ({contacts.length})
                        </h2>
                        {contacts.length === 0 && (
                            <button
                                onClick={() => window.location.href = '/contacts'}
                                className="btn-primary text-sm"
                            >
                                Add Contacts
                            </button>
                        )}
                    </div>

                    {contacts.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-gray-700 rounded-lg">
                            <UserGroupIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 mb-2">No emergency contacts added</p>
                            <p className="text-sm text-gray-500">Add trusted contacts to enable SOS alerts</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {contacts.map((contact, index) => (
                                <div key={index} className="flex items-center space-x-3 p-2 bg-green-500/10 rounded-lg">
                                    <PhoneIcon className="w-4 h-4 text-green-400" />
                                    <span className="text-green-300 font-mono">{contact}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Location Input */}
                <div className="card mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Current Location</h2>
                    <div className="space-y-4">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Enter your current location"
                                className="input-field flex-1"
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
                        <p className="text-sm text-gray-400">
                            Location will be shared with your emergency contacts and authorities
                        </p>
                    </div>
                </div>

                {/* Message Input */}
                <div className="card mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Emergency Message (Optional)</h2>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add additional details about your emergency (optional)"
                        rows={4}
                        className="textarea-field"
                    />
                    <p className="text-sm text-gray-400 mt-2">
                        Default message: "Emergency! Please help me." will be used if left blank
                    </p>
                </div>

                {/* Emergency Button */}
                <div className="text-center mb-8">
                    <button
                        onClick={handleEmergencyClick}
                        disabled={contacts.length === 0 || !location.trim()}
                        className={`w-48 h-48 rounded-full text-white font-bold text-2xl transition-all duration-200 ${contacts.length === 0 || !location.trim()
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-emergency hover:bg-red-600 emergency-pulse shadow-lg hover:shadow-xl transform hover:scale-105'
                            }`}
                    >
                        <div className="flex flex-col items-center">
                            <ExclamationTriangleIcon className="w-16 h-16 mb-2" />
                            <span>SOS</span>
                        </div>
                    </button>
                    <p className="text-gray-400 mt-4">
                        {contacts.length === 0
                            ? 'Add contacts to enable SOS'
                            : !location.trim()
                                ? 'Add location to enable SOS'
                                : 'Press to send emergency alert'
                        }
                    </p>
                </div>

                {/* Last Emergency */}
                {lastEmergency && (
                    <div className="card bg-green-500/10 border-green-500/20">
                        <div className="flex items-start space-x-4">
                            <CheckCircleIcon className="w-6 h-6 text-green-400 mt-0.5" />
                            <div>
                                <h3 className="text-lg font-semibold text-green-300 mb-2">Last Emergency Alert Sent</h3>
                                <div className="space-y-1 text-green-200">
                                    <p><ClockIcon className="w-4 h-4 inline mr-2" />
                                        {lastEmergency.timestamp.toLocaleString()}
                                    </p>
                                    <p><MapPinIcon className="w-4 h-4 inline mr-2" />
                                        {lastEmergency.location}
                                    </p>
                                    <p><UserGroupIcon className="w-4 h-4 inline mr-2" />
                                        {lastEmergency.contactsAlerted} contact{lastEmergency.contactsAlerted > 1 ? 's' : ''} alerted
                                    </p>
                                    <p className="italic">"{lastEmergency.message}"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Modal */}
                {showConfirmation && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-dark-lighter rounded-xl p-6 max-w-md w-full border border-gray-700">
                            <div className="text-center mb-6">
                                <ExclamationTriangleIcon className="w-16 h-16 text-emergency mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Confirm Emergency Alert</h3>
                                <p className="text-gray-400">
                                    This will immediately send an alert to {contacts.length} contact{contacts.length > 1 ? 's' : ''}
                                </p>
                            </div>

                            <div className="space-y-3 mb-6 text-sm">
                                <div className="flex items-center space-x-2">
                                    <MapPinIcon className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-300">Location: {location}</span>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <ExclamationTriangleIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <span className="text-gray-300">
                                        Message: "{message.trim() || 'Emergency! Please help me.'}"
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <UserGroupIcon className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-300">{contacts.length} contact{contacts.length > 1 ? 's' : ''} will be notified</span>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleConfirmEmergency}
                                    disabled={loading}
                                    className="btn-danger flex-1 flex items-center justify-center space-x-2"
                                >
                                    {loading && <div className="loading-spinner"></div>}
                                    <span>{loading ? 'Sending...' : 'Send Alert'}</span>
                                </button>
                                <button
                                    onClick={handleCancelEmergency}
                                    disabled={loading}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Safety Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="card bg-blue-500/10 border-blue-500/20">
                        <h3 className="text-lg font-semibold text-blue-300 mb-3">What Happens Next?</h3>
                        <ul className="text-blue-200 text-sm space-y-1">
                            <li>• Alert sent to all trusted contacts</li>
                            <li>• Emergency recorded on blockchain</li>
                            <li>• Authorities may be notified</li>
                            <li>• Contacts receive your location & message</li>
                        </ul>
                    </div>

                    <div className="card bg-yellow-500/10 border-yellow-500/20">
                        <h3 className="text-lg font-semibold text-yellow-300 mb-3">Important Notes</h3>
                        <ul className="text-yellow-200 text-sm space-y-1">
                            <li>• Only use for genuine emergencies</li>
                            <li>• Call 911 for immediate life-threatening situations</li>
                            <li>• Keep your contacts list updated</li>
                            <li>• Test the system periodically</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencySOS;