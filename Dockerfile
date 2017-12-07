# Builds a Docker to deliver dist/
FROM nginx:1.10.3-alpine
COPY dist/ /usr/share/nginx/html
