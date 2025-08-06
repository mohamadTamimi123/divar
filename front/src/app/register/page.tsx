'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEye, FaEyeSlash, FaPhone, FaLock, FaUser, FaChevronDown } from 'react-icons/fa';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.phone || !formData.password || !formData.confirmPassword) {
      setError('لطفاً تمام فیلدها را پر کنید');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل 6 کاراکتر باشد');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند');
      setLoading(false);
      return;
    }

    // Phone number validation (should be 10 digits after +98)
    const phoneNumber = '+98' + formData.phone;
    if (formData.phone.length !== 10 || !formData.phone.startsWith('9')) {
      setError('شماره تلفن باید با 9 شروع شود و 10 رقم باشد');
      setLoading(false);
      return;
    }

    try {
      const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';
      
      const response = await fetch(`${apiPath}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        alert('ثبت نام با موفقیت انجام شد. لطفاً وارد شوید.');
        router.push('/login');
      } else {
        setError(data.error || 'خطا در ثبت نام');
      }
    } catch (error) {
      console.error('Registration error:', error);
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
      setFormData({ ...formData, phone: value });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ثبت نام</h1>
          <p className="text-gray-600">حساب کاربری جدید ایجاد کنید</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
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
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="9123333333"
                    className="block w-full pr-10 pl-3 py-3 border border-gray-300  rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                شماره تلفن باید با 9 شروع شود (مثال: 9123333333)
              </p>
            </div>

            {/* Password */}
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
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="حداقل 6 کاراکتر"
                  className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                تکرار رمز عبور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="تکرار رمز عبور"
                  className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  در حال ثبت نام...
                </div>
              ) : (
                <>
                  <FaUser />
                  ثبت نام
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              قبلاً حساب کاربری دارید؟{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                وارد شوید
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            با ثبت نام، شما{' '}
            <Link href="/terms" className="text-indigo-600 hover:text-indigo-700">
              شرایط استفاده
            </Link>{' '}
            و{' '}
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700">
              حریم خصوصی
            </Link>{' '}
            ما را می‌پذیرید.
          </p>
        </div>
      </div>
    </div>
  );
} 