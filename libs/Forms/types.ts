export type FormActionResult<T> = {
  fieldErrors?: Partial<Record<keyof T, string[]>>;
  formError?: string;
};
