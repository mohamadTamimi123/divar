"use client"
import { useEffect, useState } from "react";
import MainMenu from "../../../../components/MainMenu/MainMenu";
import SideBar from "../../../../components/SideBar/SideBar";

type CustomerType = 'sale' | 'rent';

export default function NewCustomerPage() {
    const [name, setName] = useState("");
    const [type, setType] = useState<CustomerType | ''>('');
    const [maxTotalPrice, setMaxTotalPrice] = useState("");
    const [maxDeposit, setMaxDeposit] = useState("");
    const [maxRent, setMaxRent] = useState("");
    const [city, setCity] = useState("");
    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
    const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
    const [rooms, setRooms] = useState("");
    const [newBuildPreference, setNewBuildPreference] = useState<'new' | 'any'>('any');
    const [upperFloorsNoElevator, setUpperFloorsNoElevator] = useState(false);
    const [hasStorage, setHasStorage] = useState(false);
    const [hasParking, setHasParking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cities, setCities] = useState<string[]>([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

    const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';

    // Helpers: normalize and format price input
    const toEnglishDigits = (val: string) => val
        .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

    const extractDigits = (val: string) => toEnglishDigits(val).replace(/\D/g, '');

    const formatGrouped = (digits: string) => digits ? new Intl.NumberFormat('fa-IR').format(Number(digits)) : '';

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
        if (city) {
            fetchNeighborhoods(city);
        } else {
            setNeighborhoods([]);
            setSelectedNeighborhoods([]);
        }
    }, [city]);

    const fetchCities = async () => {
        try { setLoadingCities(true);
            const res = await fetch(`${apiPath}/api/v1/files/cities`);
            if (res.ok) setCities(await res.json());
        } finally { setLoadingCities(false); }
    };

    const fetchNeighborhoods = async (cityName: string) => {
        try { setLoadingNeighborhoods(true);
            const res = await fetch(`${apiPath}/api/v1/files/neighborhoods?city=${encodeURIComponent(cityName)}`);
            if (res.ok) setNeighborhoods(await res.json());
        } finally { setLoadingNeighborhoods(false); }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!name.trim()) return setError('نام مشتری الزامی است');
        if (!type) return setError('نوع درخواست را انتخاب کنید');
        if (!city) return setError('انتخاب شهر الزامی است');
        if (type === 'sale' && !maxTotalPrice.trim()) return setError('حداکثر قیمت خرید را وارد کنید');
        if (type === 'rent' && !maxDeposit.trim() && !maxRent.trim()) return setError('حداقل یکی از مقادیر ودیعه/اجاره را وارد کنید');

        const newCustomer = {
            id: crypto.randomUUID(),
            name: name.trim(),
            type,
            maxTotalPrice: type === 'sale' ? maxTotalPrice.trim() || undefined : undefined,
            maxDeposit: type === 'rent' ? maxDeposit.trim() || undefined : undefined,
            maxRent: type === 'rent' ? maxRent.trim() || undefined : undefined,
            city,
            neighborhoods: selectedNeighborhoods,
            rooms: rooms || undefined,
            newBuildPreference,
            upperFloorsNoElevator,
            hasStorage,
            hasParking,
            createdAt: new Date().toISOString()
        };

        try {
            const key = 'myCustomers';
            const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
            const list = stored ? JSON.parse(stored) : [];
            list.unshift(newCustomer);
            localStorage.setItem(key, JSON.stringify(list));
            window.location.href = '/my-customers';
        } catch {
            setError('خطا در ذخیره‌سازی');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                <MainMenu/>
            </div>

            <div className="flex min-h-[calc(100vh-80px)]">
                <div className="flex-1 px-8 pr-96">
                    <div className="max-w-4xl mx-auto py-8">
                        <h1 className="text-2xl font-bold mb-6">افزودن مشتری</h1>

                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                            {error && <div className="text-red-600 text-sm">{error}</div>}

                            {/* Basic fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">نام مشتری</label>
                                    <input value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">نوع درخواست</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="radio" name="ctype" checked={type==='sale'} onChange={() => setType('sale')} /> خرید
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="radio" name="ctype" checked={type==='rent'} onChange={() => setType('rent')} /> اجاره
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* After selecting type */}
                            {type && (
                                <>
                                    {type === 'sale' ? (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">حداکثر قیمت خرید (تومان)</label>
                                            <input value={maxTotalPrice}
                                                onChange={e => {
                                                    const raw = extractDigits(e.target.value);
                                                    setMaxTotalPrice(formatGrouped(raw));
                                                }}
                                                inputMode="numeric"
                                                placeholder="مثال: 3,000,000,000"
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">حداکثر ودیعه (تومان)</label>
                                                <input value={maxDeposit}
                                                    onChange={e => {
                                                        const raw = extractDigits(e.target.value);
                                                        setMaxDeposit(formatGrouped(raw));
                                                    }}
                                                    inputMode="numeric"
                                                    placeholder="مثال: 500,000,000"
                                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">حداکثر اجاره (تومان)</label>
                                                <input value={maxRent}
                                                    onChange={e => {
                                                        const raw = extractDigits(e.target.value);
                                                        setMaxRent(formatGrouped(raw));
                                                    }}
                                                    inputMode="numeric"
                                                    placeholder="مثال: 10,000,000"
                                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">شهر</label>
                                            <select value={city} onChange={e => setCity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={loadingCities}>
                                                <option value="">انتخاب شهر</option>
                                                {cities.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                            {loadingCities && <div className="text-xs text-gray-500 mt-1">در حال بارگذاری...</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">محله (چندتایی)</label>
                                            <select multiple value={selectedNeighborhoods} onChange={e => setSelectedNeighborhoods(Array.from(e.target.selectedOptions).map(o => o.value))} className="w-full min-h-[120px] border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={!city || loadingNeighborhoods}>
                                                {neighborhoods.map(n => (
                                                    <option key={n} value={n}>{n}</option>
                                                ))}
                                            </select>
                                            {loadingNeighborhoods && <div className="text-xs text-gray-500 mt-1">در حال بارگذاری...</div>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">تعداد خواب</label>
                                            <select value={rooms} onChange={e => setRooms(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option value="">فرقی ندارد</option>
                                                <option value="1">۱</option>
                                                <option value="2">۲</option>
                                                <option value="3">۳</option>
                                                <option value="4">۴+</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">نوساز</label>
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input type="radio" name="newbuild" checked={newBuildPreference==='any'} onChange={() => setNewBuildPreference('any')} /> فرقی ندارد
                                                </label>
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input type="radio" name="newbuild" checked={newBuildPreference==='new'} onChange={() => setNewBuildPreference('new')} /> نوساز
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">طبقات بالایی بدون آسانسور</label>
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={upperFloorsNoElevator} onChange={e => setUpperFloorsNoElevator(e.target.checked)} />
                                                <span className="text-sm">اوکی هست</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={hasStorage} onChange={e => setHasStorage(e.target.checked)} />
                                            <span className="text-sm">انباری داشته باشد</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={hasParking} onChange={e => setHasParking(e.target.checked)} />
                                            <span className="text-sm">پارکینگ داشته باشد</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center gap-3">
                                        <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold">ثبت مشتری</button>
                                        <a href="/my-customers" className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800">انصراف</a>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
                <div className="fixed top-20 right-0 w-80 h-[calc(100vh-80px)] z-40">
                    <SideBar/>
                </div>
            </div>
        </div>
    );
}


