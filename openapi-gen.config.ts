/* eslint-disable unicorn/filename-case */
import { defineConfig } from 'next-openapi-gen';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, import-x/no-default-export
export default defineConfig({
  apiDir: './app/api',
  components: {
    securitySchemes: {
      BearerAuth: {
        bearerFormat: 'opaque access token',
        scheme: 'bearer',
        type: 'http',
      },
    },
  },
  debug: false,
  defaultResponseSet: 'common',
  diagnostics: {
    enabled: true,
  },
  docsUrl: 'api-docs',
  errorConfig: {
    codes: {
      '400': {
        description: 'Bad Request',
        variables: {
          ERROR_CODE: 'BAD_REQUEST',
          ERROR_MESSAGE: 'Invalid request parameters',
        },
      },
      '401': {
        description: 'Unauthorized',
        variables: {
          ERROR_CODE: 'UNAUTHORIZED',
          ERROR_MESSAGE: 'Authentication required',
        },
      },
      '403': {
        description: 'Forbidden',
        variables: {
          ERROR_CODE: 'FORBIDDEN',
          ERROR_MESSAGE: 'Access denied',
        },
      },
      '404': {
        description: 'Not Found',
        variables: {
          ERROR_CODE: 'NOT_FOUND',
          ERROR_MESSAGE: 'Resource not found',
        },
      },
      '409': {
        description: 'Conflict',
        variables: {
          ERROR_CODE: 'CONFLICT',
          ERROR_MESSAGE: 'Resource already exists',
        },
      },
      '500': {
        description: 'Internal Server Error',
        variables: {
          ERROR_CODE: 'INTERNAL_ERROR',
          ERROR_MESSAGE: 'An unexpected error occurred',
        },
      },
    },
    template: {
      properties: {
        code: {
          example: '{{ERROR_CODE}}',
          type: 'string',
        },
        error: {
          example: '{{ERROR_MESSAGE}}',
          type: 'string',
        },
      },
      type: 'object',
    },
  },
  framework: {
    kind: 'nextjs',
    router: 'app',
  },
  ignoreRoutes: [],
  includeOpenApiRoutes: false,
  info: {
    description: 'The BFF contract for the paired application starter.',
    title: 'Kickstarter BFF',
    version: '1.0.0',
  },
  next: {},
  openapi: '3.0.0',
  outputDir: './public',
  outputFile: 'openapi.json',
  responseSets: {
    auth: ['400', '401', '403', '500'],
    common: ['400', '500'],
    public: ['400', '500'],
  },
  routerType: 'app',
  schemaDir: '.',
  schemaFiles: [],
  schemaType: 'zod',
  servers: [
    {
      description: 'Local development server',
      url: 'http://localhost:3000/api',
    },
  ],
  ui: 'scalar',
});
