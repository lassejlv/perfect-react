import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./main.css";

// Pages
import Home from "./pages/index.tsx";
import Register from "./pages/register.tsx";
import Login from "./pages/login.tsx";
import Dashboard from "./pages/dashboard.tsx";
import ForgotPassword from "./pages/forgot-password.tsx";
import ResetPassword from "./pages/reset-password.tsx";
import Settings from "./pages/settings.tsx";

const routes = createBrowserRouter([
  {
    path: "/reset-password/:token",
    // @ts-expect-error: Unreachable code error
    element: <ResetPassword />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/dashboard/settings",
    // @ts-expect-error: Unreachable code error
    element: <Settings />,
  },
  {
    path: "/dashboard",
    // @ts-expect-error: Unreachable code error
    element: <Dashboard />,
  },
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
