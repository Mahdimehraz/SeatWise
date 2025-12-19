'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { productAPI, orderAPI } from '@/lib/api';
import Image from 'next/image';
import { toPersianNumber, formatPersianNumber, formatTime } from '@/lib/utils';

interface Showtime {
  id: number;
  movie_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  total_seats: number;
  reserved_seats: number;
  available_seats: number;
}

interface Movie {
  id: number;
  title: string;
  description: string;
  image_url: string;
  duration: number;
}

const DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

export default function BookPage() {
  const router = useRouter();
  const params = useParams();
  const movieId = parseInt(params.id as string);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<number | null>(null);
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchMovieData();
  }, [movieId, router]);

  const fetchMovieData = async () => {
    try {
      const [movieData, showtimesData] = await Promise.all([
        productAPI.getMovieById(movieId),
        productAPI.getMovieShowtimes(movieId),
      ]);

      setMovie(movieData.movie);
      setShowtimes(showtimesData.showtimes);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load movie data');
    } finally {
      setLoading(false);
    }
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    setSelectedShowtime(null);
    setError('');
    setSuccess('');
  };

  const handleShowtimeSelect = (showtimeId: number) => {
    setSelectedShowtime(showtimeId);
    setError('');
    setSuccess('');
  };

  const handleBookTicket = async () => {
    if (selectedDay === null || selectedShowtime === null) {
      setError('لطفاً روز و سانس را انتخاب کنید');
      return;
    }

    if (numberOfTickets < 1) {
      setError('تعداد بلیت باید حداقل 1 باشد');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await orderAPI.createOrder({
        movie_id: movieId,
        showtime_id: selectedShowtime,
        number_of_tickets: numberOfTickets,
      });

      setSuccess(`بلیت شما با موفقیت رزرو شد! شماره سفارش: ${toPersianNumber(response.order.id)}`);
      
      setTimeout(() => {
        router.push('/orders');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'خطا در رزرو بلیت');
    } finally {
      setSubmitting(false);
    }
  };

  const getShowtimesForDay = (day: number) => {
    return showtimes.filter(s => s.day_of_week === day);
  };

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  if (!movie) {
    return <div className="error-message text-center py-10">فیلم یافت نشد</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 mt-5">
          <h1 className="text-gray-800 text-3xl font-bold">رزرو بلیت فیلم {movie.title}</h1>
          <button
            className="btn btn-secondary mt-5"
            onClick={() => router.push('/movies')}
          >
            بازگشت به لیست فیلم‌ها
          </button>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="card mt-8">
            <div className="flex flex-col md:flex-row">

              {/* ستون اول: عکس فیلم (یک سوم) */}
              <div className="w-full md:w-1/3 flex-shrink-0 text-right">
                <div className="w-full h-[26rem] relative overflow-hidden rounded-lg">
                  <Image
                    src={movie.image_url}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h2 className="mt-5 text-gray-800 text-xl font-semibold">{movie.title}</h2>
                <p className="text-gray-600 mt-2.5">{movie.description}</p>
              </div>

              {/* ستون دوم: فرم رزرو (دو سوم) */}
              <div className="w-full md:w-2/3 flex-shrink-0 text-right mt-6 md:mt-0 pr-0 md:pr-8">
                <h3 className="mb-5 text-gray-800 text-xl font-semibold">رزرو بلیت</h3>

                <div className="form-group">
                  <label>انتخاب روز هفته</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    {DAYS.map((day, index) => {
                      const dayShowtimes = getShowtimesForDay(index);
                      const hasShowtimes = dayShowtimes.length > 0;
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          className={`px-3 py-3 border-2 rounded-lg text-sm transition-all duration-300 ${
                            selectedDay === index
                              ? 'border-[#667eea] bg-[#667eea] text-white'
                              : 'border-gray-300 bg-white hover:border-[#667eea] hover:bg-blue-50'
                          } ${!hasShowtimes ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          onClick={() => hasShowtimes && handleDaySelect(index)}
                          disabled={!hasShowtimes}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDay !== null && (
                  <div className="form-group">
                    <label>انتخاب سانس</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {getShowtimesForDay(selectedDay).map((showtime) => (
                        <button
                          key={showtime.id}
                          type="button"
                          className={`p-4 border-2 rounded-lg text-center transition-all duration-300 ${
                            selectedShowtime === showtime.id
                              ? 'border-[#667eea] bg-[#667eea] text-white'
                              : 'border-gray-300 bg-white hover:border-[#667eea] hover:bg-blue-50'
                          } ${showtime.available_seats === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          onClick={() => handleShowtimeSelect(showtime.id)}
                          disabled={showtime.available_seats === 0}
                        >
                          <div>{toPersianNumber(formatTime(showtime.end_time))} - {toPersianNumber(formatTime(showtime.start_time))}</div>
                          <div className="text-xs mt-1">
                            {toPersianNumber(showtime.available_seats)} صندلی خالی 
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedShowtime && (
                  <>
                    <div className="form-group">
                      <label>تعداد بلیت</label>
                      <input
                        type="number"
                        min="1"
                        max={showtimes.find(s => s.id === selectedShowtime)?.available_seats || 1}
                        value={numberOfTickets}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          const maxTickets = showtimes.find(s => s.id === selectedShowtime)?.available_seats || 1;
                          setNumberOfTickets(Math.min(Math.max(1, value), maxTickets));
                        }}
                      />
                      <div className="text-xs text-gray-600 mt-1">
                        حداکثر {toPersianNumber(showtimes.find(s => s.id === selectedShowtime)?.available_seats || 0)} بلیت
                      </div>
                    </div>

                    <div className="mt-5 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span>قیمت هر بلیت:</span>
                        <span>{formatPersianNumber(50000)} تومان</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>مجموع:</span>
                        <span>{formatPersianNumber(numberOfTickets * 50000)} تومان</span>
                      </div>
                    </div>
                  </>
                )}

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button
                  className="btn btn-primary w-full mt-5"
                  onClick={handleBookTicket}
                  disabled={!selectedShowtime || submitting}
                >
                  {submitting ? 'در حال پردازش...' : 'رزرو بلیت'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
