# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /

# Copy package files if they exist (for dependencies – optional here)
# COPY package*.json ./
# RUN npm install

# Copy the entire project into the container
COPY . .

# Expose the port the server runs on
EXPOSE 3000

# Run the server using Node
CMD ["node", "server.mjs"]
