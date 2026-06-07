export function createFormData<T extends Record<string, unknown>>(payload: T) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}
