import { ResultType, defineOperation } from '@next-box/route-handler';
import { z } from 'zod';
import { exampleResponseSchema } from '#bff/schemas.ts';
import { type ServerApiClient } from '#libs/ApiClient/types.ts';

type ExampleResult =
  | { data: z.infer<typeof exampleResponseSchema>; type: typeof ResultType.Success }
  | { details: { body: unknown; status: number }; type: typeof ResultType.Failure }
  | { type: typeof ResultType.Unavailable };

const context: { apiClient?: ServerApiClient } = {};

export const getExample = defineOperation({
  context,
  handler: async ({ context: { apiClient }, input }): Promise<ExampleResult> => {
    if (!apiClient) {
      return { type: ResultType.Unavailable };
    }

    try {
      const response = await (input.restricted ? apiClient.getRestrictedExample() : apiClient.getExample());

      if (!response.ok) {
        return { details: { body: response.data, status: response.status }, type: ResultType.Failure };
      }

      const data = exampleResponseSchema.safeParse(response.data);
      return data.success ? { data: data.data, type: ResultType.Success } : { type: ResultType.Unavailable };
    } catch {
      return { type: ResultType.Unavailable };
    }
  },
  validation: z.object({ restricted: z.boolean() }),
});
