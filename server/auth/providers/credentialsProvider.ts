import { CredentialsSignin } from 'next-auth';
import Credentials, { type CredentialsConfig } from 'next-auth/providers/credentials';
import { loadAppSettings } from '#appSettings/index.ts';
import { credentialsSchema } from '#features/auth/login/schema.ts';
import { currentUserSchema, tokenResponseSchema } from '#server/auth/schemas.ts';
import { createServerApiClient } from '#server/createServerApiClient.ts';

export const authorizeCredentials: CredentialsConfig['authorize'] = async credentials => {
  const parsed = credentialsSchema.safeParse(credentials);

  if (!parsed.success) {
    throw new CredentialsSignin();
  }

  const settings = await loadAppSettings();
  const apiClient = await createServerApiClient();
  const signal = AbortSignal.timeout(settings.Server.Api.TimeoutMs);
  const response = await apiClient.loginUser({ body: parsed.data, signal });

  if (response.status === 401) {
    throw new CredentialsSignin();
  }

  if (response.status !== 200) {
    throw new Error('Authentication service unavailable');
  }

  const tokens = tokenResponseSchema.parse(response.data);

  const me = await apiClient.getCurrentUser({
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
    signal,
  });

  if (me.status !== 200) {
    throw new Error('Could not load authenticated user');
  }

  const currentUser = currentUserSchema.parse(me.data);

  return {
    apiTokens: { ...tokens, expiresAt: Date.now() + tokens.expiresIn * 1000 },
    email: currentUser.email,
    id: currentUser.id,
    name: currentUser.userName,
    policies: currentUser.policies,
    roles: currentUser.roles,
  };
};

export const credentialsProvider = Credentials({
  authorize: authorizeCredentials,
  credentials: {
    email: { type: 'email' },
    password: { type: 'password' },
  },
});
