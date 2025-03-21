# Use an official Node.js base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the container
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["node", "server.js"]
