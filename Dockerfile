# Use a Node.js base image
FROM node:18

# Set the working directory in the Docker container
WORKDIR /app

# Install the 'serve' package globally
RUN npm install -g serve

# Copy the built static files from your dist folder to the Docker image
COPY ./dist /app

# Expose the port that 'serve' will run on
EXPOSE 80

# Command to serve the app using 'serve'
CMD ["serve", "-s", ".", "-l", "80"]