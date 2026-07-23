FROM node:22-alpine AS frontend
WORKDIR /src/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM golang:1.26-alpine AS backend
WORKDIR /src/backend
COPY backend/go.mod ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /kuotakita ./cmd/api

FROM alpine:3.22
RUN apk add --no-cache ca-certificates && adduser -D -H kuotakita
WORKDIR /app
COPY --from=backend /kuotakita ./kuotakita
COPY --from=frontend /src/frontend/dist ./public
ENV APP_ENV=production STATIC_DIR=/app/public APP_PORT=8080
EXPOSE 8080
USER kuotakita
CMD ["./kuotakita"]
