# Women Safety DApp - Network Configuration

## ✅ SEPOLIA TESTNET CONFIGURED

This project is **CONFIRMED** to be configured for **Sepolia Ethereum Testnet**, not mainnet or any other network.

### Network Details:
- **Primary Network**: Sepolia Testnet
- **Chain ID**: `0xaa36a7` (11155111 in decimal)
- **Network Name**: Sepolia Test Network
- **Currency**: SepoliaETH (ETH)

### Configuration Files:
- `src/contracts/contractConfig.js` - Primary network configuration
- `src/context/Web3Context.jsx` - Automatic network switching

### Key Features:
1. **Automatic Network Detection**: App checks if user is on Sepolia
2. **Automatic Network Switching**: Prompts user to switch to Sepolia if needed
3. **Network Change Handling**: Responds to manual network changes
4. **Safe Testing Environment**: Uses testnet to avoid real ETH transactions

### Contract Information:
- **Contract Address**: 0x282c3BeF7c2733c1B89940efFac611cf623276e9
- **Network**: Sepolia Testnet
- **Admin Address**: 0x8ba1f109551bD432803012645Hac136c60143dF

### RPC Endpoints (Fallback):
- `https://rpc.sepolia.org`
- `https://ethereum-sepolia.blockpi.network/v1/rpc/public`
- Infura Sepolia endpoint (requires API key)

### Testing:
- Application running on: http://localhost:3001
- All components compiled successfully
- Ready for MetaMask integration on Sepolia testnet

---
**IMPORTANT**: This is a TESTNET configuration. No real ETH will be used. Only Sepolia testnet ETH (free) is required for transactions.