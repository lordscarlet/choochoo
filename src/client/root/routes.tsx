import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GamePage } from "../game/page";
import { HomePage } from "../home/page";
import { LoginPage } from "../user/login";
import { RegisterPage } from "../user/register";
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
        }, {
          path: '/app/users/login',
          element: <LoginPage />,
        },
        {
          path: '/app/users/register',
          element: <RegisterPage />,
        },
        {
          path: '/app/games/create',
          element: <CreateGamePage />,
        },
        {
          path: '/app/games/:gameId',
          element: <GamePage />
        },
      ],
    },
  ]), []);
  return <RouterProvider router={router}></RouterProvider>;
}

export const CreateGamePage = () => <div>Create Game page</div>;
