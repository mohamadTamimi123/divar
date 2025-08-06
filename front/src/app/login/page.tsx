'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainMenu from "../../../components/MainMenu/MainMenu";
import { FaEye, FaEyeSlash, FaPhone, FaLock, FaChevronDown } from 'react-icons/fa';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (!phone || !password) {
            setError('لطفاً تمام فیلدها را پر کنید');
            setLoading(false);
            return;
        }

        // Phone number validation
        if (phone.length !== 10 || !phone.startsWith('9')) {
            setError('شماره تلفن باید با 9 شروع شود و 10 رقم باشد');
            setLoading(false);
            return;
        }

        try {
            const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';
            const response = await fetch(`${apiPath}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone: '+98' + phone, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                router.push('/');
            } else {
                setError(data.error || 'خطا در ورود');
            }
        } catch (error) {
            setError('خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        // Remove all non-digit characters
        value = value.replace(/\D/g, '');
        
        // Ensure it starts with 9
        if (value.length > 0 && !value.startsWith('9')) {
            value = '9' + value.replace(/^9/, '');
        }
        
        // Limit to 10 digits
        if (value.length <= 10) {
            setPhone(value);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <MainMenu />
            
            <div className="flex items-center justify-center min-h-screen pt-20">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">ورود به سیستم</h1>
                        <p className="text-gray-600">برای مشاهده جزئیات کامل آگهی‌ها وارد شوید</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                شماره تلفن
                            </label>
                            <div className="flex flex-row-reverse">
                                {/* Country Code Select */}
                                <div className="relative">
                                    <div className="flex items-center bg-gray-100 border border-gray-300 border-l rounded-l-lg px-3 py-3 min-w-[80px]">
                                        <span className="text-gray-700 font-medium">+98</span>
                                        <FaChevronDown className="mr-2 text-gray-400" size={12} />
                                    </div>
                                </div>
                                
                                {/* Phone Input */}
                                <div className="relative flex-1 ">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <FaPhone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        placeholder="9123333333"
                                        className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                شماره تلفن باید با 9 شروع شود (مثال: 9123333333)
                            </p>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                رمز عبور
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                    placeholder="رمز عبور خود را وارد کنید"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 left-0 pl-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    در حال ورود...
                                </div>
                            ) : (
                                'ورود'
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            حساب کاربری ندارید؟{' '}
                            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                ثبت نام کنید
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 