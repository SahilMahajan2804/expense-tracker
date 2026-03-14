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

# Use envsubst to replace variables in Nginx config and start Nginx
EXPOSE 80
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
