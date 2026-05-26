# ใช้ Node.js เวอร์ชัน 18 เป็นฐาน
FROM node:18-alpine

# กำหนดโฟลเดอร์ทำงานใน Docker
WORKDIR /app

# ก๊อปปี้ไฟล์ package.json มาก่อนเพื่อติดตั้งเครื่องมือ
COPY package*.json ./
RUN npm install

# ก๊อปปี้ไฟล์โค้ดหน้าเว็บทั้งหมดตามเข้าไป
COPY . .

# เปิดพอร์ต 5173 ให้เครื่องของเรามองเห็น
EXPOSE 5173

# คำสั่งสำหรับรันหน้าเว็บ Vite
CMD ["npm", "run", "dev", "--", "--host"]