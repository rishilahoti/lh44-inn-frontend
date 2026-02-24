const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, ...init } = options;
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { ...init, headers, credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string }; message?: string };
    throw new Error(err.error?.message ?? err.message ?? res.statusText ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  const json = await res.json();
  // Backend wraps in { data, timeStamp }; unwrap for convenience
  return ((json as { data?: T }).data ?? json) as T;
}
