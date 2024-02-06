# Step 1: Build the application
# Use a Node.js base image to build the React app
FROM node:16 as build-stage

# Set the working directory in the Docker container
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) files
COPY package*.json ./
# If you are using yarn, uncomment the next line and delete the npm install line
# COPY yarn.lock ./

# Install the project dependencies
RUN npm install
# If you are using yarn, uncomment the next line and delete the npm install line
# RUN yarn install

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Build the app
RUN npm run build
# If you are using yarn, uncomment the next line and delete the npm run build line
# RUN yarn build

# Step 2: Serve the application using Nginx
FROM nginx:alpine as production-stage

# Copy the built app to the Nginx server
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80 to the outside once the container has launched
EXPOSE 80

# Start Nginx and keep it running in the foreground
CMD ["nginx", "-g", "daemon off;"]
