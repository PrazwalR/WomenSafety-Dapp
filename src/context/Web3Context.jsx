import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    connectWallet,
    checkIfWalletIsConnected,
    checkUserRegistration,
    checkUserAdmin,
    registerUser,
} from '../utils/ethereum';
import { ADMIN_ADDRESS, NETWORK_CONFIG, switchToHoleskyNetwork, isHoleskyNetwork } from '../contracts/contractConfig';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import toast from 'react-hot-toast';

const Web3Context = createContext();

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
};

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Check wallet connection on component mount
    useEffect(() => {
        checkConnection();
        setupEventListeners();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Check user status when account changes
    useEffect(() => {
        if (account) {
            checkUserStatus();
        } else {
            setIsRegistered(false);
            setIsAdmin(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account]);

    // Check if wallet is already connected
    const checkConnection = async () => {
        try {
            setInitialLoading(true);
            const connectedAccount = await checkIfWalletIsConnected();

            if (connectedAccount) {
                setAccount(connectedAccount);
                setIsConnected(true);
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    // Setup MetaMask event listeners
    const setupEventListeners = () => {
        if (typeof window !== 'undefined' && window.ethereum) {
            // Account changed
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    handleDisconnect();
                } else {
                    setAccount(accounts[0]);
                }
            });

            // Chain changed
            window.ethereum.on('chainChanged', async (chainId) => {
                // Check if switched to Holesky
                if (chainId === NETWORK_CONFIG.chainId) {
                    toast.success('Connected to Holesky network');
                } else {
                    toast.error('Please switch to Holesky network for full functionality');
                }
                window.location.reload();
            });            // Disconnect
            window.ethereum.on('disconnect', () => {
                handleDisconnect();
            });
        }
    };

    // Check user registration and admin status
    const checkUserStatus = async () => {
        try {
            if (!account) return;

            const [registered, admin] = await Promise.all([
                checkUserRegistration(account),
                checkUserAdmin(account),
            ]);

            setIsRegistered(registered);
            setIsAdmin(admin);
        } catch (error) {
            console.error('Error checking user status:', error);
        }
    };

    // Connect to MetaMask
    const handleConnect = async () => {
        try {
            setLoading(true);
            const connectedAccount = await connectWallet();

            // Check if user is on Holesky network
            const isCorrectNetwork = await isHoleskyNetwork();
            if (!isCorrectNetwork) {
                toast.loading('Switching to Holesky network...', { id: 'network-switch' });
                await switchToHoleskyNetwork();
                toast.success('Connected to Holesky network', { id: 'network-switch' });
            } setAccount(connectedAccount);
            setIsConnected(true);

            toast.success(SUCCESS_MESSAGES.WALLET_CONNECTED);
            return connectedAccount;
        } catch (error) {
            console.error('Connection failed:', error);

            if (error.message.includes('User rejected')) {
                toast.error(ERROR_MESSAGES.CONNECTION_REJECTED);
            } else if (error.message.includes('network')) {
                toast.error('Please switch to Holesky network to continue');
            } else {
                toast.error(error.message || ERROR_MESSAGES.WALLET_NOT_FOUND);
            }

            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Disconnect wallet
    const handleDisconnect = () => {
        setAccount(null);
        setIsConnected(false);
        setIsRegistered(false);
        setIsAdmin(false);
        toast.success('Wallet disconnected');
    };

    // Register new user
    const handleRegisterUser = async () => {
        try {
            if (!account) {
                throw new Error('Please connect your wallet first');
            }

            setLoading(true);
            await registerUser();

            // Refresh user status
            await checkUserStatus();

            toast.success(SUCCESS_MESSAGES.USER_REGISTERED);
        } catch (error) {
            console.error('Registration failed:', error);

            if (error.message.includes('already registered')) {
                toast.error('User is already registered');
            } else {
                toast.error('Registration failed: ' + error.message);
            }

            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Check if current user is the main admin
    const isMainAdmin = () => {
        return account && account.toLowerCase() === ADMIN_ADDRESS?.toLowerCase();
    };

    // Require wallet connection
    const requireConnection = () => {
        if (!isConnected || !account) {
            toast.error('Please connect your wallet first');
            return false;
        }
        return true;
    };

    // Require user registration
    const requireRegistration = () => {
        if (!requireConnection()) return false;

        if (!isRegistered) {
            toast.error(ERROR_MESSAGES.USER_NOT_REGISTERED);
            return false;
        }
        return true;
    };

    // Require admin access
    const requireAdmin = () => {
        if (!requireConnection()) return false;

        if (!isAdmin) {
            toast.error(ERROR_MESSAGES.NOT_ADMIN);
            return false;
        }
        return true;
    };

    // Get formatted account address
    const getFormattedAddress = () => {
        if (!account) return '';
        return `${account.slice(0, 6)}...${account.slice(-4)}`;
    };

    const contextValue = {
        // State
        account,
        isConnected,
        isRegistered,
        isAdmin,
        loading,
        initialLoading,

        // Functions
        connectWallet: handleConnect,
        disconnect: handleDisconnect,
        registerUser: handleRegisterUser,
        checkUserStatus,

        // Helper functions
        isMainAdmin,
        requireConnection,
        requireRegistration,
        requireAdmin,
        getFormattedAddress,

        // Status checks
        canAccessUserFeatures: isConnected && isRegistered,
        canAccessAdminFeatures: isConnected && isAdmin,
        needsRegistration: isConnected && !isRegistered,
    };

    return (
        <Web3Context.Provider value={contextValue}>
            {children}
        </Web3Context.Provider>
    );
};

export default Web3Context;