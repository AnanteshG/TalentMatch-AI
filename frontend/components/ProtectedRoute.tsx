"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType: 'user' | 'company';
}

export default function ProtectedRoute({ children, userType }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = auth.currentUser;
        
        if (!user) {
          router.push('/login');
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.email!));
        const userData = userDoc.data();

        if (userData?.userType !== userType) {
          router.push('/login');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        checkAuth();
      }
    });

    return () => unsubscribe();
  }, [router, userType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F37172]"></div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
} 