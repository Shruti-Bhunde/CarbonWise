const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }
  return '';
};

async function apiFetch(path, options = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const authApi = {
  register: (payload) => apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  login: (payload) => apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),
  me: () => apiFetch('/api/auth/me', { method: 'GET', headers: {} }),
  dashboard: () => apiFetch('/api/dashboard', { method: 'GET', headers: {} }),
};

export const questsApi = {
  complete: (questId) => apiFetch(`/api/quests/${questId}/complete`, { method: 'POST', body: JSON.stringify({}) }),
  today: () => apiFetch('/api/quests/today', { method: 'GET', headers: {} }),
};

export const reportsApi = {
  latest: () => apiFetch('/api/reports/latest', { method: 'GET', headers: {} }),
  generate: () => apiFetch('/api/reports/generate', { method: 'POST', body: JSON.stringify({}) }),
};

export const badgesApi = {
  list: () => apiFetch('/api/badges', { method: 'GET', headers: {} }),
};

export const chatApi = {
  send: (message) => apiFetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  }),
  history: () => apiFetch('/api/chat/history', { method: 'GET', headers: {} }),
};

export default apiFetch;
