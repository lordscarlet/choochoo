import { NextFunction, Request, Response } from "express";
import { SessionData } from "express-session";
import { UserRole } from "../../api/user";
import { UnauthorizedError } from "../../utils/error";
import { assert } from "../../utils/validate";
import { UserModel } from "../model/user";

interface BaseRequest {
  url: string;
  session: SessionData;
}

const rolesInOrder = [
  UserRole.enum.BLOCKED,
  UserRole.enum.ACTIVATE_EMAIL,
  UserRole.enum.USER,
  UserRole.enum.ADMIN,
];

export async function enforceRole(req: BaseRequest, requiredRole: UserRole = UserRole.Values.USER): Promise<void> {
  const userId = req.session.adminUserId ?? req.session.userId;
  if (userId == null) {
    throw new UnauthorizedError('please log in');
  }

  const user = await UserModel.getUser(userId);

  if (user == null) {
    throw new UnauthorizedError('please log in');
  }

  assert(rolesInOrder.indexOf(user.role) >= rolesInOrder.indexOf(requiredRole), { permissionDenied: true });
}

export function enforceRoleMiddleware() {
  return (req: Request, _: Response, next: NextFunction) => {
    if (!req.url.startsWith('/api') || req.url.startsWith('/api/users')) return next();
    enforceRole(req).then(() => next(), next);
  };
}