'use client';

import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Mic, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [isExpressionsOpen, setIsExpressionsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

    // Cerrar el dropdown al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // Para el dropdown de expressions (desktop)
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsExpressionsOpen(false);
            }
            
            // Para el menú móvil - excluir el botón del menú hamburguesa
            if (isMobileMenuOpen && 
                mobileMenuRef.current && 
                !mobileMenuRef.current.contains(event.target as Node) &&
                mobileMenuButtonRef.current &&
                !mobileMenuButtonRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    const closeAllMenus = () => {
        setIsExpressionsOpen(false);
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="relative border-b bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 group"
                        onClick={closeAllMenus}
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Mic className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white text-lg leading-none">Hume AI</span>
                            <span className="text-xs text-emerald-400 font-medium">Expression Suite</span>
                        </div>
                    </Link>

                    {/* Navigation Links - Desktop */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link
                            href="/tts"
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${pathname === '/tts'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            Text-to-Speech
                        </Link>
                        <Link
                            href="/sts"
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${pathname === '/sts'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            Speech-to-Speech
                        </Link>

                        <Link
                            href="/voice-design"
                           
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${pathname === '/voice-design'
                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            Voice Design
                        </Link>
                        
                        {/* Expressions Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsExpressionsOpen(!isExpressionsOpen)}
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-1 cursor-pointer ${pathname.startsWith('/expressions')
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                Expressions
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpressionsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isExpressionsOpen && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50">
                                    <Link
                                        href="/expressions/voice"
                                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-500/10 hover:text-purple-400 transition-colors duration-200"
                                        onClick={() => setIsExpressionsOpen(false)}
                                    >
                                        Por voz
                                    </Link>
                                    <Link
                                        href="/expressions/facial"
                                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-500/10 hover:text-purple-400 transition-colors duration-200"
                                        onClick={() => setIsExpressionsOpen(false)}
                                    >
                                        Por expresiones faciales
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border
                                      bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-sm text-emerald-400 font-medium">Online</span>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                            aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
                        >
                            {theme === 'light' ? (
                                <Moon className="w-5 h-5 text-gray-600" />
                            ) : (
                                <Sun className="w-5 h-5 text-gray-400" />
                            )}
                        </button>

                        {/* Mobile Menu Button */}
                        <button 
                            ref={mobileMenuButtonRef}
                            className="md:hidden p-2 rounded-lg border bg-gray-100 dark:bg-gray-800 
                                         border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 
                                         hover:text-gray-900 dark:hover:text-white transition-colors"
                            onClick={toggleMobileMenu}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div 
                    ref={mobileMenuRef}
                    className={`md:hidden border-t border-gray-200 dark:border-gray-800 py-4 transition-all duration-300 ${
                        isMobileMenuOpen ? 'block' : 'hidden'
                    }`}
                >
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/tts"
                            className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${pathname === '/tts'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            onClick={closeAllMenus}
                        >
                            Text-to-Speech
                        </Link>
                        <Link
                            href="/sts"
                            className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${pathname === '/sts'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            onClick={closeAllMenus}
                        >
                            Speech-to-Speech
                        </Link>
                        
                        {/* Expressions Submenu for Mobile */}
                        <div className="flex flex-col gap-1">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-2">
                                EXPRESSIONS
                            </div>
                            <Link
                                href="/expressions/voice"
                                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${pathname === '/expressions/voice'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                onClick={closeAllMenus}
                            >
                                Por voz
                            </Link>
                            <Link
                                href="/expressions/facial"
                                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${pathname === '/expressions/facial'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                onClick={closeAllMenus}
                            >
                                Por expresiones faciales
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}