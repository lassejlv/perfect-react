FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy the current directory contents
COPY . .

# Install dependencies
RUN bun install --no-save

# Build the app
RUN rm -rf dist && bun run build

# Prisma generate & migrate
RUN bunx prisma migrate deploy && bunx prisma generate

# Expose the port
EXPOSE $PORT

# Start the app
CMD ["bun", "app.ts"]