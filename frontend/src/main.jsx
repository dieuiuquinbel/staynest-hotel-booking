import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import UngDung from './UngDung';
import './index.css';

const trinhQuanLyTruyVan = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={trinhQuanLyTruyVan}>
      <BrowserRouter>
        <UngDung />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
