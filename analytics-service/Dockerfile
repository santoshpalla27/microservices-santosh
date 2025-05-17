FROM golang:1.20-alpine AS build

WORKDIR /app

COPY go.mod .
# Only copy go.sum if it exists
COPY go.sum* .

# Initialize the module if needed and download dependencies
RUN go mod tidy && go mod download

COPY . .

RUN go build -o main .

FROM alpine:latest

WORKDIR /app

COPY --from=build /app/main .

EXPOSE 9000

CMD ["./main"]