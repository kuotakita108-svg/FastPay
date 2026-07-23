FROM golang:1.26-alpine AS build
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o kuotakita ./cmd/api
FROM alpine:latest
WORKDIR /app
COPY --from=build /app/kuotakita .
EXPOSE 8080
CMD ["./kuotakita"]
