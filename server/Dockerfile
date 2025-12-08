# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Cache deps
COPY go.mod go.sum ./
RUN go mod download

# Copy full module (server imports from module root)
COPY . .

WORKDIR /app/server

# Build Linux binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/server .

# Runtime stage
FROM gcr.io/distroless/base-debian12

WORKDIR /app
COPY --from=builder /out/server /app/server

EXPOSE 3000
ENTRYPOINT ["/app/server"]