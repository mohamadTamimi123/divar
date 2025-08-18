'use client'
import logo from "../../public/cropped-New-Project-4.png"
import Image from "next/image";
import { CiLocationOn } from "react-icons/ci";
import { FaUser } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { useFilters } from "../../src/context/FiltersContext";

export default function MainMenu() {
    const { selectedCity, selectedNeighborhoods, setSelectedCity, setSelectedNeighborhoods } = useFilters();
    const [cities, setCities] = useState<string[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // Search states
    const [citySearchTerm, setCitySearchTerm] = useState("");
    const [neighborhoodSearchTerm, setNeighborhoodSearchTerm] = useState("");
    
    const cityDropdownRef = useRef<HTMLDivElement>(null);
    const neighborhoodDropdownRef = useRef<HTMLDivElement>(null);

    // Load saved selections from localStorage on component mount
    useEffect(() => {
        fetchCities();
        const token = typeof window !== 'undefined' 
            ? (localStorage.getItem('userToken') || localStorage.getItem('token'))
            : null;
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userToken');
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            window.location.href = '/';
        }
    };

    // Fetch neighborhoods when city changes
    useEffect(() => {
        if (selectedCity) {
            fetchNeighborhoods(selectedCity);
        } else {
            setNeighborhoods([]);
            setSelectedNeighborhoods([]);
        }
    }, [selectedCity, setSelectedNeighborhoods]);

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
                setShowCityDropdown(false);
                setCitySearchTerm("");
            }
            if (neighborhoodDropdownRef.current && !neighborhoodDropdownRef.current.contains(event.target as Node)) {
                setShowNeighborhoodDropdown(false);
                setNeighborhoodSearchTerm("");
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchCities = async () => {
        try {
            const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';
            const response = await fetch(`${apiPath}/api/v1/files/cities`);
            if (response.ok) {
                const citiesData = await response.json();
                setCities(citiesData);
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const fetchNeighborhoods = async (cityName: string) => {
        try {
            setLoading(true);
            const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';
            const response = await fetch(`${apiPath}/api/v1/files/neighborhoods?city=${encodeURIComponent(cityName)}`);
            if (response.ok) {
                const neighborhoodsData = await response.json();
                setNeighborhoods(neighborhoodsData);
            }
        } catch (error) {
            console.error('Error fetching neighborhoods:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCitySelect = (city: string) => {
        setSelectedCity(city);
        setSelectedNeighborhoods([]);
        setShowCityDropdown(false);
        setCitySearchTerm("");
    };

    const handleNeighborhoodToggle = (neighborhood: string) => {
        const newNeighborhoods = selectedNeighborhoods.includes(neighborhood)
            ? selectedNeighborhoods.filter(n => n !== neighborhood)
            : [...selectedNeighborhoods, neighborhood];
        
        setSelectedNeighborhoods(newNeighborhoods);
    };

    const clearAllNeighborhoods = () => {
        setSelectedNeighborhoods([]);
    };

    const removeNeighborhood = (neighborhood: string) => {
        const newNeighborhoods = selectedNeighborhoods.filter(n => n !== neighborhood);
        setSelectedNeighborhoods(newNeighborhoods);
    };

    // Filter cities and neighborhoods based on search terms
    const filteredCities = cities.filter(city => 
        city.toLowerCase().includes(citySearchTerm.toLowerCase())
    );
    
    const filteredNeighborhoods = neighborhoods.filter(neighborhood => 
        neighborhood.toLowerCase().includes(neighborhoodSearchTerm.toLowerCase())
    );

    return (
        <div className="flex justify-between items-center px-8 py-6">
            {/* Logo Section */}
            <div className="flex items-center">
                <div className="relative">
                    <Image 
                        src={logo} 
                        height={40} 
                        alt="لوگو" 
                        className="rounded-xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl"></div>
                </div>
                <div className="mr-4">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        پلتفرم املاک
                    </h1>
                    <p className="text-xs text-gray-500">بهترین فرصت‌های سرمایه‌گذاری</p>
                </div>
            </div>
            
            {/* Location Section */}
            <div className="flex items-center gap-4">
                {/* City Selection */}
                <div className="relative" ref={cityDropdownRef}>
                    <button 
                        onClick={() => setShowCityDropdown(!showCityDropdown)}
                        className="location-box flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/50 hover:border-blue-300 rounded-2xl transition-all duration-300 group min-w-[220px] shadow-lg hover:shadow-xl"
                    >
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-md">
                            <CiLocationOn size={20} className="text-white" />
                        </div>
                        <div className="flex flex-col items-start flex-1">
                            <span className="text-xs text-gray-500 font-medium">شهر</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {selectedCity || "انتخاب شهر"}
                            </span>
                        </div>
                        <IoChevronDown 
                            size={18} 
                            className={`text-gray-400 transition-transform duration-300 ${showCityDropdown ? 'rotate-180' : ''}`} 
                        />
                    </button>
                    
                    {/* City Dropdown */}
                    {showCityDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 max-h-60 overflow-y-auto z-50 min-w-[320px]">
                            {/* Search Input */}
                            <div className="p-5 border-b border-gray-200/50">
                                <div className="relative">
                                    <IoSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="جستجو در شهرها..."
                                        value={citySearchTerm}
                                        onChange={(e) => setCitySearchTerm(e.target.value)}
                                        className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                    />
                                </div>
                            </div>
                            
                            <div className="max-h-40 overflow-y-auto">
                                {filteredCities.length > 0 ? (
                                    filteredCities.map((city) => (
                                        <button
                                            key={city}
                                            onClick={() => handleCitySelect(city)}
                                            className="w-full px-5 py-3 text-right hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 flex items-center justify-between border-b border-gray-100/50 last:border-b-0"
                                        >
                                            <span className="text-sm font-medium text-gray-900">{city}</span>
                                            {selectedCity === city && (
                                                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))
                                ) : citySearchTerm ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <span className="text-sm">شهری یافت نشد</span>
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                                        <span className="text-sm mt-2 block">در حال بارگذاری...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Neighborhood Selection */}
                {selectedCity && (
                    <div className="relative" ref={neighborhoodDropdownRef}>
                        <button 
                            onClick={() => setShowNeighborhoodDropdown(!showNeighborhoodDropdown)}
                            className="location-box flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/50 hover:border-purple-300 rounded-2xl transition-all duration-300 group min-w-[220px] shadow-lg hover:shadow-xl"
                        >
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-md">
                                <CiLocationOn size={20} className="text-white" />
                            </div>
                            <div className="flex flex-col items-start flex-1">
                                <span className="text-xs text-gray-500 font-medium">محله</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {selectedNeighborhoods.length > 0 
                                        ? `${selectedNeighborhoods.length} محله انتخاب شده` 
                                        : "انتخاب محله"}
                                </span>
                            </div>
                            <IoChevronDown 
                                size={18} 
                                className={`text-gray-400 transition-transform duration-300 ${showNeighborhoodDropdown ? 'rotate-180' : ''}`} 
                            />
                        </button>
                        
                        {/* Neighborhood Dropdown */}
                        {showNeighborhoodDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 max-h-80  z-50 min-w-[320px]">
                                <div className="p-5 border-b border-gray-200/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-gray-900">انتخاب محله‌ها</span>
                                        {selectedNeighborhoods.length > 0 && (
                                            <button
                                                onClick={clearAllNeighborhoods}
                                                className="text-xs text-red-500 hover:text-red-600 transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-red-50"
                                            >
                                                پاک کردن همه
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Search Input */}
                                    <div className="relative mb-3">
                                        <IoSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="جستجو در محله‌ها..."
                                            value={neighborhoodSearchTerm}
                                            onChange={(e) => setNeighborhoodSearchTerm(e.target.value)}
                                            className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
                                        />
                                    </div>
                                    
                                    {selectedNeighborhoods.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedNeighborhoods.map((neighborhood) => (
                                                <div
                                                    key={neighborhood}
                                                    className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs border border-purple-200/50"
                                                >
                                                    <span>{neighborhood}</span>
                                                    <button
                                                        onClick={() => removeNeighborhood(neighborhood)}
                                                        className="hover:text-purple-900 transition-colors duration-200 w-4 h-4 bg-purple-200 rounded-full flex items-center justify-center hover:bg-purple-300"
                                                    >
                                                        <IoClose size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="max-h-40 overflow-y-auto">
                                    {loading ? (
                                        <div className="p-4 text-center text-gray-500">
                                            <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
                                            <span className="text-sm mt-2 block">در حال بارگذاری...</span>
                                        </div>
                                    ) : filteredNeighborhoods.length > 0 ? (
                                        filteredNeighborhoods.map((neighborhood) => (
                                            <button
                                                key={neighborhood}
                                                onClick={() => handleNeighborhoodToggle(neighborhood)}
                                                className={`w-full px-5 py-3 text-right hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 flex items-center justify-between border-b border-gray-100/50 last:border-b-0 ${
                                                    selectedNeighborhoods.includes(neighborhood) ? 'bg-gradient-to-r from-purple-50 to-pink-50' : ''
                                                }`}
                                            >
                                                <span className="text-sm font-medium text-gray-900">{neighborhood}</span>
                                                {selectedNeighborhoods.includes(neighborhood) && (
                                                    <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                                                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    ) : neighborhoodSearchTerm ? (
                                        <div className="p-4 text-center text-gray-500">
                                            <span className="text-sm">محله‌ای یافت نشد</span>
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">
                                            <span className="text-sm">محله‌ای یافت نشد</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* User Section */}
            <div className="flex items-center gap-3">
                {isLoggedIn ? (
                    <button onClick={handleLogout} className="login-btn flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border border-gray-300/50 hover:border-gray-400/50 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl text-gray-800 transform hover:scale-105">
                        <div className="flex items-center justify-center w-6 h-6">
                            <FaUser size={14} className="text-gray-800" />
                        </div>
                        <span className="text-sm font-semibold">خروج</span>
                    </button>
                ) : (
                    <a href="/login" className="login-btn flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                        <div className="flex items-center justify-center w-6 h-6">
                            <FaUser size={14} className="text-white" />
                        </div>
                        <span className="text-sm font-semibold text-white">ورود</span>
                    </a>
                )}
            </div>
        </div>
    )
}