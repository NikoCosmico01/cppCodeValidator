// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON body (proxy error page etc.)
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (HTTP ${response.status})`);
  }
  return data;
}

export function checkCode(code, fileName = 'main.cpp', std = 'c++17') {
  return request('/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, fileName, std })
  });
}

export function checkHealth() {
  return request('/health');
}

export function getVersion() {
  return request('/version');
}
