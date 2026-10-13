import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem('school_portal_token')
  );

  const [userRole, setUserRole] = useState(() =>
    localStorage.getItem('school_portal_role')
  );

  const [userEmail, setUserEmail] = useState(() =>
    localStorage.getItem('school_portal_email')
  );

  const [loading, setLoading] = useState(true);

  // Verify an existing session when the application loads.
  useEffect(() => {
    async function verifyExistingSession() {
      const storedToken = localStorage.getItem(
        'school_portal_token'
      );

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getCurrentUser();

        if (!res.ok || !res.data) {
          logout();
          setLoading(false);
          return;
        }

        const role = res.data.role;

        if (!['admin', 'teacher', 'student'].includes(role)) {
          logout();
          setLoading(false);
          return;
        }

        // Store the role returned by the backend.
        localStorage.setItem('school_portal_role', role);
        setUserRole(role);

        if (res.data.email) {
          localStorage.setItem(
            'school_portal_email',
            res.data.email
          );

          setUserEmail(res.data.email);
        }

        setToken(storedToken);
      } catch (error) {
        console.error('Session verification failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    }

    verifyExistingSession();
  }, []);

  // Register a new account.
  async function register({ name, email, password }) {
    const res = await api.register({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (!res.ok) {
      return {
        ok: false,
        error: res.error || 'Registration failed. Please try again.',
      };
    }

    return {
      ok: true,
      data: res.data,
    };
  }

  // Log in and verify the user's role through the backend.
  async function login(email, password) {
    const res = await api.login(email, password);

    if (!res.ok) {
      return {
        ok: false,
        error: res.error || 'Invalid email or password.',
      };
    }

    const receivedToken = res.data?.access_token;

    if (!receivedToken) {
      return {
        ok: false,
        error: 'The server did not return an access token.',
      };
    }

    // Save the token temporarily so authenticated requests can use it.
    localStorage.setItem(
      'school_portal_token',
      receivedToken
    );

    setToken(receivedToken);

    try {
      // Ask the backend for the authenticated user's actual details.
      const userResponse = await api.getCurrentUser();

      if (!userResponse.ok || !userResponse.data) {
        logout();

        return {
          ok: false,
          error: 'Login succeeded, but the backend could not verify your account.',
        };
      }

      const role = userResponse.data.role;

      if (!['admin', 'teacher', 'student'].includes(role)) {
        logout();

        return {
          ok: false,
          error: 'Your account has an invalid role.',
        };
      }

      const verifiedEmail = userResponse.data.email || email;

      localStorage.setItem('school_portal_role', role);
      localStorage.setItem(
        'school_portal_email',
        verifiedEmail
      );

      setUserRole(role);
      setUserEmail(verifiedEmail);

      return {
        ok: true,
        role,
      };
    } catch (error) {
      console.error('Login verification failed:', error);

      logout();

      return {
        ok: false,
        error: 'Unable to verify your account. Please try again.',
      };
    }
  }

  // Log out the current user.
  function logout() {
    localStorage.removeItem('school_portal_token');
    localStorage.removeItem('school_portal_role');
    localStorage.removeItem('school_portal_email');

    setToken(null);
    setUserRole(null);
    setUserEmail(null);
  }

  const value = {
    token,
    userRole,
    userEmail,
    isAuthenticated: Boolean(token && userRole),
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}