import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { initAuth } = useAuth();

  useEffect(() => {
    // Proactively initialize auth state on startup
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
export { App };
