'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { orderAPI, productAPI } from '@/lib/api';
import Image from 'next/image';
import { toPersianNumber, formatPersianNumber, formatTime } from '@/lib/utils';

interface Order {
  id: number;
  user_id: number;
  movie_id: number;
  showtime_id: number;
  number_of_tickets: number;
  total_amount: number;
  status: string;
  created_at: string;
  showtime?: {
    day_of_week: number;
    start_time: string;
    end_time: string;
  };
}

interface Movie {
  id: number;
  title: string;
  image_url: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [movies, setMovies] = useState<{ [key: number]: Movie }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<{ orderId: number; message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const data = await orderAPI.getUserOrders();
      setOrders(data.orders);
      
      // Fetch movie details for each order
      const movieIds = Array.from(new Set(data.orders.map((o: Order) => o.movie_id))) as number[];
      const moviePromises = movieIds.map(async (movieId: number) => {
        try {
          const movieData = await productAPI.getMovieById(movieId);
          return { [movieId]: movieData.movie };
        } catch (err) {
          return {};
        }
      });
      
      const movieResults = await Promise.all(moviePromises);
      const moviesMap = Object.assign({}, ...movieResults);
      setMovies(moviesMap);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.error || 'خطا در بارگذاری سفارشات';
      
      // Check if service is unavailable
      if (err.isServiceUnavailable || err.message) {
        toast.error(err.message || errorMessage);
        setError(err.message || errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (orderId: number) => {
    setProcessingPayment(orderId);
    setPaymentMessage(null);
    
    try {
      const response = await orderAPI.processPayment(orderId);
      
      if (response.payment_status === 'success') {
        setPaymentMessage({
          orderId,
          message: `پرداخت با موفقیت انجام شد! شماره تراکنش: ${toPersianNumber(response.transaction_id)}`,
          type: 'success',
        });
        
        // Refresh orders list
        await fetchOrders();
      } else {
        setPaymentMessage({
          orderId,
          message: response.message || 'پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.',
          type: 'error',
        });
      }
    } catch (err: any) {
      let errorMessage = err.message || err.response?.data?.error || err.response?.data?.message || 'خطا در پردازش پرداخت';
      
      // Check if payment service is unavailable
      if (err.isPaymentServiceUnavailable) {
        toast.error(err.message || 'سرویس پرداخت در دسترس نیست. لطفاً بعداً تلاش کنید.');
        setPaymentMessage({
          orderId,
          message: err.message || 'سرویس پرداخت در دسترس نیست. لطفاً بعداً تلاش کنید.',
          type: 'error',
        });
      }
      // Check if payment failed
      else if (err.isPaymentFailed) {
        toast.error(err.message || 'پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.');
        setPaymentMessage({
          orderId,
          message: err.message || 'پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.',
          type: 'error',
        });
      }
      // Check if order service is unavailable
      else if (err.isServiceUnavailable) {
        toast.error(err.message || errorMessage);
        setPaymentMessage({
          orderId,
          message: err.message || errorMessage,
          type: 'error',
        });
      }
      // Other errors
      else {
        toast.error(errorMessage);
        setPaymentMessage({
          orderId,
          message: errorMessage,
          type: 'error',
        });
      }
    } finally {
      setProcessingPayment(null);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'در انتظار پرداخت';
      case 'paid':
        return 'پرداخت شده';
      case 'confirmed':
        return 'تأیید شده';
      case 'cancelled':
        return 'لغو شده';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'paid':
        return 'text-green-600';
      case 'confirmed':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
    return days[dayOfWeek] || '';
  };

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-5">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex justify-between items-center mb-10 mt-5">
          <h1 className="text-gray-800 text-3xl font-bold">سفارشات من</h1>
          <button className="btn btn-primary" onClick={() => router.push('/movies')}>
            بازگشت به فیلم‌ها
          </button>
        </div>

        {error && <div className="error-message text-center py-5">{error}</div>}

        {orders.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-gray-600 text-lg mb-5">شما هنوز سفارشی ثبت نکرده‌اید</p>
            <button className="btn btn-primary mt-5" onClick={() => router.push('/movies')}>
              مشاهده فیلم‌ها
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {orders.map((order) => (
              <div key={order.id} className="card">
                <div className="flex gap-8">
                  {/* ستون اول: عکس فیلم */}
                  {movies[order.movie_id] && (
                    <div className="w-2/5 flex-shrink-0 hidden lg:block">
                      <div className="w-full h-[330px] relative overflow-hidden rounded-lg">
                        <Image
                          src={movies[order.movie_id].image_url}
                          alt={movies[order.movie_id].title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* ستون دوم: اطلاعات سفارش */}
                  <div className="flex-1 text-right">
                    {movies[order.movie_id] && (
                      <h3 className="mb-3 text-gray-800 text-xl font-semibold">{movies[order.movie_id].title}</h3>
                    )}
                    <h4 className="mb-3 text-gray-600 text-base font-medium">سفارش #{toPersianNumber(order.id)}</h4>
                    <p className="text-gray-600 mb-2">
                      <strong>تعداد بلیت:</strong> {toPersianNumber(order.number_of_tickets)}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <strong>مبلغ کل:</strong> {formatPersianNumber(order.total_amount)} تومان
                    </p>
                    {order.showtime && (
                      <>
                        <p className="text-gray-600 mb-2">
                          <strong>روز:</strong> {getDayName(order.showtime.day_of_week)}
                        </p>
                        <p className="text-gray-600 mb-2">
                          <strong>سانس:</strong> {toPersianNumber(formatTime(order.showtime.end_time))} - {toPersianNumber(formatTime(order.showtime.start_time))}
                        </p>
                      </>
                    )}
                    <p className="text-gray-600 mb-2">
                      <strong>تاریخ:</strong> {new Date(order.created_at).toLocaleDateString('fa-IR')}
                    </p>
                    <p className="text-gray-600 mb-4">
                      <strong>وضعیت:</strong> 
                      <span className={`mr-2 font-bold ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </p>
                    
                    {paymentMessage && paymentMessage.orderId === order.id && (
                      <div className={paymentMessage.type === 'success' ? 'success-message' : 'error-message'} style={{ marginBottom: '12px' }}>
                        {paymentMessage.message}
                      </div>
                    )}
                    
                    {order.status === 'pending' && (
                      <button
                        className="btn btn-primary mt-2"
                        onClick={() => handlePayment(order.id)}
                        disabled={processingPayment === order.id}
                      >
                        {processingPayment === order.id ? 'در حال پردازش...' : 'پرداخت'}
                      </button>
                    )}
                    
                    {order.status === 'paid' && (
                      <div className="inline-block mt-2 px-4 py-2 bg-green-100 text-green-800 rounded">
                        ✓ پرداخت شده
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
