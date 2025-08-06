'use client'
import { FaFile, FaHome, FaCog, FaSearch, FaHeart, FaUsers, FaUserPlus, FaSignInAlt } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function SideBar(){
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('userToken') || localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    return (
        <div className="side-bar bg-white/95 backdrop-blur-xl border-l border-gray-100 px-6 py-8 flex flex-col gap-6 min-h-[calc(100vh-80px)] shadow-sm">
            {/* Home Section */}
            <div className="flex flex-col gap-1">
                <a href="/" className="flex items-center gap-3 text-gray-900 font-semibold text-base hover:bg-gray-50 rounded-2xl px-4 py-3 transition-all duration-200 group">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors duration-200">
                        <FaHome size={16} className="text-blue-600" />
                    </div>
                    <span>خانه</span>
                </a>
            </div>
            
            {/* Search Section */}
            <div className="flex flex-col gap-1">
                <a href="/search" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-2xl px-4 py-3 transition-all duration-200 group">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-colors duration-200">
                        <FaSearch size={14} className="text-gray-600" />
                    </div>
                    <span className="font-medium">جستجو</span>
                </a>
            </div>
            
            {/* Files Section */}
            <div className="flex flex-col gap-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">فایل‌ها</h3>
                <ul className="flex flex-col gap-1">
                    <li>
                        <a className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-2xl px-4 py-3 transition-all duration-200 group" href="">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors duration-200">
                                <FaFile size={14} className="text-green-600" />
                            </div>
                            <span className="font-medium">فایل های خرید</span>
                        </a>
                    </li>
                    <li>
                        <a className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-2xl px-4 py-3 transition-all duration-200 group" href="/rent">
                            <div className="flex items-center justify-center w-8 h-8 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors duration-200">
                                <FaFile size={14} className="text-purple-600" />
                            </div>
                            <span className="font-medium">فایل های اجاره</span>
                        </a>
                    </li>
                    <li>
                        <a className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-2xl px-4 py-3 transition-all duration-200 group" href="">
                            <div className="flex items-center justify-center w-8 h-8 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors duration-200">
                                <FaFile size={14} className="text-orange-600" />
                            </div>
                            <span className="font-medium">فایل ها</span>
                        </a>
                    </li>
                </ul>
            </div>
            
            {/* Client Management Section - Only show if logged in */}
            {isLoggedIn && (
                <div className="flex flex-col gap-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">مدیریت</h3>
                    <ul className="flex flex-col gap-1">
                        <li>
                            <a className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-2xl px-4 py-3 transition-all duration-200 group" href="/clients">
                                <div className="flex items-center justify-center w-8 h-8 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors duration-200">
                                    <FaUsers size={14} className="text-indigo-600" />
                                </div>
                                <span className="font-medium">مدیریت مشتریان</span>
                            </a>
                        </li>
                    </ul>
                </div>
            )}
            
            {/* Favorites Section */}
            <div className="flex flex-col gap-1">
                <a href="/favorites" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-2xl px-4 py-3 transition-all duration-200 group">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors duration-200">
                        <FaHeart size={14} className="text-red-600" />
                    </div>
                    <span className="font-medium">علاقه‌مندی‌ها</span>
                </a>
            </div>
            
            {/* Authentication Section */}
            {!isLoggedIn && (
                <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">حساب کاربری</h3>
                    <ul className="flex flex-col gap-1">
                        <li>
                            <a className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-2xl px-4 py-3 transition-all duration-200 group" href="/login">
                                <div className="flex items-center justify-center w-8 h-8 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors duration-200">
                                    <FaSignInAlt size={14} className="text-green-600" />
                                </div>
                                <span className="font-medium">ورود</span>
                            </a>
                        </li>
                        <li>
                            <a className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-2xl px-4 py-3 transition-all duration-200 group" href="/register">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors duration-200">
                                    <FaUserPlus size={14} className="text-blue-600" />
                                </div>
                                <span className="font-medium">ثبت نام</span>
                            </a>
                        </li>
                    </ul>
                </div>
            )}
            
            {/* Admin Section */}
            <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-1">
                <a href="/admin" className="flex items-center gap-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-2xl px-4 py-3 transition-all duration-200 group">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-colors duration-200">
                        <FaCog size={14} className="text-gray-600" />
                    </div>
                    <span className="font-medium">مدیریت</span>
                </a>
            </div>
        </div>
    )
}