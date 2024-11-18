import { useNotifications } from "@toolpad/core";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CreateInviteApi, CreateUserApi, InviteApi, LoginUserApi, MyUserApi } from "../../api/user";
import { assert } from "../../utils/validate";
import { tsr } from "./client";
import { handleError } from "./network";

const ME_KEY = ['users', 'me'];

export function useMe(): MyUserApi | undefined {
  const { data, isFetching, error } = tsr.users.getMe.useSuspenseQuery({ queryKey: ME_KEY });

  if (error && !isFetching) {
    throw error;
  }

  assert(data.status === 200);
  return data.body.user;
}

export function useInvitation() {
  const tsrQueryClient = tsr.useQueryClient();
  const navigate = useNavigate();
  const { mutate, error, isPending } = tsr.users.useInvite.useMutation();
  handleError(isPending, error);

  const useInvitationCode = useCallback((body: InviteApi) => mutate({ body }, {
    onSuccess: (data) => {
      tsrQueryClient.users.getMe.setQueryData(ME_KEY, (r) => ({ ...r!, status: 200, body: { user: data.body.user } }));
      navigate('/');
    },
  }), []);
  return { useInvitationCode, isPending };
}

export function useCreateInvitation() {
  const me = useMe();
  const notifications = useNotifications();
  const { mutate, error, isPending } = tsr.users.createInvite.useMutation();
  handleError(isPending, error);

  const createInvite = useCallback((body: CreateInviteApi) => mutate({ params: { userId: me!.id }, body }, {
    onSuccess: (_) => {
      notifications.show('Code Created', { autoHideDuration: 2000 });
    },
  }), [me]);
  return { createInvite, isPending };
}

export function useLogin(shouldNavigate = false) {
  const tsrQueryClient = tsr.useQueryClient();
  const navigate = useNavigate();
  const { mutate, error, isPending } = tsr.users.login.useMutation();
  const validationError = handleError(isPending, error);

  const login = useCallback((body: LoginUserApi) => mutate({ body }, {
    onSuccess: (data) => {
      tsrQueryClient.users.getMe.setQueryData(ME_KEY, (r) => ({ ...r!, status: 200, body: { user: data.body.user } }));
      if (shouldNavigate) {
        navigate('/');
      }
    },
  }), []);
  return { login, validationError, isPending };
}

export function useLoginBypass() {
  const tsrQueryClient = tsr.useQueryClient();
  const { mutate, error, isPending } = tsr.users.loginBypass.useMutation();
  handleError(isPending, error);

  const login = useCallback((userId: number) => mutate({ params: { userId } }, {
    onSuccess: (data) => {
      tsrQueryClient.users.getMe.setQueryData(ME_KEY, (r) => ({ ...r!, status: 200, body: { user: data.body.user } }));
    },
  }), []);
  return { login, isPending, error };
}

export function useRegister() {
  const tsrQueryClient = tsr.useQueryClient();
  const navigate = useNavigate();
  const { mutate, error, isPending } = tsr.users.create.useMutation();
  const validationError = handleError(isPending, error);

  const register = useCallback((body: CreateUserApi) => mutate({ body }, {
    onSuccess: (data) => {
      tsrQueryClient.users.getMe.setQueryData(ME_KEY, (r) => ({ ...r!, status: 200, body: { user: data.body.user } }));
      navigate('/');
    },
  }), []);

  return { register, validationError, isPending };
}

export function useLogout() {
  const tsrQueryClient = tsr.useQueryClient();
  const { mutate, error, isPending } = tsr.users.logout.useMutation();
  handleError(isPending, error);
  const notifications = useNotifications();

  const logout = useCallback(() => {
    mutate({}, {
      onSuccess({ status, body }) {
        assert(status === 200 && body.success);
        tsrQueryClient.users.getMe.setQueryData(ME_KEY, (r) => ({ ...r!, status: 200, body: { user: undefined } }));
        notifications.show('Logout successful', { autoHideDuration: 2000 });
      },
    });
  }, []);
  return { logout, isPending };
}