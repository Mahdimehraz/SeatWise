'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { userAPI } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mobile: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await userAPI.login(formData.mobile, formData.password);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        router.push('/movies');
      } else {
        // Register
        if (!formData.first_name || !formData.last_name || !formData.email) {
          setError('All fields are required');
          setLoading(false);
          return;
        }
        const response = await userAPI.register(formData);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        router.push('/movies');
      }
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.error || 'خطایی رخ داد';
      
      // Check if invalid credentials
      if (err.isInvalidCredential) {
        toast.error(err.message || 'رمز عبور یا شماره موبایل اشتباه است');
        setError(err.message || 'رمز عبور یا شماره موبایل اشتباه است');
      }
      // Check if service is unavailable
      else if (err.isServiceUnavailable) {
        toast.error(err.message || errorMessage);
      } else {
        // For other errors, show in form and toast
        const displayMessage = err.response?.data?.error || errorMessage;
        toast.error(displayMessage);
        setError(displayMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-5">
      <div className="card max-w-md mx-auto mt-10">
        <h1 className="text-center mb-8 text-gray-800 text-2xl font-bold">
          {isLogin ? 'ورود' : 'ثبت نام'}
        </h1>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group text-right">
                <label>نام</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="text-right"
                />
              </div>
              <div className="form-group text-right">
                <label>نام خانوادگی</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="text-right"
                />
              </div>
              <div className="form-group text-right">
                <label>ایمیل</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            </>
          )}

          <div className="form-group text-right">
            <label>شماره موبایل</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group text-right">
            <label>رمز عبور</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary w-full mt-5"
            disabled={loading}
          >
            {loading ? 'در حال پردازش...' : isLogin ? 'ورود' : 'ثبت نام'}
          </button>
        </form>

        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="bg-transparent border-none text-[#667eea] cursor-pointer underline"
          >
            {isLogin ? 'حساب کاربری ندارید؟ ثبت نام کنید' : 'قبلاً ثبت نام کرده‌اید؟ ورود'}
          </button>
        </div>
      </div>
    </div>
  );
}
