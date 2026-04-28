FROM node:18
WORKDIR /app

# Backend package files-ah copy panni install pannuvom
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Full folders-ah copy pannuvom
COPY frontend/ ./frontend/
COPY backend/ ./backend/

EXPOSE 5000

# Server-ah run pannaum
CMD ["node", "backend/server.js"]