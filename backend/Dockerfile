FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production && \
    # Install required dependencies that might be missing
    npm install redis@4.6.6 --save

# Copy application files
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose API port
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]