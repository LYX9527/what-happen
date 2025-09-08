FROM node:lts-alpine
COPY .output /app/
WORKDIR /app
ENV HOST=0.0.0.0
ENV NODE_ENV=development
EXPOSE 3000
CMD ["sh", "-c", "node server/index.mjs"]
