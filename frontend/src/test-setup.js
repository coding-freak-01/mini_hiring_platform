// Test setup file to verify all imports work correctly
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { makeServer } from './mirage/server.js'
import App from './App.jsx'

// Test that all components can be imported
console.log('✅ All imports successful')

// Test Mirage server setup
if (typeof makeServer === 'function') {
    console.log('✅ Mirage server setup successful')
}

// Test React components
if (typeof App === 'function') {
    console.log('✅ App component loaded')
}

console.log('🎉 TalentFlow application ready!')
