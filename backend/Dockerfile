# Use lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ .

# Copy frontend so express.static can serve it
COPY frontend/ ../frontend/

# Expose the port the server listens on
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
