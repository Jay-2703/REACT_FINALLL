/**
 * JWT Utilities for frontend
 * Handles token parsing and validation
 */

/**
 * Decode JWT token without verification (frontend only)
 * In production, never trust the decoded payload alone - verify on backend
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get user role from stored user data (most current source of truth)
 */
export const getUserRole = () => {
  // First, try to get role from stored user object (set during login)
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      if (userData?.role) {
        return userData.role;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  // Fallback: get role from token (if user object not available)
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  return getUserRole() === 'admin';
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Clear auth data
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
};
