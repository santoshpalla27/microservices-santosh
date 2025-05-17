FROM golang:1.20-alpine

WORKDIR /app

# Copy source code
COPY . .

# Initialize Go modules and download dependencies
RUN go mod tidy

# Build the application
RUN go build -o main .

# Expose the port
EXPOSE 9000

# Run the application
CMD ["./main"]