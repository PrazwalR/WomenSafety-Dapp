import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, isSepoliaNetwork, switchToSepoliaNetwork } from '../contracts/contractConfig';
import WomenSafetyABI from '../contracts/WomenSafety.json';
import { ERROR_MESSAGES } from './constants';
import toast from 'react-hot-toast';

let provider = null;
let signer = null;
let contract = null;

// Utility function to handle MetaMask circuit breaker and retry
const retryWithDelay = async (fn, maxRetries = 3, delay = 2000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (error.message.includes('circuit breaker') && i < maxRetries - 1) {
                console.log(`Retry attempt ${i + 1} after circuit breaker error`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
};

// Reset provider and contract instances
export const resetConnections = () => {
    provider = null;
    signer = null;
    contract = null;
};

// Initialize provider
export const initializeProvider = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        return provider;
    }
    throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);
};

// Get signer
export const getSigner = async () => {
    if (!provider) {
        initializeProvider();
    }
    signer = await provider.getSigner();
    return signer;
};

// Get contract instance
export const getContract = async () => {
    if (!contract) {
        const contractSigner = await getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, WomenSafetyABI.abi, contractSigner);
    }
    return contract;
};

// Get read-only contract instance
export const getReadOnlyContract = () => {
    if (!provider) {
        initializeProvider();
    }
    return new ethers.Contract(CONTRACT_ADDRESS, WomenSafetyABI.abi, provider);
};

// Connect wallet
export const connectWallet = async () => {
    try {
        if (!window.ethereum) {
            throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);
        }

        // Reset any stale connections
        resetConnections();

        const accounts = await retryWithDelay(async () => {
            return await window.ethereum.request({
                method: 'eth_requestAccounts',
            });
        });

        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }

        // Check if on Sepolia network
        const isCorrectNetwork = await isSepoliaNetwork();
        if (!isCorrectNetwork) {
            toast.loading('Switching to Sepolia network...', { id: 'network' });
            await switchToSepoliaNetwork();
            toast.success('Connected to Sepolia network', { id: 'network' });
        }

        // Initialize provider and signer
        initializeProvider();
        await getSigner();

        return accounts[0];
    } catch (error) {
        console.error('Error connecting wallet:', error);
        throw error;
    }
};

// Check if wallet is connected
export const checkIfWalletIsConnected = async () => {
    try {
        if (!window.ethereum) {
            return null;
        }

        const accounts = await window.ethereum.request({
            method: 'eth_accounts',
        });

        if (accounts.length > 0) {
            await initializeProvider();
            return accounts[0];
        }
        return null;
    } catch (error) {
        console.error('Error checking wallet connection:', error);
        return null;
    }
};

// Register user
export const registerUser = async () => {
    try {
        // First check if we're on the correct network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0xaa36a7') {
            throw new Error('Please switch to Sepolia testnet to register');
        }

        // Get fresh contract instance
        const contractInstance = await getContract();

        // Add gas estimation for better error handling
        try {
            const gasEstimate = await contractInstance.registerUser.estimateGas();
            const tx = await contractInstance.registerUser({
                gasLimit: gasEstimate + 10000n, // Add buffer
            });

            toast.loading('Transaction submitted, waiting for confirmation...', { id: 'registration' });
            const receipt = await tx.wait(1); // Wait for 1 confirmation

            toast.success('Registration successful!', { id: 'registration' });
            return receipt;
        } catch (gasError) {
            // If gas estimation fails, try with default gas
            console.warn('Gas estimation failed, trying with default gas:', gasError);
            const tx = await contractInstance.registerUser({
                gasLimit: 300000n, // Default gas limit
            });

            toast.loading('Transaction submitted, waiting for confirmation...', { id: 'registration' });
            const receipt = await tx.wait(1);

            toast.success('Registration successful!', { id: 'registration' });
            return receipt;
        }
    } catch (error) {
        console.error('Error registering user:', error);

        // Handle specific error types
        if (error.message.includes('circuit breaker')) {
            toast.error('Network connectivity issue. Please try again in a few seconds.', { id: 'registration' });
        } else if (error.message.includes('user rejected')) {
            toast.error('Transaction cancelled by user', { id: 'registration' });
        } else if (error.message.includes('insufficient funds')) {
            toast.error('Insufficient ETH for transaction. Please add Sepolia testnet ETH.', { id: 'registration' });
        } else if (error.message.includes('already registered')) {
            toast.error('User already registered', { id: 'registration' });
        } else if (error.message.includes('network')) {
            toast.error('Please switch to Sepolia testnet', { id: 'registration' });
        } else {
            toast.error('Registration failed: ' + (error.reason || error.message), { id: 'registration' });
        }

        throw error;
    }
};

// Check if user is registered
export const checkUserRegistration = async (address) => {
    try {
        const contractInstance = getReadOnlyContract();
        return await contractInstance.isUserRegistered(address);
    } catch (error) {
        console.error('Error checking user registration:', error);
        return false;
    }
};

