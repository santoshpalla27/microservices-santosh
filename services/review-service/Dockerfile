FROM golang:1.19-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o review-service

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/review-service .

EXPOSE 6000

CMD ["./review-service"]