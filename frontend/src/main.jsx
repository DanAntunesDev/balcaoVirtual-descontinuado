import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { BrowserRouter } from "react-router-dom";
import "sonner/dist/styles.css";
import "./index.css";
import "@/styles/theme.css";
import "@/styles/auth.css";
import "@/styles/public.css";
import "@/styles/statusPills.css";

import { HeaderSelectionProvider } from "@/app/providers/headerSelection/HeaderSelectionProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <HeaderSelectionProvider>
        <App />
      </HeaderSelectionProvider>
    </BrowserRouter>
  </React.StrictMode>
);