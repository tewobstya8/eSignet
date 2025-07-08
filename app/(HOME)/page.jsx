"use client"; // Keep this directive at the very top

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // <-- CHANGE THIS LINE
import Cookies from 'js-cookie'; // Use js-cookie on the client-side

export default function DashboardPage() {
  // This useRouter is now from 'next/navigation' and works in App Router client components
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for the session cookie set by the API route
    const sessionId = Cookies.get('app_session_id');

    if (!sessionId) {
      // No session, redirect to login using the new router.push
      router.push('/login');
    } else {
      // Session cookie found.
      // In a real app, you MUST verify this sessionId server-side...
      // ... (rest of your user fetching/setting logic) ...

      // Dummy user data for basic demo if cookie exists
      setUser({ id: 'demo-user', name: 'Logged in User' });
      setLoading(false);
    }
  }, [router]); // Add router to dependency array

  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect if user is null after loading (e.g., validation failed in real app)
  if (!user) {
      // Ensure we don't render the dashboard content if user is not authenticated
      return <div>Redirecting...</div>; // Or a loading spinner
  }


  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name || 'User'}!</p>
      {/* Add a logout button */}
      <button onClick={async () => {
         // Call my logout API route
         await fetch('/api/auth/logout');
         // Clear client-side cookie immediately (optional, API should handle it)
         Cookies.remove('app_session_id');
         // Redirect to login using the new router.push
         router.push('/login');
      }}>
         Logout
      </button>
    </div>
  );
}
