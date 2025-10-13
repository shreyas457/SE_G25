# Step 1: Use an official Node.js image
FROM node:22-alpine AS builder

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy dependency files first (for caching)
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the source code
COPY . .

# Step 6: Build the Next.js app
RUN npm run build

# Step 7: Use a smaller runtime image
FROM node:22-alpine AS runner
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose the port Next.js uses
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
