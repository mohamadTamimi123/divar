'use client'
import AdminSideBar from "../../../../adminComponent/AdminSidebar/AdminSidebar";
import MainMenu from "../../../../components/MainMenu/MainMenu";
import {useEffect, useState} from "react";


export default function FilePage() {


    const [files, setFiles] = useState()
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        fetch(`${process.env.api_path}/api/v1/files`)
            .then(res => {
                console.log(res)
                return res.json()
            })
            .then(data => {
                console.log(data)
                console.log("ok")
            })
    } , [])

    return (

        <>
            <MainMenu/>
            <AdminSideBar/>


            <div className={"main-contact grid grid-cols-5 gap-10"}>


                <table>

                    <thead>
                    <tr>
                        <th>
                            title
                        </th>
                        <th>
                            price
                        </th>
                        <th>
                            location
                        </th>
                    </tr>
                    </thead>


                </table>


            </div>


        </>)
}