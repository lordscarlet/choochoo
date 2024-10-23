import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CreateUserApi, LoginUserApi, MyUserApi } from "../../api/user";
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

export function useLogin(shouldNavigate = false) {
  const tsrQueryClient = tsr.useQueryClient();
  const navigate = useNavigate();
  const { mutate, error, isPending } = tsr.users.login.useMutation();
  handleError(isPending, error);

  const login = useCallback((body: LoginUserApi) => mutate({ body }, {
    onSuccess: (data) => {
      tsrQueryClient.users.getMe.setQueryData(ME_KEY, (r) => ({ ...r!, status: 200, body: { user: data.body.user } }));
      if (shouldNavigate) {
        navigate('/');
      }
    },
  }), []);
  return { login, isPending };
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

  const logout = useCallback(() => {
    mutate({}, {
      onSuccess({ status, body }) {
        assert(status === 200 && body.success);
        tsrQueryClient.users.getMe.setQueryData(ME_KEY, (r) => ({ ...r!, status: 200, body: { user: undefined } }));
      },
    });
  }, []);
  return { logout, isPending };
}