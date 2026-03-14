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

# Wait for backend DNS resolution, then replace variables and start Nginx
EXPOSE 80
CMD ["/bin/sh", "-c", "export TARGET_HOST=$(echo $BACKEND_URL | cut -d':' -f1) && echo 'Waiting for $TARGET_HOST to be resolvable...' && while ! ping -c 1 $TARGET_HOST >/dev/null 2>&1; do sleep 2; done && echo '$TARGET_HOST is ready!' && envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
