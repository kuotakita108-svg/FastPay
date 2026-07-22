FROM golang:1.26-alpine AS build
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o pulsaprime ./cmd/api
FROM alpine:latest
WORKDIR /app
COPY --from=build /app/pulsaprime .
EXPOSE 8080
CMD ["./pulsaprime"]
