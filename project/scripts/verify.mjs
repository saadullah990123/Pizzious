import http from 'http';

console.log('--- Pizzious Fast Food Verification Script ---');

// Verification helper for HTTP requests
export async function testEndpoint(baseUrl, path, options = {}) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);
  return { status: response.status, data, headers: response.headers };
}