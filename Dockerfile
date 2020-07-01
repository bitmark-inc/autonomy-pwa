# Build the web app

FROM node:10-alpine AS client-builder

COPY . /client
RUN cd /client && npm install && npm run build -- --aot=true --prod=true

# Put the web app into a web server

FROM nginx:1.19.0 AS web-server

COPY --from=client-builder /client/dist/autonomy /usr/share/nginx/html
EXPOSE 80