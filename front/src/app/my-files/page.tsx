"use client"
import { useEffect, useState } from "react";
import MainMenu from "../../../components/MainMenu/MainMenu";
import SideBar from "../../../components/SideBar/SideBar";

interface PersonalFile {
    id: string;
    title: string;
    type: 'sale' | 'rent' | 'land' | 'partnership';
    city?: string;
    neighborhood?: string;
    metraj?: string;
    description?: string;
    deposit?: string;
    rent?: string;
    totalPrice?: string;
    createdAt: string;
}

export default function Page() {
    const [files, setFiles] = useState<PersonalFile[]>([]);

    useEffect(() => {
        try {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('myPersonalFiles') : null;
            if (stored) {
                setFiles(JSON.parse(stored));
            }
        } catch (e) {
            setFiles([]);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <MainMenu/>
            <div className="flex min-h-[calc(100vh-80px)]">
                {/* Main Content */}
                <div className="flex-1 px-8 pr-96">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold">فایل‌های شخصی</h1>
                        <a href="/my-files/new" className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold">ایجاد فایل جدید</a>
                    </div>

                    {files.length === 0 ? (
                        <div className="text-gray-600">هنوز فایلی ثبت نشده است.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {files.map((f) => (
                                <div key={f.id} className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="font-semibold text-gray-900">{f.title}</h2>
                                        <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700">{labelForType(f.type)}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        {f.city && <p>شهر: {f.city}</p>}
                                        {f.neighborhood && <p>محله: {f.neighborhood}</p>}
                                        {f.metraj && <p>متراژ: {f.metraj}</p>}
                                        {f.description && <p className="line-clamp-2">{f.description}</p>}
                                        
                                        {/* Display price information based on type */}
                                        {f.type === 'rent' && (
                                            <>
                                                {f.deposit && <p className="text-green-600 font-medium">ودیعه: {formatPrice(f.deposit)} تومان</p>}
                                                {f.rent && <p className="text-blue-600 font-medium">اجاره: {formatPrice(f.rent)} تومان</p>}
                                            </>
                                        )}
                                        
                                        {f.type === 'sale' && f.totalPrice && (
                                            <p className="text-green-600 font-medium">قیمت: {formatPrice(f.totalPrice)} تومان</p>
                                        )}
                                    </div>
                                    <div className="mt-3 text-xs text-gray-400">ایجاد: {new Date(f.createdAt).toLocaleString('fa-IR')}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Fixed Sidebar on the right */}
                <div className="fixed top-20 right-0 w-80 h-[calc(100vh-80px)] z-40">
                    <SideBar/>
                </div>
            </div>
        </div>
    );
}

function labelForType(t: PersonalFile['type']) {
    switch (t) {
        case 'sale':
            return 'خرید/فروش';
        case 'rent':
            return 'اجاره';
        case 'land':
            return 'زمین';
        case 'partnership':
            return 'مشارکت';
        default:
            return t;
    }
}

function formatPrice(price: string): string {
    const num = parseInt(price);
    if (isNaN(num)) return price;
    
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + ' میلیارد';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + ' میلیون';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + ' هزار';
    }
    return num.toString();
}


