'use client'
import logo from "../../public/cropped-New-Project-4.png"
import Image from "next/image";
import { CiLocationOn } from "react-icons/ci";
import { FaUser } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { useFilters } from "../../src/context/FiltersContext";

export default function MainMenu() {
    const { selectedCity, selectedNeighborhoods, setSelectedCity, setSelectedNeighborhoods } = useFilters();
    const [cities, setCities] = useState<string[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const cityDropdownRef = useRef<HTMLDivElement>(null);
    const neighborhoodDropdownRef = useRef<HTMLDivElement>(null);

    // Fetch cities on component mount
    useEffect(() => {
        fetchCities();
    }, []);

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
            }
            if (neighborhoodDropdownRef.current && !neighborhoodDropdownRef.current.contains(event.target as Node)) {
                setShowNeighborhoodDropdown(false);
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
    };

    const handleNeighborhoodToggle = (neighborhood: string) => {
        if (selectedNeighborhoods.includes(neighborhood)) {
            setSelectedNeighborhoods(selectedNeighborhoods.filter(n => n !== neighborhood));
        } else {
            setSelectedNeighborhoods([...selectedNeighborhoods, neighborhood]);
        }
    };

    const removeNeighborhood = (neighborhood: string) => {
        setSelectedNeighborhoods(selectedNeighborhoods.filter(n => n !== neighborhood));
    };

    const clearAllNeighborhoods = () => {
        setSelectedNeighborhoods([]);
    };

    return (
        <div className="main-menu flex justify-between items-center bg-white/95 backdrop-blur-xl border-b border-gray-100 px-8 py-4 shadow-sm">
            {/* Logo Section */}
            <div className="flex items-center">
                <Image 
                    src={logo} 
                    height={32} 
                    alt="لوگو" 
                    className="rounded-lg shadow-sm"
                />
            </div>
            
            {/* Location Section */}
            <div className="flex items-center gap-4">
                {/* City Selection */}
                <div className="relative" ref={cityDropdownRef}>
                    <button 
                        onClick={() => setShowCityDropdown(!showCityDropdown)}
                        className="location-box flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200 group min-w-[200px]"
                    >
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors duration-200">
                            <CiLocationOn size={18} className="text-blue-600" />
                        </div>
                        <div className="flex flex-col items-start flex-1">
                            <span className="text-xs text-gray-500 font-medium">شهر</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {selectedCity || "انتخاب شهر"}
                            </span>
                        </div>
                        <IoChevronDown 
                            size={16} 
                            className={`text-gray-400 transition-transform duration-200 ${showCityDropdown ? 'rotate-180' : ''}`} 
                        />
                    </button>
                    
                    {/* City Dropdown */}
                    {showCityDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto z-50">
                            {cities.length > 0 ? (
                                cities.map((city) => (
                                    <button
                                        key={city}
                                        onClick={() => handleCitySelect(city)}
                                        className="w-full px-4 py-3 text-right hover:bg-gray-50 transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl"
                                    >
                                        <span className="text-sm font-medium text-gray-900">{city}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500">
                                    <span className="text-sm">شهری یافت نشد</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Neighborhood Selection */}
                {selectedCity && (
                    <div className="relative" ref={neighborhoodDropdownRef}>
                        <button 
                            onClick={() => setShowNeighborhoodDropdown(!showNeighborhoodDropdown)}
                            className="location-box flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200 group min-w-[200px]"
                        >
                            <div className="flex items-center justify-center w-8 h-8 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors duration-200">
                                <CiLocationOn size={18} className="text-purple-600" />
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
                                size={16} 
                                className={`text-gray-400 transition-transform duration-200 ${showNeighborhoodDropdown ? 'rotate-180' : ''}`} 
                            />
                        </button>
                        
                        {/* Neighborhood Dropdown */}
                        {showNeighborhoodDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto z-50 min-w-[300px]">
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-900">انتخاب محله‌ها</span>
                                        {selectedNeighborhoods.length > 0 && (
                                            <button
                                                onClick={clearAllNeighborhoods}
                                                className="text-xs text-red-500 hover:text-red-600 transition-colors duration-200"
                                            >
                                                پاک کردن همه
                                            </button>
                                        )}
                                    </div>
                                    {selectedNeighborhoods.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedNeighborhoods.map((neighborhood) => (
                                                <div
                                                    key={neighborhood}
                                                    className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs"
                                                >
                                                    <span>{neighborhood}</span>
                                                    <button
                                                        onClick={() => removeNeighborhood(neighborhood)}
                                                        className="hover:text-purple-900 transition-colors duration-200"
                                                    >
                                                        <IoClose size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="max-h-40 overflow-y-auto">
                                    {loading ? (
                                        <div className="p-4 text-center text-gray-500">
                                            <span className="text-sm">در حال بارگذاری...</span>
                                        </div>
                                    ) : neighborhoods.length > 0 ? (
                                        neighborhoods.map((neighborhood) => (
                                            <button
                                                key={neighborhood}
                                                onClick={() => handleNeighborhoodToggle(neighborhood)}
                                                className={`w-full px-4 py-3 text-right hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between ${
                                                    selectedNeighborhoods.includes(neighborhood) ? 'bg-purple-50' : ''
                                                }`}
                                            >
                                                <span className="text-sm font-medium text-gray-900">{neighborhood}</span>
                                                {selectedNeighborhoods.includes(neighborhood) && (
                                                    <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </button>
                                        ))
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
                <button className="login-btn flex items-center gap-3 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex items-center justify-center w-6 h-6">
                        <FaUser size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white">ورود</span>
                </button>
            </div>
        </div>
    )
}