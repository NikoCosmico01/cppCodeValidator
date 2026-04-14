// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export async function checkCode(code, fileName = 'main.cpp') {
  console.log('API: Sending code to server...', { 
    codeLength: code.length, 
    fileName,
    url: `${API_BASE_URL}/check`
  });

  try {
    const response = await fetch(`${API_BASE_URL}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        fileName
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('API: Received response:', data);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function checkHealth() {
  console.log('API: Checking server health...');
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.log('API: Server health OK:', data);
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

export async function getVersion() {
  console.log('API: Getting cppcheck version...');
  try {
    const response = await fetch(`${API_BASE_URL}/version`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.log('API: Version info:', data);
    return data;
  } catch (error) {
    console.error('Version fetch failed:', error);
    throw error;
  }
}