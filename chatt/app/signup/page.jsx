'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// /signup ab /login ke signup-face pe redirect hota hai (flip animation ke saath)
export default function SignupRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/login?signup=1');
  }, [router]);

  return (
    <div className="loader">
      <div>
        <div className="spinner" />
        Loading…
      </div>
    </div>
  );
}
