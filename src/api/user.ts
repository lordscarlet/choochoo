import { z } from 'zod';
import { initContract } from '@ts-rest/core';

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
  id: z.string(),
  username: z.string(),
});

export const MyUserApi = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
});

export const ListQueryApi = z.object({
  id: z.array(z.string()),
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
      200: z.object({user: MyUserApi}),
    },
    method: 'POST',
    path: '/',
  },
  login: {
    body: LoginUserApi,
    responses: {
      200: z.object({user: MyUserApi}),
    },
    method: 'POST',
    path: '/login',
  },
  logout: {
    body: z.object({}),
    responses: {
      200: z.object({success: z.boolean()}),
    },
    method: 'POST',
    path: '/logout',
  },
  getMe: {
    responses: {
      200: z.object({user: MyUserApi.optional()}),
    },
    method: 'GET',
    path: '/me',
  },
  get: {
    pathParams: z.object({userId: z.string()}),
    responses: {
      200: z.object({user: UserApi}),
    },
    method: 'GET',
    path: '/:userId',
  },
  list: {
    responses: {
      200: z.object({users: z.array(UserApi)}),
    },
    query: ListQueryApi,
    method: 'GET',
    path: '/',
  }
});