'use client'
import Image from "next/image";
import sampl from "../../public/8dccefa9-3c8e-4605-8a84-f1356da3523b.jpg"
import { formatPrice } from "../../utils/priceFormatter";
import { useState } from "react";
import { isLoggedIn, hasActiveSubscription, redirectToLogin } from "../../utils/authUtils";

export default function FileCart(props:any) {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

    const handleMoreClick = async () => {
        // Check if user is logged in
        if (!isLoggedIn()) {
            setShowAuthModal(true);
            return;
        }

        // Check if user has subscription
        const hasSubscription = await hasActiveSubscription();
        if (!hasSubscription) {
            setShowSubscriptionModal(true);
            return;
        }

        // Redirect to detail page
        window.location.href = `/buy/${props.id}`;
    };

    return (
        <>
            <div className="file-cart--main bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
                {/* Image Section */}
                {props.image ? (
                    <div className="relative w-full h-[200px] bg-gray-50 overflow-hidden">
                        <Image
                            src={`${process.env.api_path}/${props.image}`}
                            alt="image"
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-full h-[200px] bg-gray-50">
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-2xl">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 10a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                )}
                
                {/* Content Section */}
                <div className="flex flex-col flex-1 justify-between p-6">
                    <div className="space-y-3">
                        {/* Title */}
                        <h2 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-tight" title={props.title}>
                            {props.title}
                        </h2>
                        
                        {/* Location and Neighborhood */}
                        <div className="space-y-2">
                            {/* Neighborhood */}
                            {props.neighborhood && (
                                <div className="flex items-center gap-2 text-blue-600">
                                    <div className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded-lg">
                                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold">{props.neighborhood}</span>
                                </div>
                            )}
                            
                            {/* Location */}
                            {(props.location || props.neighborhood) && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="flex items-center justify-center w-5 h-5 bg-gray-100 rounded-lg">
                                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">{props.location || props.neighborhood}</span>
                                </div>
                            )}
                        </div>

                        {/* Property Details */}
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            {/* Metraj */}
                            {(props.metraj || props.saleDetail?.metraj) && (
                                <div className="flex items-center gap-1 text-gray-600">
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                    <span className="font-medium">{props.metraj || props.saleDetail?.metraj} متر</span>
                                </div>
                            )}
                            
                            {/* Floor */}
                            {(props.tabagheCurrent || props.saleDetail?.tabagheCurrent) && (
                                <div className="flex items-center gap-1 text-gray-600">
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="font-medium">طبقه {props.tabagheCurrent || props.saleDetail?.tabagheCurrent}</span>
                                </div>
                            )}
                            
                            {/* Build Year */}
                            {(props.buildYear || props.saleDetail?.buildYear) && (
                                <div className="flex items-center gap-1 text-gray-600">
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">{props.buildYear || props.saleDetail?.buildYear}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Price and Details */}
                    <div className="mt-6 space-y-3">
                        {/* Sale Price Details */}
                        {(props.totalPrice || props.pricePerMeter) && (
                            <div className="space-y-2">
                                {props.totalPrice && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">قیمت کل:</span>
                                        <span className="font-semibold text-green-600">{formatPrice(props.totalPrice)}</span>
                                    </div>
                                )}
                                {props.pricePerMeter && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">قیمت هر متر:</span>
                                        <span className="font-semibold text-gray-900">{formatPrice(props.pricePerMeter)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Rent/Deposit Details */}
                        {(props.vadie || props.ejare) && (
                            <div className="flex justify-between text-sm">
                                {props.vadie && (
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-500">رهن:</span>
                                        <span className="font-semibold text-gray-900">{formatPrice(props.vadie)}</span>
                                    </div>
                                )}
                                {props.ejare && (
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-500">اجاره:</span>
                                        <span className="font-semibold text-gray-900">{formatPrice(props.ejare)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Legacy Price */}
                        {props.price && !props.totalPrice && !props.pricePerMeter && (
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className="text-xs text-gray-500 font-medium">قیمت کل</span>
                                <span className="text-lg font-bold text-green-600">{formatPrice(props.price)}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Footer with More Button */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">زیر قیمت بازار</span>
                            <button 
                                onClick={handleMoreClick}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                                بیشتر
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Authentication Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">ورود به سیستم</h3>
                        <p className="text-gray-600 mb-4">
                            برای مشاهده جزئیات کامل آگهی، لطفاً وارد شوید یا ثبت‌نام کنید.
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
                            برای مشاهده جزئیات کامل آگهی، نیاز به اشتراک ویژه دارید.
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
        </>
    )
}