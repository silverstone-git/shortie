import express, { Router } from "express";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { setRefreshToken, getTokenData } from '../utils/authUtils'
import { IUser } from "../models/user";
import 'dotenv/config';

const router = Router();

router.get('/', (req, res) => {

  console.log('process.env: ', process.env);
  res.send(`
    <html>
      <head>
        <title>authentication</title>
      ${process.env.DEVMODE== 'mobile' ? '<script src="https://cdn.jsdelivr.net/gh/c-kick/mobileConsole/hnl.mobileconsole.min.js"></script>' : ''}
      </head>
    <body>
    <h1>Login</h1>

    <button id="google-signin-button">Sign in with Google</button>
    <p id='result'></p>
    <script>
      const googleSignInButton = document.getElementById('google-signin-button');

      googleSignInButton.addEventListener('click', async () => {
        console.log("click happened");
        if (!navigator.credentials || !navigator.credentials.get) {
          console.error('36 biradari no sapot');
          console.log('36 biradari no sapot');
          return
        }

        console.log("navigator credentials exists");
        const credential = await navigator.credentials.get({
          federated: {
            providers: ["${process.env.FEDCM_PROVIDER_URL_GOOGLE}"],
          },
        });
        console.log("credential made: ", credential);

        if (credential) {
          // Send the credential to your server for verification and session creation
          const response = await fetch('/api/auth/google/fedcm/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: credential.token }),
          });

          if (response.ok) {
            const userData = await response.json(); // Get user data from the server
            // Redirect or update the UI as needed (e.g., store userData in local storage or a cookie)
            const resBox = document.getElementById('result');
            resBox.innerHTML = userData; // Example: redirect to dashboard
          } else {
            const errorData = await response.json();
            console.error("FedCM login failed:", errorData);
            // Handle errors (display message to the user, etc.)
            resBox.innerHTML = errorData; // Example: redirect to dashboard
          }
        }
      });
    </script>
    </body>
  </html>
  `);
});


router.post('/google/fedcm/callback', express.json(), async (req, res) => {
  const { token } = req.body;

  console.log("token received from browser: ", token);

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

    console.log("token info received from google: ", tokenInfo);

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

    console.log('creds generated:')
    console.log({ message: 'Login successful', access_token: jwtToken, token_type: 'Bearer', expires_in: expiresIn/3600 + 'h', refresh_token: refreshToken });

    res.json({ message: 'Login successful', access_token: jwtToken, token_type: 'Bearer', expires_in: expiresIn/3600 + 'h', refresh_token: refreshToken });

  } catch (error) {
    console.error("FedCM callback error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh-token', express.json(), async (req, res) => {
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
