# Women Safety DApp

A blockchain-based Women Safety DApp built with React and Ethereum smart contracts. This decentralized application allows users to file complaints, manage trusted contacts, and trigger emergency SOS alerts securely on the blockchain.

## 🚀 Features

### User Features
- **Secure Wallet Connection**: MetaMask integration for Web3 authentication
- **User Registration**: Register on the blockchain to access platform features
- **Complaint Management**: File incident reports with different severity levels
- **Trusted Contacts**: Manage up to 5 emergency contacts
- **Emergency SOS**: One-click emergency alerts to trusted contacts
- **Report Tracking**: View and track complaint status and admin responses

### Admin Features
- **Admin Dashboard**: Overview of platform statistics and activity
- **Complaint Management**: Review, update status, and respond to complaints
- **Emergency Response**: Monitor and resolve emergency alerts
- **Real-time Notifications**: Immediate alerts for high-priority cases

### Technical Features
- **Blockchain Integration**: Ethereum smart contract integration
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live data from blockchain
- **Secure Storage**: All data encrypted and stored on blockchain
- **Error Handling**: Comprehensive error handling and user feedback

## 🛠 Technology Stack

- **Frontend**: React 18, React Router DOM
- **Styling**: Tailwind CSS, Heroicons
- **Blockchain**: Ethereum, ethers.js v6
- **Notifications**: React Hot Toast
- **Development**: Create React App

## 📋 Prerequisites

- Node.js (v14 or higher)
- MetaMask browser extension
- Ethereum testnet account with test ETH

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd women-safety-dapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_CONTRACT_ADDRESS=0x282c3BeF7c2733c1B89940efFac611cf623276e9
   REACT_APP_ADMIN_ADDRESS=0x7b535bde21610AD4Eaca864043C1b2E0ceB85510
   ```

4. **Install Tailwind CSS**
   ```bash
   npx tailwindcss init -p
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

The app will open at `http://localhost:3000`

## 🎯 Usage

### For Users

1. **Connect Wallet**
   - Click "Connect Wallet" in the top navigation
   - Approve connection in MetaMask

2. **Register**
   - Click "Register Now" on the home page
   - Confirm transaction in MetaMask

3. **File a Complaint**
   - Navigate to "File Complaint"
   - Fill in incident details
   - Select severity level and incident type
   - Submit complaint

4. **Manage Trusted Contacts**
   - Go to "Trusted Contacts"
   - Add up to 5 phone numbers
   - Contacts will be alerted during emergencies

5. **Emergency SOS**
   - Click "Emergency SOS" for immediate alerts
   - Confirm your location
   - Send alert to all trusted contacts

### For Admins

1. **Access Admin Panel**
   - Connect with admin wallet address
   - Navigate to admin dashboard

2. **Manage Complaints**
   - Review pending complaints
   - Update complaint status
   - Provide admin responses

3. **Handle Emergencies**
   - Monitor active emergency alerts
   - Respond to high-priority cases
   - Mark emergencies as resolved

## 🏗 Project Structure

```
women-safety-dapp/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Home.jsx
│   │   ├── UserDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── ComplaintForm.jsx
│   │   ├── TrustedContacts.jsx
│   │   ├── EmergencySOS.jsx
│   │   ├── ViewReports.jsx
│   │   ├── AdminReports.jsx
│   │   └── AdminEmergencies.jsx
│   ├── contracts/
│   │   ├── WomenSafety.json
│   │   └── contractConfig.js
│   ├── context/
│   │   └── Web3Context.jsx
│   ├── utils/
│   │   ├── ethereum.js
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── index.js
├── .env
├── package.json
└── README.md
```

## 🔐 Smart Contract Integration

The DApp integrates with a deployed Ethereum smart contract with the following key functions:

- `registerUser()` - Register new user
- `fileComplaint()` - Submit complaint
- `declareEmergency()` - Trigger SOS alert
- `addTrustedContact()` - Add emergency contact
- `updateComplaintStatus()` - Admin function to update complaints
- `getAllComplaints()` - Admin function to fetch all complaints
- `getAllEmergencies()` - Admin function to fetch emergencies

## 🎨 Design System

### Colors
- **Primary**: Purple (#8b5cf6)
- **Secondary**: Pink (#ec4899)
- **Dark Theme**: Gray-900 background
- **Emergency**: Red (#ef4444)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)

### Components
- **Cards**: Dark background with subtle borders
- **Buttons**: Gradient primary, solid secondary
- **Forms**: Dark inputs with purple focus states
- **Navigation**: Sticky top navigation with mobile support

## 🚨 Security Features

- **Wallet Authentication**: Secure Web3 wallet connection
- **Role-based Access**: User and admin role separation
- **Input Validation**: Client-side and smart contract validation
- **Error Handling**: Comprehensive error catching and user feedback
- **Privacy Protection**: Encrypted data storage on blockchain

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🧪 Testing

### Manual Testing Checklist

#### User Flow
- [ ] Wallet connection
- [ ] User registration
- [ ] Complaint submission
- [ ] Trusted contacts management
- [ ] Emergency SOS functionality
- [ ] Report viewing and filtering

#### Admin Flow
- [ ] Admin dashboard access
- [ ] Complaint management
- [ ] Status updates with responses
- [ ] Emergency monitoring
- [ ] Statistics viewing

### Testing with MetaMask

1. Connect to Ethereum testnet (Holesky testnet)
2. Ensure test ETH in wallet for gas fees (use faucets listed in NETWORK_CONFIGURATION.md)
3. Test all contract interactions
4. Verify transaction confirmations

## 🐛 Troubleshooting

### Common Issues

**MetaMask not connecting**
- Ensure MetaMask is installed and unlocked
- Check if connected to correct network
- Refresh page and try again

**Transaction failures**
- Check if user is registered
- Verify sufficient ETH for gas fees
- Ensure correct network connection

**Contract errors**
- Verify contract address in .env file
- Check if contract is deployed on current network
- Ensure wallet has required permissions

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Hosting Platform

The build folder can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- IPFS (for full decentralization)

### Environment Variables for Production

```env
REACT_APP_CONTRACT_ADDRESS=<deployed_contract_address>
REACT_APP_ADMIN_ADDRESS=<admin_wallet_address>
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Emergency Contacts

For immediate emergencies, always contact:
- **Police**: 911 (US) or local emergency number
- **National Domestic Violence Hotline**: 1-800-799-7233
- **Crisis Text Line**: Text HOME to 741741

## 📞 Support

For technical support or questions about the DApp:
- Create an issue on GitHub
- Contact the development team

## 🙏 Acknowledgments

- Ethereum Foundation for blockchain infrastructure
- MetaMask for wallet integration
- Tailwind CSS for styling framework
- React team for the frontend framework
- All contributors and supporters of women's safety initiatives

---

**⚠️ Important Security Notice**: This DApp is designed to supplement, not replace, traditional emergency services. In case of immediate danger, always contact local emergency services first.

**🔒 Privacy Notice**: All data is stored on the blockchain and is publicly visible. Personal information should be limited to what's necessary for safety purposes.