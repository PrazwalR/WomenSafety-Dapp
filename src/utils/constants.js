// Incident Types (matches contract enum)
export const INCIDENT_TYPES = {
    0: 'Harassment',
    1: 'Stalking',
    2: 'Assault',
    3: 'Domestic Violence',
    4: 'Cyber Bullying',
    5: 'Other',
};

export const INCIDENT_TYPE_OPTIONS = [
    { value: 0, label: 'Harassment' },
    { value: 1, label: 'Stalking' },
    { value: 2, label: 'Assault' },
    { value: 3, label: 'Domestic Violence' },
    { value: 4, label: 'Cyber Bullying' },
    { value: 5, label: 'Other' },
];

// Severity Levels (matches contract enum)
export const SEVERITY_LEVELS = {
    0: 'Low',
    1: 'Medium',
    2: 'High',
    3: 'Critical',
};

export const SEVERITY_OPTIONS = [
    { value: 0, label: 'Low', color: 'text-green-400' },
    { value: 1, label: 'Medium', color: 'text-yellow-400' },
    { value: 2, label: 'High', color: 'text-orange-400' },
    { value: 3, label: 'Critical', color: 'text-red-400' },
];

// Complaint Status (matches contract enum)
export const COMPLAINT_STATUS = {
    0: 'Pending',
    1: 'In Progress',
    2: 'Resolved',
};

export const STATUS_OPTIONS = [
    { value: 0, label: 'Pending', color: 'bg-yellow-500' },
    { value: 1, label: 'In Progress', color: 'bg-blue-500' },
    { value: 2, label: 'Resolved', color: 'bg-green-500' },
];

// Error Messages
export const ERROR_MESSAGES = {
    WALLET_NOT_FOUND: 'Please install MetaMask to use this application',
    CONNECTION_REJECTED: 'Connection to wallet was rejected',
    USER_NOT_REGISTERED: 'Please register first to access this feature',
    NOT_ADMIN: 'You are not authorized to access this page',
    TRANSACTION_FAILED: 'Transaction failed. Please try again.',
    INVALID_INPUT: 'Please check your input and try again',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    MAX_CONTACTS_REACHED: 'Maximum 5 trusted contacts allowed',
};

// Success Messages
export const SUCCESS_MESSAGES = {
    WALLET_CONNECTED: 'Wallet connected successfully!',
    USER_REGISTERED: 'Registration successful!',
    COMPLAINT_FILED: 'Complaint filed successfully!',
    EMERGENCY_SENT: 'Emergency alert sent to all trusted contacts!',
    CONTACT_ADDED: 'Trusted contact added successfully!',
    CONTACT_REMOVED: 'Trusted contact removed successfully!',
    STATUS_UPDATED: 'Complaint status updated successfully!',
    EMERGENCY_RESOLVED: 'Emergency marked as resolved!',
};

// App Configuration
export const APP_CONFIG = {
    MAX_TRUSTED_CONTACTS: 5,
    MIN_DESCRIPTION_LENGTH: 50,
    PHONE_REGEX: /^[+]?[1-9][\d]{3,14}$/,
    ETHEREUM_ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
};

// Export configuration object
const constantsConfig = {
    INCIDENT_TYPES,
    INCIDENT_TYPE_OPTIONS,
    SEVERITY_LEVELS,
    SEVERITY_OPTIONS,
    COMPLAINT_STATUS,
    STATUS_OPTIONS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    APP_CONFIG,
};

export default constantsConfig;