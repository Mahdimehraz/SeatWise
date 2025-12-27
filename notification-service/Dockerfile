# Use Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and install deps
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose port (optional)
EXPOSE 3005

# Start the service
CMD ["node", "index.js"]