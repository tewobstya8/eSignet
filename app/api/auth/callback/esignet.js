import axios from 'axios';
// import { Pool } from 'pg'; // <-- Remove this line
import { PrismaClient } from '@prisma/client'; // <-- Import Prisma Client
import Cookies from 'cookies';

// Initialize Prisma Client
const prisma = new PrismaClient(); // <-- Initialize Prisma Client

export default async function esignetCallback(req, res) {
  // Ensure Prisma Client is disconnected when the function finishes or errors
  // This is important for serverless environments like Next.js API routes
  try {
    // 1. Get code and state from the redirect
    const { code, state } = req.query;

    if (!code) {
      console.error('Authorization code not received');
      return res.redirect('/login?error=auth_failed');
    }

    // 2. Validate the state parameter (CRUCIAL SECURITY STEP - Implement properly)
    // ... (State validation logic here if you implemented it using Cookies or server-side session) ...


    // 3. Exchange the authorization code for tokens (Server-to-Server Call)
    const tokenUrl = process.env.ESIGNET_TOKEN_URL;
    const clientId = process.env.ESIGNET_CLIENT_ID;
    const clientSecret = process.env.ESIGNET_CLIENT_SECRET; // Use server-side secret
    const redirectUri = process.env.ESIGNET_REDIRECT_URI; // Use server-side redirect URI

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret, // Use the secret here
    });

    const tokenResponse = await axios.post(tokenUrl, tokenParams.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, id_token, expires_in, refresh_token } = tokenResponse.data;

    if (!access_token) {
      console.error('Access token not received:', tokenResponse.data);
      return res.redirect('/login?error=token_exchange_failed');
    }

    // 4. (Optional but Recommended) Use the access token to get user info
    const userInfoUrl = process.env.ESIGNET_USERINFO_URL;
    const userInfoResponse = await axios.get(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    const esignetUserProfile = userInfoResponse.data;
    console.log('eSignet User Profile:', esignetUserProfile);

    const esignetUserId = esignetUserProfile.sub; // Use 'sub' as the unique identifier

    if (!esignetUserId) {
      console.error('eSignet user ID ("sub") not found in profile');
      return res.redirect('/login?error=no_user_id');
    }

    // 5. Use Prisma Client to find or create the user
    const user = await prisma.user.upsert({
      where: { esignetSub: esignetUserId },
      update: { // Update if user exists
        name: esignetUserProfile.name || null,
        email: esignetUserProfile.email || null,
      },
      create: { // Create if user doesn't exist
        esignetSub: esignetUserId,
        name: esignetUserProfile.name || null,
        email: esignetUserProfile.email || null,
      },
    });

    console.log('User processed (Prisma):', user); // <-- This log is now in the correct place

    // 6. Establish a local session for the user
    const cookies = new Cookies(req, res);
    const sessionId = `user_${user.id}_${Date.now()}`; // Example session ID - replace with secure generation
    cookies.set('app_session_id', sessionId, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      // secure: process.env.NODE_ENV === 'production', // Use secure cookie in production
      // sameSite: 'Lax', // Helps prevent CSRF
    });

    // 7. Redirect the user to a protected page
    res.redirect('/dashboard');

  } catch (error) { // Catch any errors from API calls or Prisma
    console.error('Error during eSignet auth callback:', error.response?.data || error.message || error);
    // You might want more specific error redirects based on the error type
    res.redirect('/login?error=auth_callback_failed');
  } finally {
    // Disconnect Prisma Client
    await prisma.$disconnect(); // <-- Crucial for API routes/serverless functions
  }
}

// Basic check for required server-side environment variables on module load
if (!process.env.ESIGNET_CLIENT_ID || !process.env.ESIGNET_CLIENT_SECRET || !process.env.ESIGNET_TOKEN_URL || !process.env.ESIGNET_REDIRECT_URI || !process.env.ESIGNET_USERINFO_URL || !process.env.DATABASE_URL) {
  console.error("Error: Missing required server-side eSignet or Database environment variables.");
  // In a real app, you might want to stop the process here or log a critical error
}
