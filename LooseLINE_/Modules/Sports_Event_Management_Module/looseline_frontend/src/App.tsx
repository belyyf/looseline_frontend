import { useState, useEffect } from 'react';
import EventsMainPage from "./pages/EventsMainPage";
import { Header } from "./components/Header.tsx";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for active session
    fetch('/api/auth/get-session')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Unauthorized');
      })
      .then(data => {
        // Compatible with different session structures
        if (data?.user || data?.data?.user || data?.id) {
          setIsAuthenticated(true);
        } else {
          throw new Error('No user data');
        }
      })
      .catch(() => {
        // If auth fails, redirect to login
        console.log('Auth check failed, redirecting to login');
        setIsAuthenticated(false);
        window.location.href = '/login';
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1f2c',
        color: '#ecf0f1'
      }}>
        Загрузка...
      </div>
    );
  }

  console.log("Auth debug:", isAuthenticated);
  // if (!isAuthenticated) return null;

  return (
    <>
      <Header />
      <EventsMainPage />
    </>
  );
}
