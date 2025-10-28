export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
export const ADMIN_ADDRESS = process.env.REACT_APP_ADMIN_ADDRESS;

// Holesky Testnet Configuration (Primary Network)
export const NETWORK_CONFIG = {
    chainId: '0x4268', // Holesky testnet chain ID (17000 in decimal)
    chainName: 'Holesky Test Network',
    nativeCurrency: {
        name: 'HoleskyETH',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: [
        'https://ethereum-holesky.blockpi.network/v1/rpc/public',
        'https://rpc.holesky.ethpandaops.io',
        'https://holesky.drpc.org'
    ],
    blockExplorerUrls: ['https://holesky.etherscan.io/'],
};// Alternative: Ethereum Mainnet (NOT RECOMMENDED for testing)
export const MAINNET_CONFIG = {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
    blockExplorerUrls: ['https://etherscan.io/'],
};

// Network detection and switching utilities
export const SUPPORTED_NETWORKS = {
    HOLESKY: NETWORK_CONFIG,
    MAINNET: MAINNET_CONFIG,
};

export const isCorrectNetwork = (chainId) => {
    return chainId === NETWORK_CONFIG.chainId;
};

// Check if current network is Holesky
export const isHoleskyNetwork = async () => {
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        return chainId === NETWORK_CONFIG.chainId;
    } catch (error) {
        console.error('Error checking network:', error);
        return false;
    }
};

// Legacy function name for backward compatibility
export const isSepoliaNetwork = async () => {
    return isHoleskyNetwork();
};

// Switch to Holesky network
export const switchToHoleskyNetwork = async () => {
    return switchToHolesky();
};

// Legacy function name for backward compatibility
export const switchToSepoliaNetwork = async () => {
    return switchToHolesky();
};

export const switchToHolesky = async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORK_CONFIG.chainId }],
        });
    } catch (switchError) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [NETWORK_CONFIG],
                });
            } catch (addError) {
                console.error('Failed to add Holesky network:', addError);
                throw addError;
            }
        } else {
            console.error('Failed to switch to Holesky:', switchError);
            throw switchError;
        }
    }
};

// Legacy alias
export const switchToSepolia = switchToHolesky;

const contractConfig = {
    CONTRACT_ADDRESS,
    ADMIN_ADDRESS,
    NETWORK_CONFIG,
    MAINNET_CONFIG,
    SUPPORTED_NETWORKS,
    isCorrectNetwork,
    isHoleskyNetwork,
    isSepoliaNetwork, // Legacy compatibility
    switchToHolesky,
    switchToHoleskyNetwork,
    switchToSepolia, // Legacy compatibility
    switchToSepoliaNetwork, // Legacy compatibility
};

export default contractConfig;