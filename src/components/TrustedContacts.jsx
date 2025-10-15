import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import {
    getTrustedContacts,
    addTrustedContact,
    removeTrustedContact
} from '../utils/ethereum';
import { validatePhoneNumber } from '../utils/helpers';
import { APP_CONFIG } from '../utils/constants';
import {
    UserGroupIcon,
    PlusIcon,
    TrashIcon,
    PhoneIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TrustedContacts = () => {
    const { account } = useWeb3();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingContact, setAddingContact] = useState(false);
    const [removingIndex, setRemovingIndex] = useState(null);
    const [newContactPhone, setNewContactPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');

    useEffect(() => {
        if (account) {
            loadContacts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account]);

    const loadContacts = useCallback(async () => {
        try {
            setLoading(true);
            const contactsList = await getTrustedContacts(account);
            setContacts(contactsList);
        } catch (error) {
            console.error('Error loading contacts:', error);
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    }, [account]);

    const handleAddContact = async (e) => {
        e.preventDefault();

        // Validate phone number
        if (!validatePhoneNumber(newContactPhone)) {
            setPhoneError('Please enter a valid phone number');
            return;
        }

        // Check if already exists
        if (contacts.includes(newContactPhone.trim())) {
            setPhoneError('This contact already exists');
            return;
        }

        // Check maximum limit
        if (contacts.length >= APP_CONFIG.MAX_TRUSTED_CONTACTS) {
            toast.error(`Maximum ${APP_CONFIG.MAX_TRUSTED_CONTACTS} contacts allowed`);
            return;
        }

        try {
            setAddingContact(true);
            await addTrustedContact(newContactPhone.trim());

            // Reload contacts
            await loadContacts();

            // Reset form
            setNewContactPhone('');
            setPhoneError('');
        } catch (error) {
            console.error('Error adding contact:', error);
        } finally {
            setAddingContact(false);
        }
    };

    const handleRemoveContact = async (index) => {
        try {
            setRemovingIndex(index);
            await removeTrustedContact(index);

            // Reload contacts
            await loadContacts();
        } catch (error) {
            console.error('Error removing contact:', error);
        } finally {
            setRemovingIndex(null);
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        setNewContactPhone(value);

        // Clear error when user types
        if (phoneError) {
            setPhoneError('');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading contacts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                        <UserGroupIcon className="w-8 h-8 mr-3 text-primary" />
                        Trusted Contacts
                    </h1>
                    <p className="text-gray-400">
                        Manage your emergency contacts. They will be notified when you trigger an SOS alert.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        {contacts.length} of {APP_CONFIG.MAX_TRUSTED_CONTACTS} contacts added
                    </p>
                </div>

                {/* Add New Contact Form */}
                <div className="card mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Add New Contact</h2>
                    <form onSubmit={handleAddContact} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Phone Number
                            </label>
                            <div className="flex space-x-3">
                                <input
                                    type="tel"
                                    value={newContactPhone}
                                    onChange={handlePhoneChange}
                                    placeholder="+1234567890"
                                    className={`input-field flex-1 ${phoneError ? 'border-red-500' : ''}`}
                                    disabled={contacts.length >= APP_CONFIG.MAX_TRUSTED_CONTACTS}
                                />
                                <button
                                    type="submit"
                                    disabled={
                                        addingContact ||
                                        !newContactPhone.trim() ||
                                        contacts.length >= APP_CONFIG.MAX_TRUSTED_CONTACTS
                                    }
                                    className="btn-primary whitespace-nowrap flex items-center space-x-2"
                                >
                                    {addingContact ? (
                                        <div className="loading-spinner"></div>
                                    ) : (
                                        <PlusIcon className="w-4 h-4" />
                                    )}
                                    <span>{addingContact ? 'Adding...' : 'Add Contact'}</span>
                                </button>
                            </div>
                            {phoneError && (
                                <p className="text-red-400 text-sm mt-1">{phoneError}</p>
                            )}
                            {contacts.length >= APP_CONFIG.MAX_TRUSTED_CONTACTS && (
                                <p className="text-yellow-400 text-sm mt-1">
                                    Maximum contacts limit reached. Remove a contact to add a new one.
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                {/* Contacts List */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-white mb-4">Your Trusted Contacts</h2>

                    {contacts.length === 0 ? (
                        <div className="text-center py-12">
                            <UserGroupIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No contacts added yet</h3>
                            <p className="text-gray-400 mb-4">
                                Add trusted contacts who will be notified during emergencies
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {contacts.map((contact, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-dark-lighter rounded-lg border border-gray-700"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-primary/20 rounded-lg">
                                            <PhoneIcon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{contact}</p>
                                            <p className="text-sm text-gray-400">Contact #{index + 1}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveContact(index)}
                                        disabled={removingIndex === index}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        {removingIndex === index ? (
                                            <div className="loading-spinner w-5 h-5"></div>
                                        ) : (
                                            <TrashIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* How it Works */}
                    <div className="card bg-blue-500/10 border-blue-500/20">
                        <div className="flex">
                            <ExclamationTriangleIcon className="w-6 h-6 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold text-blue-300 mb-2">How It Works</h3>
                                <ul className="text-blue-200 text-sm space-y-1">
                                    <li>• Add up to 5 trusted contacts</li>
                                    <li>• Include family, friends, or colleagues</li>
                                    <li>• They receive alerts during SOS</li>
                                    <li>• Numbers are stored securely on blockchain</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Best Practices */}
                    <div className="card bg-green-500/10 border-green-500/20">
                        <div className="flex">
                            <CheckCircleIcon className="w-6 h-6 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold text-green-300 mb-2">Best Practices</h3>
                                <ul className="text-green-200 text-sm space-y-1">
                                    <li>• Use international format (+country code)</li>
                                    <li>• Add contacts from different locations</li>
                                    <li>• Include at least one family member</li>
                                    <li>• Keep contacts list updated regularly</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Emergency Section */}
                <div className="mt-8 card bg-red-500/10 border-red-500/20">
                    <div className="flex">
                        <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mr-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-red-300 mb-2">Emergency Contact Ready</h3>
                            <p className="text-red-200 mb-4">
                                {contacts.length > 0
                                    ? `Your ${contacts.length} trusted contact${contacts.length > 1 ? 's' : ''} will be notified when you trigger an emergency alert.`
                                    : 'Add at least one contact to enable emergency notifications.'
                                }
                            </p>
                            {contacts.length > 0 && (
                                <button
                                    onClick={() => window.location.href = '/emergency'}
                                    className="bg-emergency hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors emergency-pulse"
                                >
                                    Test Emergency SOS
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrustedContacts;