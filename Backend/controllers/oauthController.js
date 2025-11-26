import { query, getConnection } from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * LOGIN_PAGE: Redirect to React landing page after OAuth
 * Token will be handled by frontend via query parameter
 */
const LOGIN_PAGE = '/'; // React landing page

/**
 * Google OAuth - Start
 */
export const googleAuth = async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

  const scope = 'profile email';

  if (!clientId) {
    return res.status(500).json({
      success: false,
      message: 'Google OAuth not configured'
    });
  }

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.redirect(authUrl);
};

/**
 * Google OAuth Callback
 */
export const googleCallback = async (req, res) => {
  try {
    const { code, role } = req.query;

    if (!code) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5176';
      return res.redirect(`${frontendUrl}?error=oauth_failed`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
      `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5176';
      return res.redirect(`${frontendUrl}?error=oauth_not_configured`);
    }

    /** Exchange code → access token */
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }
    );

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      throw new Error('Failed to get Google access token');
    }

    /** Get Google user info */
    const userResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    );

    const { id, email, name, given_name, family_name } = userResponse.data;

    if (!email) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5176';
      return res.redirect(`${frontendUrl}?error=oauth_no_email`);
    }

    /** Check if user exists */
    const existingUsers = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    let user;

    if (existingUsers && existingUsers.length > 0) {
      user = existingUsers[0];
    } else {
      /** Create new user */
      const connection = await getConnection();
      try {
        await connection.beginTransaction();

        const username = 
          (given_name || 'user') + '_' + id.substring(0, 6);

        const [result] = await connection.execute(
          `INSERT INTO users (username, first_name, last_name, email, role, is_verified, hashed_password)
           VALUES (?, ?, ?, ?, 'student', TRUE, ?)`,
          [
            username,
            given_name || name || 'User',
            family_name || '',
            email,
            'oauth_user_' + id
          ]
        );

        const [newUsers] = await connection.execute(
          `SELECT id, username, first_name, last_name, email, role, is_verified, created_at 
           FROM users 
           WHERE id = ?`,
          [result.insertId]
        );

        user = newUsers[0];
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }

    /** Generate JWT */
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    /** Cookie */
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    /** SUCCESS Redirect */
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5176';
    const userEncoded = encodeURIComponent(JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    }));
    res.redirect(`${frontendUrl}?token=${token}&user=${userEncoded}&oauth=google`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5176';
    res.redirect(`${frontendUrl}?error=oauth_failed`);
  }
};

/**
 * Facebook OAuth - Start
 */
export const facebookAuth = async (req, res) => {
  const appId = process.env.FACEBOOK_CLIENT_ID;
  const redirectUri =
    process.env.FACEBOOK_REDIRECT_URI ||
    `${req.protocol}://${req.get('host')}/api/auth/facebook/callback`;

  if (!appId) {
    return res.status(500).json({
      success: false,
      message: 'Facebook OAuth not configured'
    });
  }

  const authUrl =
    `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${appId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=public_profile&` +
    `response_type=code`;

  res.redirect(authUrl);
};

/**
 * Facebook OAuth Callback
 */
export const facebookCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${LOGIN_PAGE}?error=oauth_failed`);
    }

    const appId = process.env.FACEBOOK_CLIENT_ID;
    const appSecret = process.env.FACEBOOK_CLIENT_SECRET;
    const redirectUri =
      process.env.FACEBOOK_REDIRECT_URI ||
      `${req.protocol}://${req.get('host')}/api/auth/facebook/callback`;

    /** Exchange code → access token */
    const tokenResponse = await axios.get(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      {
        params: {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code
        }
      }
    );

    const { access_token } = tokenResponse.data;

    /** Get Facebook user info */
    const userResponse = await axios.get(
      'https://graph.facebook.com/me',
      {
        params: {
          fields: 'id,first_name,last_name,picture',
          access_token
        }
      }
    );

    const { id, first_name, last_name } = userResponse.data;

    // Generate email from Facebook ID if not available
    const email = `facebook_${id}@facebook.com`;

    /** Check if user exists by email OR by Facebook ID */
    const existingUserResult = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const existingUser = existingUserResult && existingUserResult[0];

    let user;

    if (existingUser) {
      user = existingUser;
    } else {
      /** Create new user */
      const connection = await getConnection();
      try {
        await connection.beginTransaction();

        const username =
          email.split('@')[0] +
          '_' +
          id.substring(0, 6);

        const [result] = await query(
          `INSERT INTO users (username, first_name, last_name, email, role, is_verified, hashed_password)
           VALUES (?, ?, ?, ?, 'student', TRUE, ?)`,
          [
            username,
            first_name || 'User',
            last_name || '',
            email,
            'oauth_user_' + id
          ]
        );

        const [newUser] = await query(
          `SELECT id, username, first_name, last_name, email, role, is_verified, created_at 
           FROM users 
           WHERE id = ?`,
          [result.insertId]
        );

        user = newUser;
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }

    /** Generate JWT */
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    /** Cookie */
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    /** SUCCESS Redirect */
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5176';
    const userEncoded = encodeURIComponent(JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    }));
    res.redirect(`${frontendUrl}/?token=${token}&user=${userEncoded}&oauth=facebook`);
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    res.redirect(`${LOGIN_PAGE}?error=oauth_failed`);
  }
};
