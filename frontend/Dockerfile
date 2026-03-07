# frontend/Dockerfile

# --- Stage 1: Build the React App ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine
# Copy the built files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html
# Open port 80 (standard web port)
EXPOSE 80
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]