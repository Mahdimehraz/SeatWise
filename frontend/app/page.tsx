'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleBuyTicket = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      router.push('/movies');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex justify-center relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80)'
        }}
      />
      <div className="relative z-10 text-center text-white px-10 mt-52 md:mt-64">
        <h1 className="text-6xl md:text-5xl font-extrabold mb-5 drop-shadow-lg">
          سامانه رزرو بلیت سینما پرده
        </h1>
        <p className="text-2xl md:text-2xl mb-10 opacity-90">
          بهترین تجربه سینمایی شما
        </p>
        <button className="btn btn-primary text-lg" onClick={handleBuyTicket}>
          خرید بلیت
        </button>
      </div>
    </div>
  );
}
