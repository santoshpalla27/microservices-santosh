FROM golang:1.20-alpine AS build

WORKDIR /app

# Copy go mod files first for better layer caching
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Create minimal production image
FROM alpine:latest

WORKDIR /app

# Copy the binary from the build stage
COPY --from=build /app/main .

# Expose the port
EXPOSE 9000

# Run the application
CMD ["./main"]