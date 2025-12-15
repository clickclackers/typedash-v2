########################
# Build stage
########################
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Cache Go dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy full module (server imports from module root)
COPY . .

WORKDIR /app/server

# Build static Linux binary for distroless runtime
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/server .

########################
# Runtime stage
########################
FROM gcr.io/distroless/base-debian12

WORKDIR /app

# Copy compiled binary from builder
COPY --from=builder /out/server /app/server

# Environment variables are expected to be provided at runtime.
#
# When running with Docker Compose (see server/docker-compose.yml), the
# server connects to the bundled Postgres container using:
#   DATABASE_URL=postgres://typedash:typedash@db:5432/typedash?sslmode=disable
#
# When running the server container against a Postgres instance on your host
# (outside of Compose), you can use:
#   DATABASE_URL=postgres://your-mac-username@host.docker.internal:5432/typedash?sslmode=disable
#     ^ use host.docker.internal so the container can reach PostgreSQL
#       running on your macOS host (instead of localhost, which would
#       point to the container itself).
#
# In all cases you must also provide:
#   JWT_SECRET=your-super-secret-jwt-key
# The server will fail fast on startup if these are not set correctly or it
# cannot reach the PostgreSQL instance at DATABASE_URL.

# Run in release mode inside the container
ENV GIN_MODE=release

EXPOSE 3000

ENTRYPOINT ["/app/server"]