# Simple production image for the Node app
FROM node:20-alpine

WORKDIR /app
COPY app/package*.json ./
RUN npm ci --only=production
COPY app/. ./

ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["npm", "start"]
