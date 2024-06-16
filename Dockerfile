FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy the current directory contents
COPY . .

# Install dependencies
RUN bun install --no-save

# Build the app
RUN rm -rf dist && bun run build

# Expose the port
EXPOSE $PORT

# Start the app
CMD ["bun", "app.ts"]