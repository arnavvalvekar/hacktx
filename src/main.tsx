import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom'
import App from "./App";
import { Auth0Wrapper } from "./components/Auth0Wrapper";
import './index.css'

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Wrapper>
        <App />
      </Auth0Wrapper>
    </BrowserRouter>
  </React.StrictMode>
);

