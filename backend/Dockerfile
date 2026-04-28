FROM node:18
WORKDIR /app
# package.json ippo backend folder-kulla irukkurathala, 
# 'backend/' nu munnaadi add pannanum
COPY backend/package*.json ./
RUN npm install
COPY frontend ./frontend
COPY backend ./backend
EXPOSE 5000
CMD ["node", "backend/server.js"]