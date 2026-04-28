 FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ../frontend ./frontend
COPY . ./backend
EXPOSE 5000
CMD ["node", "backend/server.js"]