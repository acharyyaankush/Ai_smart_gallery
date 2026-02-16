# Step 1: Base image for Node.js
FROM node:18-alpine

# Step 2: Create the working directory
WORKDIR /app

# Step 3: Copy and install Server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Step 4: Copy and install Client dependencies
COPY client/package*.json ./client/
RUN cd client && npm install

# Step 5: Copy all project files
COPY . .

# Step 6: Build the React frontend
RUN cd client && npm run build

# Step 7: Expose the port your server runs on
EXPOSE 5000

# Step 8: Start the backend server
CMD ["node", "server/index.js"]