// Check if user is admin
export const checkUserAdmin = async (address) => {
    try {
        const contractInstance = getReadOnlyContract();
        return await contractInstance.isUserAdmin(address);
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

// File complaint
export const fileComplaint = async (complaintData) => {
    try {
        const contractInstance = await getContract();
        const tx = await contractInstance.fileComplaint(
            complaintData.incidentType,
            complaintData.severity,
            complaintData.description,
            complaintData.location
        );
        const receipt = await tx.wait();

        toast.success('Complaint filed successfully!');
        return receipt;
    } catch (error) {
        console.error('Error filing complaint:', error);
        toast.error('Failed to file complaint: ' + error.message);
        throw error;
    }
};

// Get user complaints
export const getUserComplaints = async () => {
    try {
        const contractInstance = await getContract();
        return await contractInstance.getMyComplaints();
    } catch (error) {
        console.error('Error fetching user complaints:', error);
        throw error;
    }
};

// Add trusted contact
export const addTrustedContact = async (phoneNumber) => {
    try {
        const contractInstance = await getContract();
        const tx = await contractInstance.addTrustedContact(phoneNumber);
        const receipt = await tx.wait();

        toast.success('Trusted contact added successfully!');
        return receipt;
    } catch (error) {
        console.error('Error adding trusted contact:', error);
        toast.error('Failed to add contact: ' + error.message);
        throw error;
    }
};

// Remove trusted contact
export const removeTrustedContact = async (index) => {
    try {
        const contractInstance = await getContract();
        const tx = await contractInstance.removeTrustedContact(index);
        const receipt = await tx.wait();

        toast.success('Trusted contact removed successfully!');
        return receipt;
    } catch (error) {
        console.error('Error removing trusted contact:', error);
        toast.error('Failed to remove contact: ' + error.message);
        throw error;
    }
};

// Get trusted contacts
export const getTrustedContacts = async (address) => {
    try {
        const contractInstance = getReadOnlyContract();
        return await contractInstance.getTrustedContacts(address);
    } catch (error) {
        console.error('Error fetching trusted contacts:', error);
        throw error;
    }
};

// Declare emergency
export const declareEmergency = async (location, message) => {
    try {
        const contractInstance = await getContract();
        const tx = await contractInstance.declareEmergency(location, message);
        const receipt = await tx.wait();

        toast.success('Emergency alert sent to all trusted contacts!');
        return receipt;
    } catch (error) {
        console.error('Error declaring emergency:', error);
        toast.error('Failed to send emergency alert: ' + error.message);
        throw error;
    }
};

// Admin: Get all complaints
export const getAllComplaints = async () => {
    try {
        const contractInstance = await getContract();
        return await contractInstance.getAllComplaints();
    } catch (error) {
        console.error('Error fetching all complaints:', error);
        throw error;
    }
};

// Admin: Get all emergencies
export const getAllEmergencies = async () => {
    try {
        const contractInstance = await getContract();
        return await contractInstance.getAllEmergencies();
    } catch (error) {
        console.error('Error fetching all emergencies:', error);
        throw error;
    }
};

// Admin: Update complaint status
export const updateComplaintStatus = async (complaintId, status, adminResponse) => {
    try {
        const contractInstance = await getContract();
        const tx = await contractInstance.updateComplaintStatus(
            complaintId,
            status,
            adminResponse
        );
        const receipt = await tx.wait();

        toast.success('Complaint status updated successfully!');
        return receipt;
    } catch (error) {
        console.error('Error updating complaint status:', error);
        toast.error('Failed to update status: ' + error.message);
        throw error;
    }
};

// Admin: Resolve emergency
export const resolveEmergency = async (emergencyId) => {
    try {
        const contractInstance = await getContract();
        const tx = await contractInstance.resolveEmergency(emergencyId);
        const receipt = await tx.wait();

        toast.success('Emergency marked as resolved!');
        return receipt;
    } catch (error) {
        console.error('Error resolving emergency:', error);
        toast.error('Failed to resolve emergency: ' + error.message);
        throw error;
    }
};

// Get complaint statistics
export const getComplaintStats = async () => {
    try {
        const contractInstance = getReadOnlyContract();
        return await contractInstance.getComplaintStats();
    } catch (error) {
        console.error('Error fetching complaint stats:', error);
        throw error;
    }
};

// Format address for display
export const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format timestamp
export const formatTimestamp = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

// Export ethereum configuration object
const ethereumConfig = {
    connectWallet,
    checkIfWalletIsConnected,
    registerUser,
    checkUserRegistration,
    checkUserAdmin,
    fileComplaint,
    getUserComplaints,
    addTrustedContact,
    removeTrustedContact,
    getTrustedContacts,
    declareEmergency,
    getAllComplaints,
    getAllEmergencies,
    updateComplaintStatus,
    resolveEmergency,
    getComplaintStats,
    formatAddress,
    formatTimestamp,
};

export default ethereumConfig;