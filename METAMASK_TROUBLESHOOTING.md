# 🔧 MetaMask Circuit Breaker Error - Troubleshooting Guide

## Error Details
You're experiencing a **MetaMask Circuit Breaker Error** during registration. This is a protective mechanism that activates when MetaMask detects network connectivity issues.

## 🛠️ Solutions (Try in Order)

### **Step 1: Reset MetaMask State**
1. **Close the DApp** completely
2. **Open MetaMask**
3. **Settings** → **Advanced** → **Reset Account** (This clears transaction history, not your wallet)
4. **Reconnect** to the DApp

### **Step 2: Check Network Configuration**
1. **Open MetaMask**
2. **Click Network Dropdown** (top of MetaMask)
3. **Ensure you're on "Sepolia test network"**
4. If not listed:
   - Click **"Add Network"**
   - Select **"Add a network manually"**
   - Fill in:
     - **Network Name**: `Sepolia Test Network`
     - **RPC URL**: `https://rpc.sepolia.org`
     - **Chain ID**: `11155111`
     - **Currency Symbol**: `ETH`
     - **Block Explorer**: `https://sepolia.etherscan.io`

### **Step 3: Clear Browser Cache**
1. **Chrome/Edge**: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. **Or manually**: Settings → Privacy → Clear browsing data → Cached images and files

### **Step 4: Get Sepolia Test ETH**
You need Sepolia ETH for gas fees:
1. **Visit Sepolia Faucet**: https://sepoliafaucet.com/
2. **Enter your wallet address**
3. **Request test ETH** (usually 0.1-0.5 ETH)
4. **Wait 1-2 minutes** for funds to arrive

### **Step 5: Try Alternative RPC**
If still failing, switch RPC endpoint:
1. **MetaMask** → **Settings** → **Networks** → **Sepolia**
2. **Change RPC URL** to: `https://ethereum-sepolia.blockpi.network/v1/rpc/public`
3. **Save and try again**

### **Step 6: Wait and Retry**
Circuit breaker usually resets automatically:
1. **Wait 2-3 minutes**
2. **Try registration again**
3. **Be patient** - don't spam the button

## 🔍 Enhanced Error Handling

I've updated the code with better error handling:
- ✅ **Automatic retry** mechanism (3 attempts)
- ✅ **Network validation** before transactions
- ✅ **Gas estimation** with fallback
- ✅ **Specific error messages** for different failure types
- ✅ **Circuit breaker detection** and user guidance

## 🚨 If Still Failing

### **Alternative Registration Method**
```javascript
// You can try registering via MetaMask directly:
// 1. Go to MetaMask
// 2. Send → Contract Interaction
// 3. Contract Address: 0x282c3BeF7c2733c1B89940efFac611cf623276e9
// 4. Function: registerUser()
// 5. Send transaction
```

### **Check Smart Contract**
Verify the contract is working:
1. **Visit**: https://sepolia.etherscan.io/address/0x282c3BeF7c2733c1B89940efFac611cf623276e9
2. **Check recent transactions**
3. **Ensure contract is active**

## 🆘 Emergency Contacts

If none of the above work:
1. **Check Sepolia Network Status**: https://sepolia.etherscan.io/
2. **MetaMask Support**: https://support.metamask.io/
3. **Try different browser** (Chrome, Firefox, Edge)
4. **Disable browser extensions** temporarily

## ✅ Success Indicators

Registration successful when you see:
- ✅ "Registration successful!" toast message
- ✅ Transaction hash in MetaMask
- ✅ Redirect to user dashboard
- ✅ "File New Complaint" button visible

---

**Note**: Sepolia testnet can be slower than mainnet. Be patient and don't retry too quickly, as this can trigger more circuit breaker errors.