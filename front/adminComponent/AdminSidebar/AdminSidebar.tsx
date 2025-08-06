'use client'
import { FaFile, FaUsers, FaHome, FaCog } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSideBar(){
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <div className={"side-bar"}>
            <p className={"menu-title"}>
                فهرست
            </p>
            <ul>
                <li>
                    <Link 
                        href="/admin" 
                        className={`menu-link ${isActive('/admin') ? 'active' : ''}`}
                    >
                        <FaHome />
                        <span>
                            داشبورد
                        </span>
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/admin/clients" 
                        className={`menu-link ${isActive('/admin/clients') ? 'active' : ''}`}
                    >
                        <FaUsers />
                        <span>
                            مدیریت مشتریان
                        </span>
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/admin/files" 
                        className={`menu-link ${isActive('/admin/files') ? 'active' : ''}`}
                    >
                        <FaFile />
                        <span>
                            فایل ها
                        </span>
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/admin/settings" 
                        className={`menu-link ${isActive('/admin/settings') ? 'active' : ''}`}
                    >
                        <FaCog />
                        <span>
                            تنظیمات
                        </span>
                    </Link>
                </li>
            </ul>
        </div>
    )
}