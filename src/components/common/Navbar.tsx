'use client';

import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Mic } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="relative border-b bg-white dark:bg-gray-950/80 backdrop-blur-xl transition-colors duration-300
                       border-gray-200 dark:border-gray-800/50">
            <div className="mx-auto max-w-450 px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <Mic />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white text-lg leading-none">Hume AI</span>
                            <span className="text-xs text-emerald-400 font-medium">Expression Suite</span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link
                            href="/tts"
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${pathname === '/tts'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            Text-to-Speech
                        </Link>
                        <Link
                            href="/sts"
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${pathname === '/sts'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            Speech-to-Speech
                        </Link>
                        <Link
                            href="/expressions"
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${pathname === '/expressions'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            Expressions
                        </Link>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors duration-300
                                      bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50">
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
                        <button className="md:hidden p-2 rounded-lg border bg-gray-100 dark:bg-gray-800/50 
                                         border-gray-200 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 
                                         hover:text-gray-900 dark:hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden border-t border-gray-200 dark:border-gray-800/50 py-4 transition-colors duration-300">
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/tts"
                            className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${pathname === '/tts'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            Text-to-Speech
                        </Link>
                        <Link
                            href="/sts"
                            className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${pathname === '/sts'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            Speech-to-Speech
                        </Link>
                        <Link
                            href="/expressions"
                            className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${pathname === '/expressions'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            Expression Measurement
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}