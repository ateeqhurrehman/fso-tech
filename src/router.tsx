import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { Home } from "./screens/Home";
import { WODetail } from "./screens/WODetail";
import { Profile } from "./screens/Profile";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Navigate to="/my-jobs/live" replace /> },
      { path: "/my-jobs", element: <Navigate to="/my-jobs/live" replace /> },
      { path: "/my-jobs/:tab", element: <Home /> },
      { path: "/wo/:id", element: <WODetail /> },
      { path: "/profile", element: <Profile /> },
      { path: "*", element: <Navigate to="/my-jobs/live" replace /> },
    ],
  },
]);
