import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const {
        isConnected,
        isAdmin,
        loading,
        connectWallet,
        disconnect,
        getFormattedAddress,
    } = useWeb3();

    const handleConnectWallet = async () => {
        try {
            await connectWallet();
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    };

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    const userNavigation = [
        { name: 'Dashboard', href: '/dashboard', adminOnly: false },
        { name: 'File Complaint', href: '/complaint', adminOnly: false },
        { name: 'Trusted Contacts', href: '/contacts', adminOnly: false },
        { name: 'Emergency SOS', href: '/emergency', adminOnly: false },
        { name: 'My Reports', href: '/reports', adminOnly: false },
    ];

    const adminNavigation = [
        { name: 'Admin Dashboard', href: '/admin', adminOnly: true },
        { name: 'All Complaints', href: '/admin/complaints', adminOnly: true },
        { name: 'Emergencies', href: '/admin/emergencies', adminOnly: true },
    ];

    const navigationItems = isAdmin
        ? [...userNavigation, ...adminNavigation]
        : userNavigation.filter(item => !item.adminOnly);

    return (
        <nav className="bg-dark-lighter border-b border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">WS</span>
                            </div>
                            <span className="text-white font-bold text-xl hidden sm:block">
                                Women Safety DApp
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {isConnected && (
                                <>
                                    {navigationItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath(item.href)
                                                    ? 'bg-primary text-white'
                                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Wallet Connection */}
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            {isConnected ? (
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-sm text-gray-300">
                                            {getFormattedAddress()}
                                        </span>
                                        {isAdmin && (
                                            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={disconnect}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleConnectWallet}
                                    disabled={loading}
                                    className="btn-primary flex items-center space-x-2"
                                >
                                    {loading && <div className="loading-spinner"></div>}
                                    <span>
                                        {loading ? 'Connecting...' : 'Connect Wallet'}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="bg-gray-700 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        >
                            {isMenuOpen ? (
                                <XMarkIcon className="block h-6 w-6" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-dark-lighter border-t border-gray-700">
                        {isConnected && (
                            <>
                                {navigationItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActivePath(item.href)
                                                ? 'bg-primary text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="border-t border-gray-700 pt-4 pb-3">
                                    <div className="flex items-center px-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                        <span className="text-sm text-gray-300">
                                            {getFormattedAddress()}
                                        </span>
                                        {isAdmin && (
                                            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full ml-2">
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            disconnect();
                                            setIsMenuOpen(false);
                                        }}
                                        className="mt-3 w-full text-left px-3 py-2 text-red-400 hover:text-red-300 text-base font-medium"
                                    >
                                        Disconnect Wallet
                                    </button>
                                </div>
                            </>
                        )}

                        {!isConnected && (
                            <div className="px-3 py-2">
                                <button
                                    onClick={() => {
                                        handleConnectWallet();
                                        setIsMenuOpen(false);
                                    }}
                                    disabled={loading}
                                    className="w-full btn-primary flex items-center justify-center space-x-2"
                                >
                                    {loading && <div className="loading-spinner"></div>}
                                    <span>
                                        {loading ? 'Connecting...' : 'Connect Wallet'}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;