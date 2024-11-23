import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CreateGamePage } from "../game/create_page";
import { GamePage } from "../game/page";
import { HomePage } from "../home/page";
import { InvitationPage } from "../user/invitation";
import { LoginPage } from "../user/login";
import { RegisterPage } from "../user/register";
import { Layout } from "./layout";

export function Router() {

  // TODO: figure out why this re-renders like 6 times.
  // useMemo(() => {
  //   console.log('new render2');
  // }, [1]);

  const router = useMemo(() => createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          path: '/',
          element: <HomePage />,
        },
        {
          path: '/app/users/login',
          element: <LoginPage />,
        },
        {
          path: '/app/users/invitation',
          element: <InvitationPage />,
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
