"use client"
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MainMenu from "../../../../components/MainMenu/MainMenu";
import SideBar from "../../../../components/SideBar/SideBar";

export default function PaymentResultPage() {
    const params = useSearchParams();
    const [status, setStatus] = useState<string | null>(null);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [refId, setRefId] = useState<string | null>(null);

    useEffect(() => {
        setStatus(params.get('status'));
        setPaymentId(params.get('paymentId'));
        setRefId(params.get('refId'));
    }, [params]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                <MainMenu/>
            </div>

            <div className="flex min-h-[calc(100vh-80px)]">
                <div className="flex-1 px-8 pr-96">
                    <div className="max-w-2xl mx-auto py-10">
                        <h1 className="text-2xl font-bold mb-6">نتیجه پرداخت</h1>

                        {status === 'success' ? (
                            <div className="bg-white rounded-2xl border border-green-200 p-6 text-green-700">
                                <div className="font-semibold mb-2">پرداخت با موفقیت انجام شد</div>
                                {refId && <div className="text-sm">کد رهگیری: {refId}</div>}
                                {paymentId && <div className="text-sm">شناسه پرداخت: {paymentId}</div>}
                                <div className="mt-4">
                                    <a href="/" className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white">بازگشت به صفحه اصلی</a>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-red-200 p-6 text-red-700">
                                <div className="font-semibold mb-2">پرداخت ناموفق بود</div>
                                {paymentId && <div className="text-sm">شناسه پرداخت: {paymentId}</div>}
                                <div className="mt-4">
                                    <a href="/subscription" className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white">تلاش مجدد</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="fixed top-20 right-0 w-80 h-[calc(100vh-80px)] z-40">
                    <SideBar/>
                </div>
            </div>
        </div>
    );
}


