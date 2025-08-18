"use client"
import { useEffect, useState } from "react";
import MainMenu from "../../../components/MainMenu/MainMenu";
import SideBar from "../../../components/SideBar/SideBar";

type Period = "monthly" | "yearly";

interface Plan {
    id: string;
    name: string;
    description: string;
    features: string[];
    price: { monthly: number; yearly: number };
    duration: { monthly: number; yearly: number };
}

export default function SubscriptionPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [currency, setCurrency] = useState<string>("تومان");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");
    const [selectedPeriod, setSelectedPeriod] = useState<Period>("monthly");
    const [discountCode, setDiscountCode] = useState<string>("");
    const [checkingDiscount, setCheckingDiscount] = useState<boolean>(false);
    const [discountResult, setDiscountResult] = useState<any>(null);
    const [creatingPayment, setCreatingPayment] = useState<boolean>(false);
    const [activeSub, setActiveSub] = useState<any>(null);

    useEffect(() => {
        fetchPlans();
        fetchActiveSubscription();
    }, []);

    const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiPath}/api/v1/payment/plans`);
            if (!response.ok) throw new Error("خطا در دریافت پلن‌ها");
            const data = await response.json();
            setPlans(data.plans || []);
            setCurrency(data.currency || "تومان");
            if (data.plans && data.plans.length > 0) {
                setSelectedPlanId(data.plans[0].id);
            }
        } catch (e: any) {
            setError(e.message || "خطا در دریافت پلن‌ها");
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveSubscription = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
            if (!token) return;
            const res = await fetch(`${apiPath}/api/v1/auth/subscription-status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return;
            const data = await res.json();
            if (data.hasActiveSubscription && data.subscriptionDetails) {
                setActiveSub(data.subscriptionDetails);
            } else {
                setActiveSub(null);
            }
        } catch (e) {
            setActiveSub(null);
        }
    };

    const applyDiscount = async () => {
        if (!discountCode.trim() || !selectedPlanId) return;
        try {
            setCheckingDiscount(true);
            const response = await fetch(`${apiPath}/api/v1/payment/check-discount`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: discountCode.trim(), planId: selectedPlanId, period: selectedPeriod })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'کد تخفیف نامعتبر است');
            setDiscountResult(data.discount);
        } catch (e: any) {
            setDiscountResult(null);
            alert(e.message || 'کد تخفیف نامعتبر است');
        } finally {
            setCheckingDiscount(false);
        }
    };

    const createPayment = async () => {
        try {
            if (!selectedPlanId) return alert('ابتدا یک پلن را انتخاب کنید');
            setCreatingPayment(true);
            const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
            if (!token) return window.location.href = '/login';
            const response = await fetch(`${apiPath}/api/v1/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ planId: selectedPlanId, period: selectedPeriod, discountCode: discountCode || undefined })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'خطا در ایجاد پرداخت');
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                alert('خطا در دریافت آدرس پرداخت');
            }
        } catch (e: any) {
            alert(e.message || 'خطا در ایجاد پرداخت');
        } finally {
            setCreatingPayment(false);
        }
    };

    const formatPrice = (v: number) => new Intl.NumberFormat('fa-IR').format(v);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
                <MainMenu/>
            </div>

            <div className="flex min-h-[calc(100vh-80px)]">
                <div className="flex-1 px-8 pr-96">
                    <div className="max-w-4xl mx-auto py-8">
                        <h1 className="text-2xl font-bold mb-6">خرید اشتراک</h1>

                        {activeSub && (
                            <div className="mb-8 bg-white p-5 rounded-2xl border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-green-700">اشتراک فعال</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {activeSub.planName ? `${activeSub.planName} - ${activeSub.period === 'yearly' ? 'سالانه' : 'ماهانه'}` : activeSub.description}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">مانده: {activeSub.daysRemaining} روز</div>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800">{new Intl.NumberFormat('fa-IR').format(activeSub.amount)} {currency}</div>
                                        <div className="text-xs text-gray-500">شناسه پرداخت: {activeSub.paymentId}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="text-gray-500">در حال بارگذاری پلن‌ها...</div>
                        ) : error ? (
                            <div className="text-red-600">{error}</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {plans.map((plan) => (
                                    <div key={plan.id} className={`rounded-2xl border ${selectedPlanId === plan.id ? 'border-blue-400' : 'border-gray-200'} bg-white p-5 shadow-sm`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h2 className="font-bold text-lg">{plan.name}</h2>
                                            <input type="radio" name="plan" checked={selectedPlanId === plan.id} onChange={() => setSelectedPlanId(plan.id)} />
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                                        <ul className="text-sm text-gray-700 space-y-1 mb-4">
                                            {plan.features.map((f) => (<li key={f}>• {f}</li>))}
                                        </ul>
                                        <div className="flex items-center gap-2 text-gray-800">
                                            <button onClick={() => setSelectedPeriod('monthly')} className={`px-3 py-1 rounded-lg text-sm ${selectedPeriod === 'monthly' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>ماهانه</button>
                                            <button onClick={() => setSelectedPeriod('yearly')} className={`px-3 py-1 rounded-lg text-sm ${selectedPeriod === 'yearly' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>سالانه</button>
                                        </div>
                                        <div className="mt-3 font-bold text-xl text-green-600">
                                            {formatPrice(plan.price[selectedPeriod])} {currency}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Discount */}
                        <div className="mt-8 bg-white p-5 rounded-2xl border border-gray-200">
                            <h3 className="font-semibold mb-3">کد تخفیف</h3>
                            <div className="flex items-center gap-2">
                                <input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="مثال: WELCOME10" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <button onClick={applyDiscount} disabled={checkingDiscount || !discountCode} className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-60">اعمال</button>
                            </div>
                            {discountResult && (
                                <div className="mt-3 text-sm text-green-700">قیمت نهایی با تخفیف: {formatPrice(discountResult.finalPrice)} {currency}</div>
                            )}
                        </div>

                        <div className="mt-6">
                            <button onClick={createPayment} disabled={creatingPayment || !selectedPlanId} className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60">
                                {creatingPayment ? 'در حال انتقال به درگاه...' : 'پرداخت و انتقال به درگاه'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="fixed top-20 right-0 w-80 h-[calc(100vh-80px)] z-40">
                    <SideBar/>
                </div>
            </div>
        </div>
    );
}


