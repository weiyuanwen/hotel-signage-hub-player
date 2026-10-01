FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_REVERB_APP_KEY
ARG VITE_REVERB_HOST=ws.signagehub.online
ARG VITE_REVERB_PORT=443
ARG VITE_REVERB_SCHEME=https
ENV VITE_REVERB_APP_KEY=$VITE_REVERB_APP_KEY
ENV VITE_REVERB_HOST=$VITE_REVERB_HOST
ENV VITE_REVERB_PORT=$VITE_REVERB_PORT
ENV VITE_REVERB_SCHEME=$VITE_REVERB_SCHEME
RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
# nginx workers run as the unprivileged "nginx" user, so anything left at 0600
# by the build context comes out unreadable and every asset 403s while the page
# itself still serves (index.html happens to keep 0644). Open it up here rather
# than relying on the checkout permissions the build happened to inherit.
RUN chmod -R a+rX /usr/share/nginx/html
EXPOSE 80
