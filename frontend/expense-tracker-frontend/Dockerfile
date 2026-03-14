# Build stage
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run stage
FROM nginx:stable-alpine
# Copy build artifacts to Nginx html directory
COPY --from=build /app/dist/*/browser /usr/share/nginx/html

# Copy custom nginx config as a template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Extract the environment DNS resolver, use envsubst, and start Nginx immediately
EXPOSE 80
CMD ["/bin/sh", "-c", "export RESOLVER=$(awk '/^nameserver/ {print $2}' /etc/resolv.conf | head -n 1) && envsubst '${BACKEND_URL} ${RESOLVER}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
