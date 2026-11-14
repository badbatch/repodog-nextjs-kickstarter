import { type DefaultSession } from 'next-auth';
import 'next-auth/jwt';

type ApiTokens = {
  accessToken: string;
  expiresAt: number;
  refreshToken: string;
};

declare module 'next-auth' {
  interface User {
    apiTokens?: ApiTokens;
    policies?: string[];
    roles?: string[];
  }

  interface Session {
    /** Only populated by the private server-side auth instance. */
    apiAccessToken?: string;
    correlationId?: string;
    error?: 'RefreshTokenError';
    user: { id: string; policies: string[]; roles: string[] } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    apiTokens?: ApiTokens;
    correlationId?: string;
    error?: 'RefreshTokenError';
    policies?: string[];
    roles?: string[];
  }
}
