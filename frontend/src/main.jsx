import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AutoAuth from './context/AuthContext.jsx'
import DonorProvider from './context/DonorContext.jsx'
import RequestProvider from './context/RecieverContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <AutoAuth>
    <DonorProvider>
      <RequestProvider>
         <App />
      </RequestProvider>
   
    </DonorProvider>
  </AutoAuth>
  </StrictMode>
 
)
 