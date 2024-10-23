import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "../home/page";
import { loginRoute } from "../user/login";
import { Layout } from "./layout";

export function Router() {
  const router = useMemo(() => createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          path: '/',
          element: <HomePage />,
        }, loginRoute,
        {
          path: '/register',
          element: <RegisterPage />,
        },
        {
          path: '/games/create',
          element: <CreateGamePage />,
        },
        {
          path: '/games/:gameId',
          element: <GamePage />
        },
      ],
    },
  ]), []);
  return <RouterProvider router={router}></RouterProvider>;
}

export const RegisterPage = () => <div>Register page</div>;
export const CreateGamePage = () => <div>Create Game page</div>;
export const GamePage = () => <div>Game page</div>;
