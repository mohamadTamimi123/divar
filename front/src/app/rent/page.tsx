import MainMenu from "../../../components/MainMenu/MainMenu";
import SideBar from "../../../components/SideBar/SideBar";
import Link from "next/link";
import FileCart from "../../../components/FileCart/FileCart";

export default async function RentPage(){
    const data = await fetch(`${process.env.api_path}/api/v1/rent-files`)
    const posts = await data.json()
    console.log(posts)
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header with MainMenu */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                <MainMenu/>
            </div>
            
            <div className="flex min-h-[calc(100vh-80px)]">
                {/* Main Content */}
                <div className="flex-1 px-8 pr-96">
                    <div className="mb-8 text-right">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            فایل‌های اجاره
                        </h1>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts && posts.map((post : any) => (
                            <FileCart  
                                key={post.id}
                                id={post.id}
                                title={post.title} 
                                location={post.location} 
                                neighborhood={post.neighborhood}
                                deposit={post.rentDetail?.deposit || post.vadie} 
                                rent={post.rentDetail?.rent || post.ejare} 
                                metraj={post.metraj}
                                tabagheCurrent={post.rentDetail?.tabagheCurrent}
                                buildYear={post.rentDetail?.buildYear}
                                rentDetail={post.rentDetail}
                                image={post.coverImage || post.localImages?.[0]}  
                            />
                        ))}
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