import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    User,
    LogOut,
    X,
    Home,
    Info,
    Package,
    LogIn,
    UserPlus,
    Menu,
    Droplets,
    Wrench,
    ChevronDown
} from "lucide-react";

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const colors = {
    primary: '#00A9FF',
    secondary: '#89CFF3',
    accent: '#A0E9FF',
    background: '#CDF5FD',
    text: '#0B0C10',
};

const NavBar = () => {
    const { count } = useCart();
    const { user, isAuthenticated, logoutUser } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeLink, setActiveLink] = useState('/home');

    const navigate = useNavigate();

    // Close dropdown and mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {

            if (
                isDropdownOpen &&
                !event.target.closest('.user-dropdown')
            ) {
                setIsDropdownOpen(false);
            }

            if (
                isMenuOpen &&
                !event.target.closest('.mobile-menu') &&
                !event.target.closest('.mobile-menu-button')
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
        };
    }, [isDropdownOpen, isMenuOpen]);

    // Navigation handler
    const handleNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
        setActiveLink(path);
    };

    // User button action
    const handleUserAction = () => {
        if (isAuthenticated) {
            setIsDropdownOpen(!isDropdownOpen);
        } else {
            navigate('/login');
        }
    };

    // Logout
    const handleLogout = async () => {
        await logoutUser();

        setIsDropdownOpen(false);
        setIsMenuOpen(false);

        navigate("/login", { replace: true });
    };

    // Toggle mobile menu
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Main navigation links
    const navLinks = [
        {
            path: '/home',
            label: 'Home',
            icon: Home
        },
        {
            path: '/products',
            label: 'Products',
            icon: Droplets
        },
        {
            path: '/services',
            label: 'Services',
            icon: Wrench
        },
        {
            path: '/about',
            label: 'About',
            icon: Info
        },
    ];

    const cartItemsCount = count;

    // Get user display name
    const getUserDisplayName = () => {
        if (!user) return 'Welcome';

        return (
            user.username ||
            user.name ||
            user.email?.split('@')[0] ||
            'User'
        );
    };

    // Get user email
    const getUserEmail = () => {
        if (!user) return 'Login / Register';

        return user.email || 'My Account';
    };

    return (
        <>
            {/* =========================
                DESKTOP / MAIN NAVBAR
            ========================== */}
            <nav className="w-full bg-white border-b border-gray-100 shadow-sm relative z-50">

                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">

                    {/* =========================
                        LOGO
                    ========================== */}
                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 cursor-pointer flex-shrink-0"
                        onClick={() => handleNavigation('/home')}
                    >
                        <img
                            src="/everlastLogo-removebg-preview.png"
                            alt="Everlast Water Solutions"
                            className="h-11 w-11 sm:h-12 sm:w-12 lg:h-14 lg:w-14 object-contain flex-shrink-0"
                        />

                        <span className="text-lg sm:text-xl lg:text-2xl font-bold whitespace-nowrap">
                            <span style={{ color: colors.text }}>
                                Everlast
                            </span>{' '}

                            <span style={{ color: colors.primary }}>
                                Water
                            </span>
                        </span>
                    </div>


                    {/* =========================
                        DESKTOP NAVIGATION
                    ========================== */}
                    <div className="hidden md:flex items-center gap-1 flex-shrink-0">

                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive =
                                activeLink === link.path;

                            return (
                                <button
                                    key={link.path}
                                    onClick={() =>
                                        handleNavigation(link.path)
                                    }
                                    className="flex items-center gap-1.5 font-medium text-sm py-2 px-3 rounded-lg transition-colors duration-200"
                                    style={{
                                        backgroundColor: isActive
                                            ? colors.background
                                            : 'transparent',
                                        color: colors.text
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor =
                                                colors.background;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor =
                                                'transparent';
                                        }
                                    }}
                                >
                                    <Icon
                                        size={16}
                                        style={{
                                            color: isActive
                                                ? colors.primary
                                                : 'currentColor'
                                        }}
                                    />

                                    {link.label}
                                </button>
                            );
                        })}
                    </div>


                    {/* =========================
                        RIGHT SIDE
                    ========================== */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

                        {/* =========================
                            CART
                        ========================== */}
                        <button
                            className="relative w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-gray-100"
                            style={{ color: colors.text }}
                            onClick={() =>
                                handleNavigation('/cart')
                            }
                        >
                            <ShoppingCart size={19} />

                            {cartItemsCount > 0 && (
                                <span
                                    className="absolute -top-0.5 -right-0.5 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-semibold"
                                    style={{
                                        backgroundColor:
                                            colors.primary
                                    }}
                                >
                                    {cartItemsCount}
                                </span>
                            )}
                        </button>


                        {/* =========================
                            DESKTOP ACCOUNT
                        ========================== */}
                        <div className="hidden md:block relative user-dropdown">

                            <button
                                className="flex items-center gap-2 py-1.5 pl-1.5 pr-2 rounded-full transition-colors duration-200 hover:bg-gray-50"
                                onClick={handleUserAction}
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{
                                        backgroundColor:
                                            colors.background,
                                        color: colors.primary
                                    }}
                                >
                                    <User size={16} />
                                </div>

                                <div className="text-left">

                                    <span className="block text-xs text-gray-500 leading-tight">
                                        Welcome
                                    </span>

                                    <span
                                        className="flex items-center gap-1 text-sm font-semibold leading-tight"
                                        style={{
                                            color: colors.text
                                        }}
                                    >
                                        {isAuthenticated
                                            ? getUserDisplayName()
                                            : 'Login / Register'}

                                        <ChevronDown size={14} />
                                    </span>

                                </div>
                            </button>


                            {/* Desktop User Dropdown */}
                            {isAuthenticated && isDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">

                                    {/* User Information */}
                                    <div className="p-4 border-b border-gray-100">
                                        <p
                                            className="text-sm font-semibold"
                                            style={{ color: colors.text }}
                                        >
                                            {getUserDisplayName()}
                                        </p>

                                        <p className="text-xs text-gray-500 truncate mt-1">
                                            {user?.email}
                                        </p>
                                    </div>

                                    {/* Orders - Logged in users only */}
                                    <button
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => handleNavigation('/orders')}
                                    >
                                        <Package
                                            size={17}
                                            style={{ color: colors.primary }}
                                        />

                                        <span>Orders</span>
                                    </button>

                                    {/* Logout */}
                                    <button
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={17} />
                                        <span>Logout</span>
                                    </button>

                                </div>
                            )}
                        </div>


                        {/* =========================
                            MOBILE USER ICON
                        ========================== */}
                        <button
                            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full"
                            style={{
                                backgroundColor:
                                    colors.background,
                                color: colors.primary
                            }}
                            onClick={handleUserAction}
                        >
                            <User size={16} />
                        </button>


                        {/* =========================
                            MOBILE HAMBURGER
                        ========================== */}
                        <button
                            className="md:hidden mobile-menu-button w-9 h-9 flex items-center justify-center rounded-full"
                            style={{
                                backgroundColor:
                                    colors.background,
                                color: colors.text
                            }}
                            onClick={toggleMenu}
                        >
                            <Menu size={20} />
                        </button>

                    </div>
                </div>


                {/* =========================
                    MOBILE MENU
                ========================== */}
                <div
                    className={`mobile-menu fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen
                        ? 'translate-x-0'
                        : 'translate-x-full'
                        }`}
                >

                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300"
                        onClick={() => setIsMenuOpen(false)}
                    />


                    {/* Menu Content */}
                    <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl overflow-y-auto">

                        {/* =========================
                            MENU HEADER
                        ========================== */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">

                            <h2
                                className="text-lg font-bold"
                                style={{
                                    color: colors.text
                                }}
                            >
                                Menu
                            </h2>

                            <button
                                onClick={() =>
                                    setIsMenuOpen(false)
                                }
                                className="p-2 rounded-lg transition-all duration-300 hover:bg-gray-100"
                            >
                                <X
                                    size={20}
                                    style={{
                                        color: colors.text
                                    }}
                                />
                            </button>

                        </div>


                        {/* =========================
                            USER INFORMATION
                        ========================== */}
                        {isAuthenticated && user && (
                            <div
                                className="p-4 border-b border-gray-100"
                                style={{
                                    backgroundColor:
                                        colors.background
                                }}
                            >
                                <div className="flex items-center gap-3">

                                    <div
                                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center"
                                        style={{
                                            color: colors.primary
                                        }}
                                    >
                                        <User size={18} />
                                    </div>

                                    <div>

                                        <p
                                            className="font-semibold text-sm"
                                            style={{
                                                color: colors.text
                                            }}
                                        >
                                            {getUserDisplayName()}
                                        </p>

                                        <p className="text-xs text-gray-600">
                                            {user.email}
                                        </p>

                                    </div>

                                </div>
                            </div>
                        )}


                        {/* =========================
                            MOBILE MENU ITEMS
                        ========================== */}
                        <div className="p-3">

                            <div className="space-y-1">

                                {/* =================================
                                    MAIN NAVIGATION
                                    These are shown ONLY ONCE
                                ================================== */}
                                {navLinks.map((link) => {

                                    const Icon = link.icon;

                                    return (
                                        <button
                                            key={link.path}
                                            onClick={() =>
                                                handleNavigation(
                                                    link.path
                                                )
                                            }
                                            className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300 text-sm font-medium hover:bg-gray-50"
                                            style={{
                                                color: colors.text
                                            }}
                                        >
                                            <Icon
                                                size={18}
                                                style={{
                                                    color:
                                                        colors.primary
                                                }}
                                            />

                                            <span>
                                                {link.label}
                                            </span>
                                        </button>
                                    );
                                })}


                                {/* Divider */}
                                <div className="my-2 border-t border-gray-100" />


                                {/* =================================
                                    LOGGED-IN MENU
                                ================================== */}
                                {isAuthenticated ? (
                                    <>

                                        {/* ORDERS */}
                                        <button
                                            onClick={() =>
                                                handleNavigation(
                                                    '/orders'
                                                )
                                            }
                                            className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300 text-sm font-medium hover:bg-gray-50"
                                            style={{
                                                color: colors.text
                                            }}
                                        >
                                            <Package
                                                size={18}
                                                style={{
                                                    color:
                                                        colors.primary
                                                }}
                                            />

                                            <span>
                                                Orders
                                            </span>
                                        </button>


                                        {/* CART */}
                                        <button
                                            onClick={() =>
                                                handleNavigation(
                                                    '/cart'
                                                )
                                            }
                                            className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300 text-sm font-medium hover:bg-gray-50 relative"
                                            style={{
                                                color: colors.text
                                            }}
                                        >
                                            <ShoppingCart
                                                size={18}
                                                style={{
                                                    color:
                                                        colors.primary
                                                }}
                                            />

                                            <span>
                                                Cart
                                            </span>

                                            {cartItemsCount > 0 && (
                                                <span
                                                    className="absolute right-3 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
                                                    style={{
                                                        backgroundColor:
                                                            colors.primary
                                                    }}
                                                >
                                                    {cartItemsCount}
                                                </span>
                                            )}
                                        </button>


                                        {/* LOGOUT */}
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300 text-sm font-medium text-red-600 hover:bg-red-50 mt-2"
                                        >
                                            <LogOut size={18} />

                                            <span>
                                                Logout
                                            </span>
                                        </button>

                                    </>
                                ) : (

                                    /* =================================
                                        LOGGED-OUT MENU
                                    ================================== */
                                    <>
                                        {/* LOGIN */}
                                        <button
                                            onClick={() =>
                                                handleNavigation(
                                                    '/login'
                                                )
                                            }
                                            className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300 text-sm font-medium hover:bg-gray-50"
                                            style={{
                                                color: colors.text
                                            }}
                                        >
                                            <LogIn
                                                size={18}
                                                style={{
                                                    color:
                                                        colors.primary
                                                }}
                                            />

                                            <span>
                                                Login
                                            </span>
                                        </button>


                                        {/* SIGN UP */}
                                        <button
                                            onClick={() =>
                                                handleNavigation(
                                                    '/register'
                                                )
                                            }
                                            className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300 text-sm font-medium hover:bg-gray-50"
                                            style={{
                                                color: colors.text
                                            }}
                                        >
                                            <UserPlus
                                                size={18}
                                                style={{
                                                    color:
                                                        colors.primary
                                                }}
                                            />

                                            <span>
                                                Sign Up
                                            </span>
                                        </button>


                                        {/* CART */}
                                        <button
                                            onClick={() =>
                                                handleNavigation(
                                                    '/cart'
                                                )
                                            }
                                            className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300 text-sm font-medium hover:bg-gray-50 relative"
                                            style={{
                                                color: colors.text
                                            }}
                                        >
                                            <ShoppingCart
                                                size={18}
                                                style={{
                                                    color:
                                                        colors.primary
                                                }}
                                            />

                                            <span>
                                                Cart
                                            </span>

                                            {cartItemsCount > 0 && (
                                                <span
                                                    className="absolute right-3 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
                                                    style={{
                                                        backgroundColor:
                                                            colors.primary
                                                    }}
                                                >
                                                    {cartItemsCount}
                                                </span>
                                            )}
                                        </button>

                                    </>
                                )}

                            </div>
                        </div>

                    </div>
                </div>

            </nav>
        </>
    );
};

export default NavBar;