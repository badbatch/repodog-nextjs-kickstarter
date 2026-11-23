import { handleBrowserTelemetry } from '@next-box/logging/server';
import { createApiHandler } from '#server/createApiHandler.ts';

/**
 * Internal ingestion route. The shared handler requires authentication before
 * the request reaches the body parser.
 *
 * @ignore
 */
export const POST = createApiHandler({ handler: handleBrowserTelemetry });
