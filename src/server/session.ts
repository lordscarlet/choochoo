
import 'express-session';

declare module 'express-session' {
  export interface SessionData {
    userId?: number;
    xsrfToken?: string;
  }
}