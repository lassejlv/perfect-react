import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./main.css";

// Pages
import Home from "./pages/index.tsx";
import Register from "./pages/register.tsx";
import { Toaster } from "react-hot-toast";
import Login from "./pages/login.tsx";

const routes = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: <Home />,
  },
]);

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <Toaster reverseOrder={false} position="bottom-right" />
    <RouterProvider router={routes} />
  </React.StrictMode>
);
