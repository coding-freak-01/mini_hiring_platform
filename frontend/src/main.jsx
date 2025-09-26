import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { makeServer } from './mirage/server.js'
import App from './App.jsx'
import './index.css'

// Always use Mirage in development
if(import.meta.env.DEV || import.meta.env.VITE_API_MODE === "mirage"){
  makeServer()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" />
    </BrowserRouter>
  </StrictMode>,
)
