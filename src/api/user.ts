import { initContract } from '@ts-rest/core';
import { z } from 'zod';

export const UserRole = z.enum(['WAITLIST', 'USER', 'ADMIN', 'BLOCKED']);
export type UserRole = z.infer<typeof UserRole>;

export const CreateUserApi = z.object({
  email: z.string(),
  username: z.string(),
  password: z.string(),
});

export const LoginUserApi = z.object({
  usernameOrEmail: z.string(),
  password: z.string(),
});

export const UserApi = z.object({
  id: z.number(),
  username: z.string(),
});

export const MyUserApi = z.object({
  id: z.number(),
  email: z.string(),
  username: z.string(),
  role: UserRole,
});

export const ListQueryApi = z.object({
  id: z.array(z.coerce.number()),
});

export type CreateUserApi = z.infer<typeof CreateUserApi>;
export type LoginUserApi = z.infer<typeof LoginUserApi>;
export type UserApi = z.infer<typeof UserApi>;
export type MyUserApi = z.infer<typeof MyUserApi>;


const c = initContract();

export const userContract = c.router({
  create: {
    body: CreateUserApi,
    responses: {
      200: z.object({ user: MyUserApi }),
    },
    method: 'POST',
    path: '/users/',
  },
  login: {
    body: LoginUserApi,
    responses: {
      200: z.object({ user: MyUserApi }),
      401: z.object({}),
    },
    method: 'POST',
    path: '/users/login',
  },
  logout: {
    body: z.object({}),
    responses: {
      200: z.object({ success: z.boolean() }),
    },
    method: 'POST',
    path: '/users/logout',
  },
  getMe: {
    responses: {
      200: z.object({ user: MyUserApi.optional() }),
    },
    method: 'GET',
    path: '/users/me',
  },
  get: {
    pathParams: z.object({ userId: z.coerce.number() }),
    responses: {
      200: z.object({ user: UserApi }),
    },
    method: 'GET',
    path: '/users/:userId',
  },
  list: {
    responses: {
      200: z.object({ users: z.array(UserApi) }),
    },
    query: ListQueryApi,
    method: 'GET',
    path: '/users/',
  }
});