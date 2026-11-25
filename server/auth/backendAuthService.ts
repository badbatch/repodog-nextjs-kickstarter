import { type ApiTokenAuthOptions, type ApiTokens, type ApiUser } from '@next-box/auth';
import { CredentialsSignin } from 'next-auth';
import { loadAppSettings } from '#appSettings/index.ts';
import { credentialsSchema } from '#features/auth/login/schema.ts';
import { type ServerApiClient } from '#libs/ApiClient/types.ts';
import { currentUserSchema, tokenResponseSchema } from '#server/auth/schemas.ts';
import { createServerApiClient } from '#server/createServerApiClient.ts';

const fetchCurrentUser = async (
  apiClient: ServerApiClient,
  accessToken: string,
  signal: AbortSignal,
): Promise<ApiUser> => {
  const response = await apiClient.getCurrentUser({
    headers: { Authorization: `Bearer ${accessToken}` },
    signal,
  });

  if (response.status !== 200) {
    throw new Error('Could not load authenticated user');
  }

  const { email, id, policies, roles, userName } = currentUserSchema.parse(response.data);
  return { email, id, name: userName, policies, roles };
};

export const loadCurrentUser = async (accessToken: string): Promise<ApiUser> => {
  const settings = await loadAppSettings();
  const apiClient = await createServerApiClient();
  return fetchCurrentUser(apiClient, accessToken, AbortSignal.timeout(settings.Server.Api.TimeoutMs));
};

export const refreshTokens = async (refreshToken: string): Promise<ApiTokens> => {
  const settings = await loadAppSettings();
  const apiClient = await createServerApiClient();

  const response = await apiClient.refreshUserToken({
    body: { refreshToken },
    signal: AbortSignal.timeout(settings.Server.Api.TimeoutMs),
  });

  if (response.status !== 200) {
    throw new Error('Refresh failed');
  }

  const tokens = tokenResponseSchema.parse(response.data);

  return {
    accessToken: tokens.accessToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
    refreshToken: tokens.refreshToken,
  };
};

export const authorizeCredentials: ApiTokenAuthOptions['authorize'] = async credentials => {
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

  const { accessToken, expiresIn, refreshToken } = tokenResponseSchema.parse(response.data);
  const user = await fetchCurrentUser(apiClient, accessToken, signal);

  return { ...user, apiTokens: { accessToken, expiresAt: Date.now() + expiresIn * 1000, refreshToken } };
};
