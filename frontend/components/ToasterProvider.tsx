'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster 
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 5000,
        style: {
          background: '#363636',
          color: '#fff',
          fontFamily: 'inherit',
          fontSize: '15px',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#4ade80',
            secondary: '#fff',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

