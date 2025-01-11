import { useNotifications } from "@toolpad/core";
import { Dispatch, ReactNode, SetStateAction, createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateUserApi, ForgotPasswordRequest, LoginUserApi, MyUserApi, ResendActivationCodeRequest, UpdatePasswordRequest, UserRole } from "../../api/user";
import { assert } from "../../utils/validate";
import { tsr } from "./client";
import { handleError } from "./network";

const ME_KEY = ['users', 'me'];

export function useAllOfMe() {
  const { data, isFetching, error } = tsr.users.getMe.useSuspenseQuery({ queryKey: ME_KEY });

  if (error && !isFetching) {
    throw error;
  }

  assert(data.status === 200);
  return data.body;
}

export function useMe(): MyUserApi | undefined {
  return useAllOfMe().user;
}

export const AdminModeEnabled = createContext<[boolean, Dispatch<SetStateAction<boolean>>]>([false, () => { }] as const);

export function AdminModeProvider({ children }: { children: ReactNode }) {
  return <AdminModeEnabled.Provider value={useState(false)}>
    {children}
  </AdminModeEnabled.Provider>;
}

export function useEnableAdminMode() {
  return useContext(AdminModeEnabled);
}

export function useIsAdmin(ignoreAdminMode = false): boolean {
  const { user, adminUser } = useAllOfMe();
  const [adminModeEnabled] = useEnableAdminMode();

  if (!adminModeEnabled && !ignoreAdminMode) return false;

  return adminUser != null || user?.role === UserRole.enum.ADMIN;
}

export function useSubscribe() {
  const { mutate, error, isPending } = tsr.users.subscribe.useMutation();
  const validationError = handleError(isPending, error);
  const [isSuccess, setIsSuccess] = useState(false);

  const subscribe = useCallback((email: string) => mutate({ body: { email } }, {
    onSuccess: (data) => {
      setIsSuccess(true);
    },
  }), []);
  return { subscribe, isSuccess, validationError, isPending };
}

export function useLogin() {
  const notifications = useNotifications();
  const tsrQueryClient = tsr.useQueryClient();
  const navigate = useNavigate();
  const { mutate, error, isPending } = tsr.users.login.useMutation();
  const validationError = handleError(isPending, error);

  const login = useCallback((body: LoginUserApi) => mutate({ body }, {
    onSuccess: (data) => {
      tsrQueryClient.users.getMe.setQueryData(ME_KEY, (r) => ({ ...r!, status: 200, body: { user: data.body.user } }));
      if (body.activationCode) {
        notifications.show('Welcome! CCMF!', { autoHideDuration: 2000, severity: 'success' });
      }
      navigate('/');
    },
  }), []);
  return { login, validationError, isPending };
}

export function useLoginBypass(userId: number) {
  const isAdmin = useIsAdmin();
  const me = useMe();
  const tsrQueryClient = tsr.useQueryClient();
  const { mutate, error, isPending } = tsr.users.loginBypass.useMutation();
  handleError(isPending, error);

  const login = useCallback(() => mutate({ params: { userId } }, {
    onSuccess: (data) => {
      tsrQueryClient.users.getMe.setQueryData(ME_KEY, (r) => ({ ...r!, status: 200, body: data.body }));
    },
  }), [userId]);

  const canUseLoginBypass = me?.id !== userId && isAdmin;
  return { login, isPending, error, canUseLoginBypass };
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

export function useForgotPassword() {
  const { mutate, error, isSuccess, isPending } = tsr.users.forgotPassword.useMutation();
  const validationError = handleError(isPending, error);

  const forgotPassword = useCallback((body: ForgotPasswordRequest) => mutate({ body }), []);

  return { forgotPassword, validationError, isSuccess, isPending };
}

export function useUpdatePassword() {
  const { mutate, error, isPending } = tsr.users.updatePassword.useMutation();
  const notifications = useNotifications();
  const validationError = handleError(isPending, error);

  const updatePassword = useCallback((body: UpdatePasswordRequest, onSuccess?: () => void) => mutate({ body }, {
    onSuccess: (data) => {
      notifications.show('Update succeeded!', { autoHideDuration: 2000, severity: 'success' });
      onSuccess?.();
    },
  }), []);

  return { updatePassword, validationError, isPending };
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
        notifications.show('Logout successful', { autoHideDuration: 2000, severity: 'success' });
      },
    });
  }, []);
  return { logout, isPending };
}

export function useResendActivationCode() {
  const tsrQueryClient = tsr.useQueryClient();
  const { mutate, error, isPending } = tsr.users.resendActivationCode.useMutation();
  handleError(isPending, error);
  const notifications = useNotifications();

  const resend = useCallback((body: ResendActivationCodeRequest = {}) => {
    mutate({ body }, {
      onSuccess({ status, body }) {
        assert(status === 200 && body.success);
        notifications.show('Activation code sent', { autoHideDuration: 2000, severity: 'success' });
      },
    });
  }, []);
  const resendNoArgs = useCallback(() => resend(), [resend]);
  return { resend, resendNoArgs, isPending };
}

export function useActivateAccount() {
  const tsrQueryClient = tsr.useQueryClient();
  const { mutate, error, isError, isPending } = tsr.users.activateAccount.useMutation();
  handleError(isPending, error);
  const notifications = useNotifications();
  const navigate = useNavigate();

  const activate = useCallback((activationCode: string) => {
    mutate({ body: { activationCode } }, {
      onSuccess({ status, body }) {
        assert(status === 200);
        tsrQueryClient.users.getMe.setQueryData(ME_KEY, (r) => ({ ...r!, status: 200, body: { user: body.user } }));
        notifications.show('Success! CCMF!', { autoHideDuration: 2000, severity: 'success' });
        navigate('/');
      },
    });
  }, []);
  return { activate, isPending, isError };
}