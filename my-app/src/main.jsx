import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StockDataProvider } from './context/StockDataContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StockDataProvider>
      <App />
    </StockDataProvider>
  </StrictMode>,
)
