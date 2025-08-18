"use client"
import { useEffect, useState } from "react";
import MainMenu from "../../../components/MainMenu/MainMenu";
import SideBar from "../../../components/SideBar/SideBar";

type CustomerType = 'sale' | 'rent';
type SelectedType = CustomerType | '';

interface CustomerPreference {
    id: string;
    name: string;
    type: CustomerType;
    maxTotalPrice?: string; // for sale
    maxDeposit?: string;    // for rent
    maxRent?: string;       // for rent
    city?: string;
    neighborhoods: string[];
    rooms?: string;
    newBuildPreference?: 'new' | 'any';
    upperFloorsNoElevator?: boolean;
    hasStorage?: boolean;
    hasParking?: boolean;
    createdAt: string;
}

export default function MyCustomersPage() {
    // List state
    const [customers, setCustomers] = useState<CustomerPreference[]>([]);

    // Form state
    const [name, setName] = useState("");
    const [type, setType] = useState<SelectedType>('');
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
    const [showForm, setShowForm] = useState<boolean>(false);

    // City/Neighborhood data
    const [cities, setCities] = useState<string[]>([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

    const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';

    useEffect(() => {
        // Load existing customers
        try {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('myCustomers') : null;
            if (stored) setCustomers(JSON.parse(stored));
        } catch {
            setCustomers([]);
        }
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
        try {
            setLoadingCities(true);
            const res = await fetch(`${apiPath}/api/v1/files/cities`);
            if (res.ok) {
                const data = await res.json();
                setCities(data);
            }
        } catch {}
        finally {
            setLoadingCities(false);
        }
    };

    const fetchNeighborhoods = async (cityName: string) => {
        try {
            setLoadingNeighborhoods(true);
            const res = await fetch(`${apiPath}/api/v1/files/neighborhoods?city=${encodeURIComponent(cityName)}`);
            if (res.ok) {
                const data = await res.json();
                setNeighborhoods(data);
            }
        } catch {}
        finally {
            setLoadingNeighborhoods(false);
        }
    };

    const saveCustomers = (list: CustomerPreference[]) => {
        setCustomers(list);
        if (typeof window !== 'undefined') {
            localStorage.setItem('myCustomers', JSON.stringify(list));
        }
    };

    const resetForm = () => {
        setName("");
        setType('');
        setMaxTotalPrice("");
        setMaxDeposit("");
        setMaxRent("");
        setCity("");
        setNeighborhoods([]);
        setSelectedNeighborhoods([]);
        setRooms("");
        setNewBuildPreference('any');
        setUpperFloorsNoElevator(false);
        setHasStorage(false);
        setHasParking(false);
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) return setError('نام مشتری الزامی است');
        if (!type) return setError('نوع درخواست را انتخاب کنید');
        if (!city) return setError('انتخاب شهر الزامی است');
        if (type === 'sale' && !maxTotalPrice.trim()) return setError('حداکثر قیمت خرید را وارد کنید');
        if (type === 'rent' && !maxDeposit.trim() && !maxRent.trim()) return setError('حداقل یکی از مقادیر ودیعه/اجاره را وارد کنید');

        const newCustomer: CustomerPreference = {
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

        const list = [newCustomer, ...customers];
        saveCustomers(list);
        resetForm();
        setShowForm(false);
    };

    const handleDelete = (id: string) => {
        const list = customers.filter(c => c.id !== id);
        saveCustomers(list);
    };

    const formatPrice = (v?: string) => v ? new Intl.NumberFormat('fa-IR').format(parseInt(v)) : '-';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                <MainMenu/>
            </div>

            <div className="flex min-h-[calc(100vh-80px)]">
                {/* Main Content */}
                <div className="flex-1 px-8 pr-96">
                    <div className="max-w-4xl mx-auto py-8">
                        <h1 className="text-2xl font-bold mb-6">مشتری‌های من</h1>

                        {/* Add Customer Toggle */}
                        {!showForm && (
                            <div className="mb-6">
                                <button onClick={() => setShowForm(true)} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold">افزودن مشتری</button>
                            </div>
                        )}

                        {/* Create Form */}
                        {showForm && (
                            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                                {error && <div className="text-red-600 text-sm">{error}</div>}

                                {/* Basic fields always visible */}
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

                                {/* Show rest after type selection */}
                                {type && (
                                    <>
                                        {/* Conditional budget fields */}
                                        {type === 'sale' ? (
                                            <div>
                                                <label className="block text-sm font-medium mb-1">حداکثر قیمت خرید (تومان)</label>
                                                <input value={maxTotalPrice} onChange={e => setMaxTotalPrice(e.target.value)} placeholder="مثال: 3000000000" className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">حداکثر ودیعه (تومان)</label>
                                                    <input value={maxDeposit} onChange={e => setMaxDeposit(e.target.value)} placeholder="مثال: 500000000" className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">حداکثر اجاره (تومان)</label>
                                                    <input value={maxRent} onChange={e => setMaxRent(e.target.value)} placeholder="مثال: 10000000" className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                                            <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800">انصراف</button>
                                        </div>
                                    </>
                                )}
                            </form>
                        )}

                        {/* List */}
                        <div className="mt-8">
                            {customers.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-200 p-6 text-gray-600">هنوز مشتری‌ای ثبت نشده است.</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {customers.map(c => (
                                        <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-bold text-gray-900">{c.name}</div>
                                                    <div className="text-sm text-gray-600 mt-1">{c.type === 'sale' ? 'خرید/فروش' : 'اجاره'} • {c.city || '-'}</div>
                                                </div>
                                                <button onClick={() => handleDelete(c.id)} className="text-sm text-red-600 hover:text-red-700">حذف</button>
                                            </div>
                                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                                                {c.type === 'sale' ? (
                                                    <div>بودجه خرید: <span className="font-semibold text-green-700">{formatPrice(c.maxTotalPrice)} تومان</span></div>
                                                ) : (
                                                    <>
                                                        <div>حداکثر ودیعه: <span className="font-semibold text-green-700">{formatPrice(c.maxDeposit)} تومان</span></div>
                                                        <div>حداکثر اجاره: <span className="font-semibold text-blue-700">{formatPrice(c.maxRent)} تومان</span></div>
                                                    </>
                                                )}
                                                <div>خواب: <span className="font-semibold">{c.rooms || 'فرقی ندارد'}</span></div>
                                                <div>نوساز: <span className="font-semibold">{c.newBuildPreference === 'new' ? 'بله' : 'فرقی ندارد'}</span></div>
                                                <div>بدون آسانسور (طبقات بالا): <span className="font-semibold">{c.upperFloorsNoElevator ? 'بله' : 'خیر'}</span></div>
                                                <div>انباری: <span className="font-semibold">{c.hasStorage ? 'دارد' : 'مهم نیست'}</span></div>
                                                <div>پارکینگ: <span className="font-semibold">{c.hasParking ? 'دارد' : 'مهم نیست'}</span></div>
                                                <div className="md:col-span-2">محله‌ها: <span className="font-semibold">{(c.neighborhoods || []).join('، ') || '-'}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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


