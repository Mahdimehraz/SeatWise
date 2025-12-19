'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productAPI } from '@/lib/api';
import Image from 'next/image';
import { toPersianNumber } from '@/lib/utils';
import { FaShoppingCart, FaSignOutAlt } from 'react-icons/fa';

interface Movie {
  id: number;
  title: string;
  description: string;
  image_url: string;
  duration: number;
}

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchMovies();
  }, [router]);

  const fetchMovies = async () => {
    try {
      const data = await productAPI.getAllMovies();
      setMovies(data.movies);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const handleMovieSelect = (movieId: number) => {
    router.push(`/movies/${movieId}/book`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="error-message text-center py-10">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-5">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex justify-between items-center mb-10 mt-5">
          <h1 className="text-gray-800 text-3xl font-bold">انتخاب فیلم</h1>
          <div className="flex gap-2.5">
            <button className="btn btn-primary hidden md:block" onClick={() => router.push('/orders')}>
              سفارش‌های من
            </button>
            <button className="btn btn-primary block md:hidden" onClick={() => router.push('/orders')}>
              <FaShoppingCart />
            </button>
            <button className="btn btn-secondary hidden md:block" onClick={handleLogout}>
              خروج
            </button>
            <button className="btn btn-secondary block md:hidden" onClick={handleLogout}>
              <FaSignOutAlt />
            </button>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className="card cursor-pointer text-right" 
              onClick={() => handleMovieSelect(movie.id)}
            >
              <div className="w-full h-96 relative overflow-hidden rounded-lg">
                <Image
                  src={movie.image_url}
                  alt={movie.title}
                  fill
                  className=""
                />
              </div>
              <h2 className="mt-4 mb-2 text-gray-800 text-xl font-semibold">{movie.title}</h2>
              <p className="text-gray-600 mb-3 line-clamp-4">{movie.description}</p>
              <p className="text-gray-500 text-sm mb-4">مدت زمان: {toPersianNumber(movie.duration)} دقیقه</p>
              <button className="btn btn-primary w-full mt-4">
                رزرو بلیت
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
