"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MainMenu from "../../../../components/MainMenu/MainMenu";
import SideBar from "../../../../components/SideBar/SideBar";
import { formatPrice } from "../../../../utils/priceFormatter";
import { isLoggedIn, hasActiveSubscription, redirectToLogin } from "../../../../utils/authUtils";

interface Property {
    id: string;
    title: string;
    type: 'sale' | 'rent' | 'land' | 'partnership';
    metraj?: string;
    city?: string;
    neighborhood?: string;
    location?: string;
    coverImage?: string;
    locationImage?: string;
    imageLinks?: string[];
    localImages?: string[];
    adLink?: string;
    createdAt: string;
    updatedAt: string;
    
    // Sale details
    saleDetail?: {
        buildYear?: string;
        rooms?: string;
        totalPrice?: string;
        pricePerMeter?: string;
        elevator?: boolean;
        parking?: boolean;
        storage?: boolean;
        description?: string;
    };
    
    // Rent details
    rentDetail?: {
        buildYear?: string;
        rooms?: string;
        deposit?: string;
        rent?: string;
        elevator?: boolean;
        parking?: boolean;
        storage?: boolean;
        description?: string;
    };
}

export default function PropertyDetailPage() {
    const params = useParams();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchPropertyDetails(params.id as string);
        }
    }, [params.id]);

    const fetchPropertyDetails = async (propertyId: string) => {
        try {
            setLoading(true);
            const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';
            const response = await fetch(`${apiPath}/api/v1/files/${propertyId}`);
            
            if (response.ok) {
                const data = await response.json();
                setProperty(data.property);
            } else {
                setError('ملک یافت نشد');
            }
        } catch (error) {
            console.error('Error fetching property:', error);
            setError('خطا در دریافت اطلاعات ملک');
        } finally {
            setLoading(false);
        }
    };

    const handleAdLinkClick = () => {
        // Check if user is logged in for advertisement link access
        if (!isLoggedIn()) {
            setShowAuthModal(true);
            return;
        }

        // Check if user has subscription
        hasActiveSubscription().then(hasSubscription => {
            if (!hasSubscription) {
                setShowSubscriptionModal(true);
                return;
            }

            // If user is logged in and has subscription, redirect to original ad
            if (property?.adLink) {
                window.open(property.adLink, '_blank');
            } else {
                // Fallback to divar search if no direct link
                const searchQuery = encodeURIComponent(property?.title || '');
                window.open(`https://divar.ir/s/tehran?q=${searchQuery}`, '_blank');
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                {/* Header with MainMenu */}
                <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                    <MainMenu/>
                </div>
                
                <div className="flex min-h-[calc(100vh-80px)]">
                    {/* Main Content */}
                    <div className="flex-1 px-8 pr-96">
                        <div className="flex items-center justify-center h-64">
                            <div className="text-gray-500">در حال بارگذاری...</div>
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

    if (error || !property) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                {/* Header with MainMenu */}
                <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                    <MainMenu/>
                </div>
                
                <div className="flex min-h-[calc(100vh-80px)]">
                    {/* Main Content */}
                    <div className="flex-1 px-8 pr-96">
                        <div className="text-center">
                            <div className="text-red-500 text-lg mb-4">{error || 'ملک یافت نشد'}</div>
                            <a href="/" className="text-blue-500 hover:underline">بازگشت به صفحه اصلی</a>
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header with MainMenu */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                <MainMenu/>
            </div>
            
            <div className="flex min-h-[calc(100vh-80px)]">
                {/* Main Content */}
                <div className="flex-1 px-8 pr-96">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                {property.city && <span>شهر: {property.city}</span>}
                                {property.neighborhood && <span>محله: {property.neighborhood}</span>}
                                {property.location && <span>آدرس: {property.location}</span>}
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Images */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Main Image */}
                                {property.coverImage && (
                                    <div className="relative h-80 bg-gray-100 rounded-2xl overflow-hidden">
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001'}/${property.coverImage}`}
                                            alt={property.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Additional Images */}
                                {property.localImages && property.localImages.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {property.localImages.slice(0, 6).map((image, index) => (
                                            <div key={index} className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001'}/${image}`}
                                                    alt={`تصویر ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Description */}
                                {(property.saleDetail?.description || property.rentDetail?.description) && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                        <h3 className="text-lg font-semibold mb-3">توضیحات</h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            {property.saleDetail?.description || property.rentDetail?.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Property Details */}
                            <div className="space-y-6">
                                {/* Property Type Badge */}
                                <div className="bg-white p-4 rounded-2xl border border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-500">نوع ملک</span>
                                        <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium">
                                            {property.type === 'sale' ? 'فروش' : 
                                             property.type === 'rent' ? 'اجاره' : 
                                             property.type === 'land' ? 'زمین' : 'مشارکت'}
                                        </span>
                                    </div>
                                </div>

                                {/* Basic Details */}
                                <div className="bg-white p-4 rounded-2xl border border-gray-200">
                                    <h3 className="text-lg font-semibold mb-3">مشخصات اصلی</h3>
                                    <div className="space-y-3">
                                        {property.metraj && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">متراژ:</span>
                                                <span className="font-medium">{property.metraj}</span>
                                            </div>
                                        )}
                                        {(property.saleDetail?.buildYear || property.rentDetail?.buildYear) && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">سال ساخت:</span>
                                                <span className="font-medium">
                                                    {property.saleDetail?.buildYear || property.rentDetail?.buildYear}
                                                </span>
                                            </div>
                                        )}
                                        {(property.saleDetail?.rooms || property.rentDetail?.rooms) && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">تعداد خواب:</span>
                                                <span className="font-medium">
                                                    {property.saleDetail?.rooms || property.rentDetail?.rooms}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Price Information */}
                                {(property.saleDetail?.totalPrice || property.saleDetail?.pricePerMeter || 
                                  property.rentDetail?.deposit || property.rentDetail?.rent) && (
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200">
                                        <h3 className="text-lg font-semibold mb-3">اطلاعات قیمت</h3>
                                        <div className="space-y-3">
                                            {property.type === 'sale' && (
                                                <>
                                                    {property.saleDetail?.totalPrice && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">قیمت کل:</span>
                                                            <span className="font-bold text-green-600 text-lg">
                                                                {formatPrice(property.saleDetail.totalPrice)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {property.saleDetail?.pricePerMeter && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">قیمت هر متر:</span>
                                                            <span className="font-medium">
                                                                {formatPrice(property.saleDetail.pricePerMeter)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            
                                            {property.type === 'rent' && (
                                                <>
                                                    {property.rentDetail?.deposit && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">ودیعه:</span>
                                                            <span className="font-bold text-green-600 text-lg">
                                                                {formatPrice(property.rentDetail.deposit)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {property.rentDetail?.rent && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">اجاره ماهانه:</span>
                                                            <span className="font-bold text-blue-600 text-lg">
                                                                {formatPrice(property.rentDetail.rent)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Amenities */}
                                {((property.saleDetail?.elevator !== undefined) || 
                                  (property.saleDetail?.parking !== undefined) || 
                                  (property.saleDetail?.storage !== undefined) ||
                                  (property.rentDetail?.elevator !== undefined) || 
                                  (property.rentDetail?.parking !== undefined) || 
                                  (property.rentDetail?.storage !== undefined)) && (
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200">
                                        <h3 className="text-lg font-semibold mb-3">امکانات</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(property.saleDetail?.elevator || property.rentDetail?.elevator) && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm">آسانسور</span>
                                                </div>
                                            )}
                                            {(property.saleDetail?.parking || property.rentDetail?.parking) && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm">پارکینگ</span>
                                                </div>
                                            )}
                                            {(property.saleDetail?.storage || property.rentDetail?.storage) && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm">انبار</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Contact Information */}
                                <div className="bg-white p-4 rounded-2xl border border-gray-200">
                                    <h3 className="text-lg font-semibold mb-3">اطلاعات تماس</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">تاریخ انتشار:</span>
                                            <span className="text-sm">
                                                {new Date(property.createdAt).toLocaleDateString('fa-IR')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">آخرین بروزرسانی:</span>
                                            <span className="text-sm">
                                                {new Date(property.updatedAt).toLocaleDateString('fa-IR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Back Button */}
                        <div className="mt-8 text-center space-y-4">
                            <a 
                                href="/" 
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors duration-200"
                            >
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                بازگشت به صفحه اصلی
                            </a>
                            
                            {/* Advertisement Link Button */}
                            <div className="mt-4">
                                <button 
                                    onClick={handleAdLinkClick}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                                >
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    مشاهده لینک آگهی
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Fixed Sidebar on the right */}
                <div className="fixed top-20 right-0 w-80 h-[calc(100vh-80px)] z-40">
                    <SideBar/>
                </div>
            </div>

            {/* Authentication Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">ورود به سیستم</h3>
                        <p className="text-gray-600 mb-4">
                            برای مشاهده لینک اصلی آگهی، لطفاً وارد شوید یا ثبت‌نام کنید.
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowAuthModal(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                انصراف
                            </button>
                            <button 
                                onClick={() => {
                                    setShowAuthModal(false);
                                    redirectToLogin();
                                }}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                ورود
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscription Modal */}
            {showSubscriptionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">اشتراک ویژه</h3>
                        <p className="text-gray-600 mb-4">
                            برای مشاهده لینک اصلی آگهی، نیاز به اشتراک ویژه دارید.
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowSubscriptionModal(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                انصراف
                            </button>
                            <button 
                                onClick={() => {
                                    setShowSubscriptionModal(false);
                                    window.location.href = '/subscription';
                                }}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                خرید اشتراک
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
