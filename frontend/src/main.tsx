import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { CompareProvider } from './context/CompareContext.tsx';
import { CurrencyProvider } from './context/CurrencyContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <App />
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  </React.StrictMode>
);

