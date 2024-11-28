import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CreateInvitePage } from "../admin/create_invite";
import { FeedbackPage } from "../admin/feedback";
import { AdminPage } from "../admin/page";
import { CreateGamePage } from "../game/create_page";
import { GamePage } from "../game/page";
import { HomePage } from "../home/page";
import { ActivatePage } from "../user/activate";
import { LoginPage } from "../user/login";
import { LoginRequired } from "../user/login_required";
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
          element: <LoginRequired><HomePage /></LoginRequired>,
        },
        {
          path: '/app/users/login',
          element: <LoginPage />,
        },
        {
          path: '/app/admin/create-invite',
          element: <AdminPage />,
        },
        {
          path: '/app/admin/feedback',
          element: <FeedbackPage />,
        },
        {
          path: '/app/admin/create-invite',
          element: <CreateInvitePage />,
        },
        {
          path: '/app/users/activate',
          element: <ActivatePage />,
        },
        {
          path: '/app/users/register',
          element: <RegisterPage />,
        },
        {
          path: '/app/games/create',
          element: <LoginRequired><CreateGamePage /></LoginRequired>,
        },
        {
          path: '/app/games/:gameId',
          element: <LoginRequired><GamePage /></LoginRequired>,
        },
      ],
    },
  ]), []);
  return <RouterProvider router={router}></RouterProvider>;
}
