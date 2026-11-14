import { createRestClient } from 'getta';
import { setTimeout } from 'node:timers/promises';
import { createApiClient } from '#server/httpClient/client.ts';

const required = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} for the Docker end-to-end run.`);
  }

  return value;
};

const apiUrl = required('E2E_API_URL');
const deadline = Date.now() + 120_000;
let isReady = false;

while (Date.now() < deadline) {
  try {
    const response = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(5000) });

    if (response.ok) {
      isReady = true;
      break;
    }
  } catch {
    // The API creates its schema and bootstraps the privileged example user before it starts listening.
  }

  await setTimeout(1000);
}

if (!isReady) {
  throw new Error('The .NET API did not become ready within 120 seconds.');
}

const apiClient = createApiClient(createRestClient({ basePath: apiUrl, performance }));

const response = await apiClient.registerUser({
  body: {
    email: required('E2E_USER_EMAIL'),
    password: required('E2E_USER_PASSWORD'),
    userName: 'e2e-user',
  },
  signal: AbortSignal.timeout(30_000),
});

if (response.status !== 201) {
  throw new Error(`Could not create the regular test user (HTTP ${String(response.status)}).`);
}

console.log('The real API is ready and both test accounts are provisioned.');
