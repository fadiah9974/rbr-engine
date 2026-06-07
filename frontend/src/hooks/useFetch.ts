"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/helper";

export function useFetch<T>(loader: () => Promise<T>, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    setLoading(true);
    loader()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [enabled, loader]);

  return { data, error, loading };
}
