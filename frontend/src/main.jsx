import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { makeServer } from './mirage/server.js'
import App from './App.jsx'

if(import.meta.env.VITE_API_MODE === "mirage"){
  makeServer()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
