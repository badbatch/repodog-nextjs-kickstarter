import { createExampleHandler } from '#features/example/createExampleHandler.ts';
import { EXAMPLE_ACCESS_POLICY } from '#libs/Auth/policies.ts';

/**
 * @response exampleResponseSchema
 */
export const GET = createExampleHandler({ policy: EXAMPLE_ACCESS_POLICY, restricted: true });
