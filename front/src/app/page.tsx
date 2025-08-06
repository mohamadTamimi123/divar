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
        <div className="min-h-screen bg-gray-50">
            <MainMenu/>
            <SideBar/>
            
            {/* Main Content */}
            <div className="main-contact grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-8">
                {loading ? (
                    <div className="col-span-full flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
                        </div>
                    </div>
                ) : posts?.properties && posts.properties.length > 0 ? (
                    posts.properties.map((post: any) => (
                        <div key={post.id} className="w-full">
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
                                />
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">نتیجه‌ای یافت نشد</h3>
                            <p className="text-gray-600">
                                {selectedCity || selectedNeighborhoods.length > 0 
                                    ? "با فیلترهای انتخاب شده نتیجه‌ای یافت نشد" 
                                    : "هنوز ملکی ثبت نشده است"}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
