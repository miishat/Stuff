/**
 * @file main.tsx
 * @description Application entry point for Stuff task management app.
 *              Bootstraps the React application and mounts it to the DOM.
 * @author Mishat
 * @version 1.0.3
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * Creates and renders the root React application.
 * Uses StrictMode for additional development checks.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
