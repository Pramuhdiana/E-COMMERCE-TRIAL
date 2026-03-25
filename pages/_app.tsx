import { useState } from 'react';
import type { AppProps } from 'next/app';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import 'tailwindcss/tailwind.css';
import { CartProvider } from '../components/cart/context/cartContext';
import { AuthProvider } from '../components/auth/context/authContext';
import { ToastProvider } from '../components/ui/toast/ToastContext';
import { ToastViewport } from '../components/ui/toast/ToastViewport';
import { StockProvider } from '../components/products/context/stockContext';

export default function App({ Component, pageProps, err }: AppProps & { err: Error }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ToastProvider>
      <AuthProvider>
        <StockProvider>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <CartProvider>
              <Component {...pageProps} err={err} />
            </CartProvider>
          </Hydrate>
          <ReactQueryDevtools />
        </QueryClientProvider>
        <ToastViewport />
        </StockProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
