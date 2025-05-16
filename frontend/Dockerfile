FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Install Tailwind CSS and its dependencies
RUN npm install -D tailwindcss postcss autoprefixer

COPY . .

# Generate Tailwind CSS configuration if it doesn't exist
RUN npx tailwindcss init -p

EXPOSE 3000

CMD ["npm", "start"]