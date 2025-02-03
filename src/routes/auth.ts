import express, { Router } from "express";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { setRefreshToken, getTokenData } from '../utils/authUtils'
import { IUser } from "../models/user";

const router = Router();

router.get('/auth', (req, res) => {
  res.send(`
    <h1>Login</h1>
    <button id="google-signin-button">Sign in with Google</button>
    <script>
      const googleSignInButton = document.getElementById('google-signin-button');

      googleSignInButton.addEventListener('click', async () => {
        try {
          const credential = await navigator.credentials.get({
            federation: [{
              provider: "${process.env.FEDCM_PROVIDER_URL}",
            }],
          });

          if (credential) {
            // Send the credential to your server for verification and session creation
            const response = await fetch('/auth/google/fedcm/callback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: credential.token }),
            });

            if (response.ok) {
              const userData = await response.json(); // Get user data from the server
              // Redirect or update the UI as needed (e.g., store userData in local storage or a cookie)
              window.location.href = '/dashboard'; // Example: redirect to dashboard
            } else {
              const errorData = await response.json();
              console.error("FedCM login failed:", errorData);
              // Handle errors (display message to the user, etc.)
            }
          }
        } catch (error) {
          console.error("FedCM error:", error);
          // Handle errors (display message to the user, etc.)
        }
      });
    </script>
  `);
});


router.post('/auth/google/fedcm/callback', express.json(), async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ error: 'Missing token' });
    return
  }

  try {
    const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (!tokenInfoResponse.ok) {
      const errorData = await tokenInfoResponse.json();
      console.error("Token verification failed:", errorData);
      res.status(400).json({ error: 'Invalid token' });
      return
    }
    const tokenInfo = await tokenInfoResponse.json();

    //audience check
    if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
      res.status(400).json({ error: 'Invalid audience' });
      return
    }

    const user: IUser = {
      googleId: tokenInfo.sub,
      email: tokenInfo.email,
      displayName: tokenInfo.name,
      createdAt: tokenInfo.createdAt,
    };

    const expiresIn = Number(process.env?.JWT_EXPIRES_IN ?? '3600');
    const jwtToken = jwt.sign(user, process.env?.JWT_SECRET ?? '', {
      expiresIn
    })

    const refreshToken = uuidv4();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS));
    await setRefreshToken(refreshToken, { user, expiry: expiryDate });

    res.json({ message: 'Login successful', access_token: jwtToken, token_type: 'Bearer', expires_in: expiresIn/3600 + 'h', refresh_token: refreshToken });

  } catch (error) {
    console.error("FedCM callback error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/auth/refresh-token', express.json(), async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token is required' });
    return
  }

  try {

    const { refresh } = req.body;
    const tokenData = await getTokenData(refresh);

    if (!tokenData || tokenData.expiry < new Date()) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return
    }

    //generate a new access token
    const expiresIn = Number(process.env?.JWT_EXPIRES_IN ?? '3600');
    const jwtToken = jwt.sign(tokenData.user, process.env?.JWT_SECRET ?? '', {
      expiresIn
    })

    //generate a new refresh token and delete old one
    const refreshToken = uuidv4();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS));
    await setRefreshToken(refreshToken, { user: tokenData.user, expiry: expiryDate });

    res.json({ message: 'Refresh successful', access_token: jwtToken, token_type: 'Bearer', expires_in: expiresIn/3600 + 'h', refresh_token: refreshToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});


export default router;
