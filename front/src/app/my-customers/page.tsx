"use client"
import MainMenu from "../../../components/MainMenu/MainMenu";
import SideBar from "../../../components/SideBar/SideBar";

export default function MyCustomersPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                <MainMenu/>
            </div>

            <div className="flex min-h-[calc(100vh-80px)]">
                {/* Main Content */}
                <div className="flex-1 px-8 pr-96">
                    <div className="max-w-4xl mx-auto py-8">
                        <h1 className="text-2xl font-bold mb-4">مشتری‌های من</h1>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-gray-600">
                            هنوز لیستی از مشتری‌ها تعریف نشده است.
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


