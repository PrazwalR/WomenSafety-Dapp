export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
export const ADMIN_ADDRESS = process.env.REACT_APP_ADMIN_ADDRESS;

// Sepolia Testnet Configuration (Primary Network)
export const NETWORK_CONFIG = {
    chainId: '0xaa36a7', // Sepolia testnet chain ID
    chainName: 'Sepolia Test Network',
    nativeCurrency: {
        name: 'SepoliaETH',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: [
        'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
        'https://rpc.sepolia.org',
        'https://ethereum-sepolia.blockpi.network/v1/rpc/public'
    ],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};

// Alternative: Ethereum Mainnet (NOT RECOMMENDED for testing)
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
    SEPOLIA: NETWORK_CONFIG,
    MAINNET: MAINNET_CONFIG,
};

export const isCorrectNetwork = (chainId) => {
    return chainId === NETWORK_CONFIG.chainId;
};

// Check if current network is Sepolia
export const isSepoliaNetwork = async () => {
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        return chainId === NETWORK_CONFIG.chainId;
    } catch (error) {
        console.error('Error checking network:', error);
        return false;
    }
};

// Switch to Sepolia network (alias for switchToSepolia)
export const switchToSepoliaNetwork = async () => {
    return switchToSepolia();
};

export const switchToSepolia = async () => {
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
                console.error('Failed to add Sepolia network:', addError);
                throw addError;
            }
        } else {
            console.error('Failed to switch to Sepolia:', switchError);
            throw switchError;
        }
    }
};

const contractConfig = {
    CONTRACT_ADDRESS,
    ADMIN_ADDRESS,
    NETWORK_CONFIG,
    MAINNET_CONFIG,
    SUPPORTED_NETWORKS,
    isCorrectNetwork,
    isSepoliaNetwork,
    switchToSepolia,
    switchToSepoliaNetwork,
};

export default contractConfig;