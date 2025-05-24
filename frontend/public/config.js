// This file will be served statically and loaded at runtime
window.ENV = {
  // When running in Docker, use a relative URL that will be proxied by Nginx
  // When running in development, you might need to use http://localhost:4000
  VITE_API_URL: window.location.hostname === 'localhost' ? 'http://localhost:4000' : ''
};
