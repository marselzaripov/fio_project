import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
     
            <BrowserRouter>
          
                <App />
           
            </BrowserRouter>
  
  </StrictMode>
)
