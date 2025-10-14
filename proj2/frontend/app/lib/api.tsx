export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access_token");
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
}

export function getCurrentUser() {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("user_name");
  const email = localStorage.getItem("user_email");
  const id = localStorage.getItem("user_id");

  if (!token) return null;

  return {
    id: Number(id),
    name: name || "",
    email: email || "",
    role: role || "",
    access_token: token,
  };
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("role");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_id");
}