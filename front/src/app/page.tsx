'use client'
import Image from "next/image";
import FileCart from "../../components/FileCart/FileCart";
import SideBar from "../../components/SideBar/SideBar";
import MainMenu from "../../components/MainMenu/MainMenu";
import Link from "next/link";
import RentFileCart from "../../components/FileCart/RentFileCart";
import { useFilters } from "../context/FiltersContext";
import { useState, useEffect } from "react";

export default function Home() {
    const { selectedCity, selectedNeighborhoods } = useFilters();
    const [posts, setPosts] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, [selectedCity, selectedNeighborhoods]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';
            let url = `${apiPath}/api/v1/files`;
            
            const params = new URLSearchParams();
            if (selectedCity) {
                params.append('city', selectedCity);
            }
            if (selectedNeighborhoods.length > 0) {
                // Send multiple neighborhoods as comma-separated values
                params.append('neighborhood', selectedNeighborhoods.join(','));
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            {/* Header with MainMenu */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                <MainMenu/>
            </div>
            
            {/* Main Layout Container */}
            <div className="flex min-h-[calc(100vh-80px)]">
                {/* Main Content */}
                <div className="flex-1 px-8 pr-96">
                    {/* Page Header */}
                    <div className="mb-8 text-right mt-7">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                           همه فایل
                        </h1>         
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {loading ? (
                            <div className="col-span-full flex justify-center items-center py-20">
                                <div className="text-center">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto" style={{animationDelay: '0.5s'}}></div>
                                    </div>
                                    <p className="mt-6 text-gray-600 text-lg font-medium">در حال بارگذاری فایل‌های املاک...</p>
                                </div>
                            </div>
                        ) : posts?.properties && posts.properties.length > 0 ? (
                            posts.properties.map((post: any) => (
                                <div key={post.id} className="w-full transform hover:scale-105 transition-all duration-300">
                                    {post.saleDetail ? (
                                        <FileCart 
                                            id={post.id}
                                            title={post.title} 
                                            location={post.location} 
                                            neighborhood={post.neighborhood} 
                                            totalPrice={post.saleDetail?.totalPrice} 
                                            pricePerMeter={post.saleDetail?.pricePerMeter}
                                            metraj={post.metraj}
                                            tabagheCurrent={post.saleDetail?.tabagheCurrent}
                                            buildYear={post.saleDetail?.buildYear}
                                            saleDetail={post.saleDetail}
                                            image={post.coverImage}
                                            adLink={post.adLink}
                                        />
                                    ) : (
                                        <RentFileCart 
                                            id={post.id}
                                            title={post.title} 
                                            location={post.location} 
                                            neighborhood={post.neighborhood} 
                                            deposit={post.rentDetail?.deposit}
                                            rent={post.rentDetail?.rent}
                                            metraj={post.metraj}
                                            tabagheCurrent={post.rentDetail?.tabagheCurrent}
                                            buildYear={post.rentDetail?.buildYear}
                                            rentDetail={post.rentDetail}
                                            image={post.coverImage}
                                            adLink={post.adLink}
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full flex justify-center items-center py-20">
                                <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-gray-200/50">
                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3">نتیجه‌ای یافت نشد</h3>
                                    <p className="text-gray-600 text-lg mb-6">
                                        {selectedCity || selectedNeighborhoods.length > 0 
                                            ? "با فیلترهای انتخاب شده نتیجه‌ای یافت نشد" 
                                            : "هنوز ملکی ثبت نشده است"}
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <button 
                                            onClick={() => window.location.reload()} 
                                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                        >
                                            تلاش مجدد
                                        </button>
                                        <button 
                                            onClick={() => window.location.href = '/'} 
                                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
                                        >
                                            بازگشت
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Stats */}
                    {posts?.properties && posts.properties.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-200/50">
                            <div className="text-center">
                                <p className="text-gray-500 text-sm">
                                    نمایش {posts.properties.length} فایل از {posts.pagination?.totalItems || posts.properties.length} فایل موجود
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Fixed Sidebar on the right */}
            <div className="fixed top-20 right-0 w-80 h-[calc(100vh-80px)] z-40">
                <SideBar/>
            </div>
        </div>
    );
}
