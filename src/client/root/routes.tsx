import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CreateInvitePage } from "../admin/create_invite";
import { FeedbackPage } from "../admin/feedback";
import { UserList } from "../admin/user_list";
import { Pallet } from "../components/pallet";
import { CreateGamePage } from "../game/create_page";
import { GamePage } from "../game/page";
import { HomePage } from "../home/page";
import { ActivatePage } from "../user/activate";
import { ForgotPassword } from "../user/forgot_password";
import { LoginPage } from "../user/login";
import { LoginRequired } from "../user/login_required";
import { UserProfilePage } from "../user/profile";
import { RegisterPage } from "../user/register";
import { Unsubscribe } from "../user/unsubscribe";
import { UpdatePassword } from "../user/update_password";
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
          path: '/app/pallet',
          element: <Pallet />,
        },
        {
          path: '/app/users/login',
          element: <LoginPage />,
        },
        {
          path: '/app/admin/feedback',
          element: <FeedbackPage />,
        },
        {
          path: '/app/admin/users',
          element: <UserList />,
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
          path: '/app/users/forgot-password',
          element: <ForgotPassword />,
        },
        {
          path: '/app/unsubscribe',
          element: <Unsubscribe />,
        },
        {
          path: '/app/users/update-password',
          element: <UpdatePassword />
        },
        {
          path: '/app/games/create',
          element: <LoginRequired><CreateGamePage /></LoginRequired>,
        },
        {
          path: '/app/games/:gameId',
          element: <LoginRequired><GamePage /></LoginRequired>,
        },
        {
          path: '/app/users/:userId',
          element: <LoginRequired><UserProfilePage /></LoginRequired>
        },
      ],
    },
  ]), []);
  return <RouterProvider router={router}></RouterProvider>;
}
