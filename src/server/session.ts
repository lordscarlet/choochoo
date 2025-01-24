import "express-session";

declare module "express-session" {
  export interface SessionData {
    adminUserId?: number;
    userId?: number;
    xsrfToken?: string;
  }
}
