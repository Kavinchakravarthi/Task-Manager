export type FieldErrors = Record<string, string>;

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getApiErrorMessage = (error: any, fallback: string) => {
  const errors = error?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return errors[0].msg || fallback;
  }

  return error?.response?.data?.message || fallback;
};

export const getApiFieldErrors = (error: any): FieldErrors => {
  const errors = error?.response?.data?.errors;
  if (!Array.isArray(errors)) return {};

  return errors.reduce((result: FieldErrors, item: { path?: string; msg?: string }) => {
    if (item.path && item.msg && !result[item.path]) result[item.path] = item.msg;
    return result;
  }, {});
};

export const inputErrorClass = (hasError: boolean) =>
  `w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500 ${hasError ? 'border-red-400' : 'border-slate-300'}`;