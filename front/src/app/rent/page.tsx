import MainMenu from "../../../components/MainMenu/MainMenu";
import SideBar from "../../../components/SideBar/SideBar";
import Link from "next/link";
import FileCart from "../../../components/FileCart/FileCart";

export default async function RentPage(){
    const data = await fetch(`${process.env.api_path}/api/v1/rent-files`)
    const posts = await data.json()
    console.log(posts)
    return (

        <>
            <MainMenu/>
            <SideBar/>


            <div className={"main-contact grid grid-cols-5 gap-10"}>
                {
                    posts && posts.map((post : any) => (
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
                    ))
                }




            </div>


        </>
    );
}