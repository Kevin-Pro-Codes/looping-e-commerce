import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import App from './App.jsx'

axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]').content;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,

  
)
