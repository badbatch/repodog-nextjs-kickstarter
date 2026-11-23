import { createExampleHandler } from '#features/example/createExampleHandler.ts';

/**
 * @response exampleResponseSchema
 */
export const GET = createExampleHandler({ restricted: false });
