FROM node:18
WORKDIR /app

# Root-la irundhu backend package.json edukkaum
COPY backend/package*.json ./ 
RUN npm install

# Frontend and Backend folders-ah appadiye copy pannuvom
COPY frontend ./frontend
COPY backend ./backend

EXPOSE 5000

# Server-ah run pannaum
CMD ["node", "backend/server.js"]