'use client'
import { useState, useEffect } from "react";
import { FaHome, FaFileAlt, FaSignOutAlt, FaChevronDown, FaChevronRight, FaUsers } from "react-icons/fa";

export default function SideBar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isFilesExpanded, setIsFilesExpanded] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('userToken') || localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        window.location.href = '/';
    };

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-l-3xl shadow-xl border-l border-t border-b border-gray-200 p-8 h-full overflow-y-auto">
            <div className="flex flex-col h-full">
                {/* Logo/Brand */}
                {/* <div className="mb-10 text-center">
                  
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">پنل کاربری</h2>
                    <p className="text-sm text-gray-500 mt-1">مدیریت فایل‌های املاک</p>
                </div> */}

                {/* Navigation Items */}
                <nav className="flex-1 space-y-3">
                    {/* Files Section */}
                    <div className="space-y-3">
                        <button
                            onClick={() => setIsFilesExpanded(!isFilesExpanded)}
                            className="flex items-center justify-between w-full text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl px-6 py-4 transition-all duration-300 group border border-transparent hover:border-blue-200 hover:shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                                    <FaFileAlt size={18} className="text-white" />
                                </div>
                                <span className="font-semibold text-lg">فایل ها</span>
                            </div>
                            <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors duration-300">
                                {isFilesExpanded ? (
                                    <FaChevronDown size={12} className="text-gray-600 group-hover:text-blue-600" />
                                ) : (
                                    <FaChevronRight size={12} className="text-gray-600 group-hover:text-blue-600" />
                                )}
                            </div>
                        </button>
                        
                        {/* Sub-menu */}
                        {isFilesExpanded && (
                            <div className="mr-8 space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <a 
                                    href="/rent" 
                                    className="flex items-center gap-4 text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl px-6 py-3 transition-all duration-300 group border border-transparent hover:border-purple-200 hover:shadow-md"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-all duration-300 shadow-md">
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                    <span className="font-medium text-base">فایل اجاره</span>
                                </a>
                                <a 
                                    href="/buy" 
                                    className="flex items-center gap-4 text-gray-600 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-xl px-6 py-3 transition-all duration-300 group border border-transparent hover:border-green-200 hover:shadow-md"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg group-hover:scale-110 transition-all duration-300 shadow-md">
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                    <span className="text-base font-medium">فایل های خرید</span>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* My Customers */}
                    <a 
                        href="/my-customers" 
                        className="flex items-center justify-between w-full text-gray-700 hover:text-teal-600 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 rounded-2xl px-6 py-4 transition-all duration-300 group border border-transparent hover:border-teal-200 hover:shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                                <FaUsers size={18} className="text-white" />
                            </div>
                            <span className="font-semibold text-lg">مشتری‌های من</span>
                        </div>
                    </a>
                </nav>

                {/* Logout Button */}
                {isLoggedIn && (
                    <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col gap-1">
                        <a onClick={handleLogout} className="flex items-center gap-4 text-red-500 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-2xl px-6 py-4 transition-all duration-300 group cursor-pointer border border-transparent hover:border-red-200 hover:shadow-md">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                                <FaSignOutAlt size={16} className="text-white" />
                            </div>
                            <span className="font-semibold text-lg">خروج</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}