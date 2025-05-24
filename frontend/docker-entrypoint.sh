#!/bin/sh

# Replace environment variables in the config.js file
sed -i "s|__VITE_API_URL__|${VITE_API_URL:-http://localhost:4000}|g" /usr/share/nginx/html/config.js

# Execute the original entrypoint
exec "$@"
