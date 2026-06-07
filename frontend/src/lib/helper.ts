export function toNumber(value: string | number) {
  return Number(value) || 0;
}

export function getErrorMessage(error: unknown, fallback = "Terjadi kesalahan") {
  return error instanceof Error ? error.message : fallback;
}
