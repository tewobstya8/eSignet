
"use client"; // Keep this if you are using the App Router (app/ directory)

import { useEffect } from 'react';
// Note: If using App Router (app/ directory), import useRouter from 'next/navigation' if you add navigation logic later.
// But for this simple login page just redirecting via window.location, useRouter isn't strictly needed yet.

// --- Import Icons ---
import { FaUser, FaGoogle } from 'react-icons/fa'; // Import icons

// Helper function to build the authorization URL (Keep this)
function buildAuthorizationUrl() {
  const clientId = process.env.NEXT_PUBLIC_ESIGNET_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_ESIGNET_REDIRECT_URI;
  const authUrl = process.env.NEXT_PUBLIC_ESIGNET_AUTH_URL;

  const responseType = 'code';
  const scope = 'openid profile';
  const state = generateRandomString(32);
  const nonce = generateRandomString(32);

  if (typeof window !== 'undefined') {
    document.cookie = `oauth_state=${state}; path=/; max-age=3600; secure; samesite=Lax`;
    document.cookie = `oauth_nonce=${nonce}; path=/; max-age=3600; secure; samesite=Lax`;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope: scope,
    state: state,
    nonce: nonce,
  });

  if (!clientId || !redirectUri || !authUrl) {
      console.error("Missing eSignet client-side environment variables.");
      return null;
  }

  return `${authUrl}?${params.toString()}`;
}

// Simple random string generator (for state and nonce) (Keep this)
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


export default function LoginPage() {

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!process.env.NEXT_PUBLIC_ESIGNET_CLIENT_ID || !process.env.NEXT_PUBLIC_ESIGNET_REDIRECT_URI || !process.env.NEXT_PUBLIC_ESIGNET_AUTH_URL) {
        console.error("eSignet client-side environment variables not set correctly in .env.local");
        // You might want to display an error message on the UI or disable the button
      }
    }
  }, []);


  const handleLogin = () => {
    const authUrl = buildAuthorizationUrl();
    if (authUrl) {
       window.location.href = authUrl;
    } else {
       alert("Login configuration error. Please try again later.");
    }
  };

  const handleGoogleLogin = () => {
    alert("Google Login is not implemented yet!");
    // TODO: Add logic to initiate Google OIDC/OAuth flow
  };


  // --- Start of the improved UI with Tailwind and React Icons ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm"> {/* Card styling */}

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Sign In</h1> {/* Title */}

        <div className="space-y-4"> {/* Adds vertical space between buttons */}

          {/* eSignet Button with React Icon */}
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out" // Added transition
          >
            {/* Use FaUser icon */}
            <FaUser className="h-5 w-5 mr-3" /> {/* Apply size and margin classes directly */}
            Sign in with eSignet
          </button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>


          {/* Google Button with React Icon */}
           <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out" // Added transition
          >
            {/* Use FaGoogle icon */}
             <FaGoogle className="h-5 w-5 mr-3 text-red-500" /> {/* Apply size, margin, and a hint of red color */}
            Sign in with Google
          </button>

        </div> {/* End of Buttons Section */}

        <p className="mt-6 text-center text-sm text-gray-600">
          New user?{' '}
          <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Create an account
          </a>
        </p>


      </div> {/* End of Card */}
    </div>
  );
}
