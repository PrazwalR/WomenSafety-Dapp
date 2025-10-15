// Helper utility functions

// Validate phone number
export const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[+]?[1-9][\d]{3,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validate Ethereum address
export const validateAddress = (address) => {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
};

// Validate form data
export const validateComplaintForm = (formData) => {
    const errors = {};

    if (!formData.incidentType && formData.incidentType !== 0) {
        errors.incidentType = 'Please select an incident type';
    }

    if (!formData.severity && formData.severity !== 0) {
        errors.severity = 'Please select severity level';
    }

    if (!formData.description || formData.description.trim().length < 50) {
        errors.description = 'Description must be at least 50 characters';
    }

    if (!formData.location || formData.location.trim().length < 3) {
        errors.location = 'Please provide a valid location';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';

    // Remove all non-numeric characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+')) {
        return cleaned;
    }

    // Add country code if not present
    if (cleaned.length === 10) {
        return `+1${cleaned}`;
    }

    return `+${cleaned}`;
};

// Format Ethereum address for display
export const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Get location using browser's geolocation API
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                resolve({
                    latitude,
                    longitude,
                    formatted: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                });
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject(new Error('Location access denied by user'));
                        break;
                    case error.POSITION_UNAVAILABLE:
                        reject(new Error('Location information unavailable'));
                        break;
                    case error.TIMEOUT:
                        reject(new Error('Location request timeout'));
                        break;
                    default:
                        reject(new Error('Unknown location error'));
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes
            }
        );
    });
};

// Convert severity number to color class
export const getSeverityColor = (severity) => {
    switch (severity) {
        case 0:
            return 'text-green-400 bg-green-400/10';
        case 1:
            return 'text-yellow-400 bg-yellow-400/10';
        case 2:
            return 'text-orange-400 bg-orange-400/10';
        case 3:
            return 'text-red-400 bg-red-400/10';
        default:
            return 'text-gray-400 bg-gray-400/10';
    }
};

// Convert status number to color class
export const getStatusColor = (status) => {
    switch (status) {
        case 0:
            return 'text-yellow-400 bg-yellow-400/10';
        case 1:
            return 'text-blue-400 bg-blue-400/10';
        case 2:
            return 'text-green-400 bg-green-400/10';
        default:
            return 'text-gray-400 bg-gray-400/10';
    }
};

// Truncate text for display
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (fallbackError) {
            document.body.removeChild(textArea);
            return false;
        }
    }
};

// Debounce function for search inputs
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

// Generate random ID
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// Check if object is empty
export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

// Deep clone object
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

// Format file size
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Check if mobile device
export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
};

// Scroll to element
export const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

// Local storage helpers
export const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },
};

// Export helper configuration object
const helpersConfig = {
    validatePhoneNumber,
    validateAddress,
    validateComplaintForm,
    formatPhoneNumber,
    getCurrentLocation,
    getSeverityColor,
    getStatusColor,
    truncateText,
    copyToClipboard,
    debounce,
    generateId,
    isEmpty,
    deepClone,
    formatFileSize,
    isMobile,
    scrollToElement,
    storage,
};

export default helpersConfig;