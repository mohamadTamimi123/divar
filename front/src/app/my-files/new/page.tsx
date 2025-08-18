"use client"
import { useState, useEffect } from "react";
import MainMenu from "../../../../components/MainMenu/MainMenu";
import SideBar from "../../../../components/SideBar/SideBar";

type FileType = 'sale' | 'rent' | 'land' | 'partnership';

interface PersonalFile {
    id: string;
    title: string;
    type: FileType;
    city?: string;
    neighborhood?: string;
    metraj?: string;
    description?: string;
    deposit?: string;
    rent?: string;
    totalPrice?: string;
    createdAt: string;
}

export default function NewPersonalFilePage() {
    const [title, setTitle] = useState("");
    const [type, setType] = useState<FileType>('sale');
    const [city, setCity] = useState("");
    const [neighborhood, setNeighborhood] = useState("");
    const [metraj, setMetraj] = useState("");
    const [description, setDescription] = useState("");
    const [deposit, setDeposit] = useState("");
    const [rent, setRent] = useState("");
    const [totalPrice, setTotalPrice] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // API data
    const [cities, setCities] = useState<string[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

    // Fetch cities on mount
    useEffect(() => {
        fetchCities();
    }, []);

    // Fetch neighborhoods when city changes
    useEffect(() => {
        if (city) {
            fetchNeighborhoods(city);
        } else {
            setNeighborhoods([]);
            setNeighborhood("");
        }
    }, [city]);

    const fetchCities = async () => {
        try {
            setLoadingCities(true);
            const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';
            const response = await fetch(`${apiPath}/api/v1/files/cities`);
            if (response.ok) {
                const citiesData = await response.json();
                setCities(citiesData);
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
        } finally {
            setLoadingCities(false);
        }
    };

    const fetchNeighborhoods = async (cityName: string) => {
        try {
            setLoadingNeighborhoods(true);
            const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';
            const response = await fetch(`${apiPath}/api/v1/files/neighborhoods?city=${encodeURIComponent(cityName)}`);
            if (response.ok) {
                const neighborhoodsData = await response.json();
                setNeighborhoods(neighborhoodsData);
            }
        } catch (error) {
            console.error('Error fetching neighborhoods:', error);
        } finally {
            setLoadingNeighborhoods(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!title.trim()) {
            setError('عنوان الزامی است');
            return;
        }
        setSaving(true);
        try {
            const file: PersonalFile = {
                id: crypto.randomUUID(),
                title: title.trim(),
                type,
                city: city.trim() || undefined,
                neighborhood: neighborhood.trim() || undefined,
                metraj: metraj.trim() || undefined,
                description: description.trim() || undefined,
                deposit: type === 'rent' ? deposit.trim() || undefined : undefined,
                rent: type === 'rent' ? rent.trim() || undefined : undefined,
                totalPrice: type === 'sale' ? totalPrice.trim() || undefined : undefined,
                createdAt: new Date().toISOString()
            };
            const key = 'myPersonalFiles';
            const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
            const list = stored ? JSON.parse(stored) : [];
            list.unshift(file);
            localStorage.setItem(key, JSON.stringify(list));
            window.location.href = '/my-files';
        } catch (e) {
            setError('خطا در ذخیره‌سازی');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <MainMenu/>
            <div className="flex min-h-[calc(100vh-80px)]">
                {/* Main Content */}
                <div className="flex-1 px-8 pr-96">
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-xl font-bold mb-4">ایجاد فایل شخصی</h1>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && <div className="text-red-600 text-sm">{error}</div>}
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">عنوان</label>
                                <input 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)} 
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">نوع</label>
                                <select 
                                    value={type} 
                                    onChange={e => setType(e.target.value as FileType)} 
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="sale">خرید/فروش</option>
                                    <option value="rent">اجاره</option>
                                    <option value="land">زمین</option>
                                    <option value="partnership">مشارکت</option>
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">شهر</label>
                                    <select 
                                        value={city} 
                                        onChange={e => setCity(e.target.value)} 
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={loadingCities}
                                    >
                                        <option value="">انتخاب شهر</option>
                                        {cities.map((cityName) => (
                                            <option key={cityName} value={cityName}>{cityName}</option>
                                        ))}
                                    </select>
                                    {loadingCities && <div className="text-xs text-gray-500 mt-1">در حال بارگذاری...</div>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">محله</label>
                                    <select 
                                        value={neighborhood} 
                                        onChange={e => setNeighborhood(e.target.value)} 
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={!city || loadingNeighborhoods}
                                    >
                                        <option value="">انتخاب محله</option>
                                        {neighborhoods.map((neighborhoodName) => (
                                            <option key={neighborhoodName} value={neighborhoodName}>{neighborhoodName}</option>
                                        ))}
                                    </select>
                                    {loadingNeighborhoods && <div className="text-xs text-gray-500 mt-1">در حال بارگذاری...</div>}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">متراژ</label>
                                    <input 
                                        value={metraj} 
                                        onChange={e => setMetraj(e.target.value)} 
                                        placeholder="مثال: 75 متر"
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    />
                                </div>
                                
                                {/* Conditional fields based on type */}
                                {type === 'rent' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">ودیعه (تومان)</label>
                                            <input 
                                                value={deposit} 
                                                onChange={e => setDeposit(e.target.value)} 
                                                placeholder="مثال: 500000000"
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">اجاره ماهانه (تومان)</label>
                                            <input 
                                                value={rent} 
                                                onChange={e => setRent(e.target.value)} 
                                                placeholder="مثال: 8000000"
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                            />
                                        </div>
                                    </>
                                )}
                                
                                {type === 'sale' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">قیمت کل (تومان)</label>
                                        <input 
                                            value={totalPrice} 
                                            onChange={e => setTotalPrice(e.target.value)} 
                                            placeholder="مثال: 2500000000"
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        />
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">توضیحات</label>
                                <textarea 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    rows={4} 
                                />
                            </div>
                            
                            <div className="pt-2 flex items-center gap-3">
                                <button 
                                    type="submit" 
                                    disabled={saving} 
                                    className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-semibold"
                                >
                                    {saving ? 'در حال ذخیره...' : 'ذخیره فایل'}
                                </button>
                                <a 
                                    href="/my-files" 
                                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold"
                                >
                                    انصراف
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
                
                {/* Fixed Sidebar on the right */}
                <div className="fixed top-20 right-0 w-80 h-[calc(100vh-80px)] z-40">
                    <SideBar/>
                </div>
            </div>
        </div>
    );
}


