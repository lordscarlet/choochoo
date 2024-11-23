import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../api/user";
import { UnauthorizedError } from "../../utils/error";
import { UserModel } from "../model/user";

export async function enforceRole(req: Request): Promise<void> {
  if (!req.url.startsWith('/api') || req.url.startsWith('/api/users')) return;
  const userId = req.session.userId;
  if (userId == null) {
    throw new UnauthorizedError('please log in');
  }

  const user = await UserModel.getUser(userId);

  if (user == null || user.role === UserRole.enum.BLOCKED) {
    req.session.userId = undefined;
    throw new UnauthorizedError('please log in');
  }

  if (user.role === UserRole.enum.ACTIVATE_EMAIL) {
    throw new UnauthorizedError('activate your email');
  }
}

export function enforceRoleMiddleware() {
  return (req: Request, _: Response, next: NextFunction) => {
    enforceRole(req).then(() => next(), next);
  };
}