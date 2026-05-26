# 📌 Project Context: Thai Fake News Detector

## 📖 รายละเอียดโปรเจค (Overview)
ระบบ AI ตรวจจับข่าวปลอมภาษาไทยแบบ Full-Stack รองรับการพิมพ์ข้อความข่าวและแปะลิงก์ (URL) เพื่อดึงเนื้อหามาวิเคราะห์อัตโนมัติ พร้อมหน้า Dashboard สถิติแบบเรียลไทม์

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
* **Frontend:** React (Vite), Tailwind CSS, Recharts (สำหรับกราฟ)
* **Backend:** Node.js, Express
* **AI / Machine Learning:** Python, scikit-learn (Random Forest Model), PyThaiNLP (สำหรับตัดคำภาษาไทย), BeautifulSoup4 (สำหรับ Web Scraping)
* **Database:** Supabase (PostgreSQL)
* **DevOps & Testing:** Docker, Docker Compose, Vitest

## 📂 โครงสร้างโฟลเดอร์หลัก (Folder Structure)
```text
FAKE-NEWS-APP/
 ├── ai/                         # โฟลเดอร์เตรียมข้อมูลและเทรนโมเดล AI
 │    ├── news_dataset.csv       # ชุดข้อมูลข่าวจริง/ข่าวปลอมภาษาไทย
 │    └── train_model.py         # สคริปต์สอน AI (รองรับตัดคำ PyThaiNLP)
 │
 ├── backend/                    # เซิร์ฟเวอร์ API และสมองกล
 │    ├── models/                # เก็บไฟล์ .pkl ที่เทรนเสร็จแล้ว
 │    ├── predict.py             # โค้ด AI สำหรับดึง URL และทำนายผล
 │    └── server.js              # API คอยรับส่งข้อมูลกับหน้าเว็บ
 │
 └── frontend/                   # โฟลเดอร์หน้าเว็บระบบหลัก (React)
      ├── src/                   # โค้ดหน้าเว็บ React
      │    ├── __tests__/        # ไฟล์ทดสอบระบบ (Vitest)
      │    ├── lib/supabase.js   # ไฟล์เชื่อมต่อฐานข้อมูล
      │    └── App.jsx           # หน้า UI หลักและ Dashboard
      │
      ├── Dockerfile             # ตั้งค่าคอนเทนเนอร์สำหรับ Frontend
      └── docker-compose.yml     # รันระบบด้วย Docker
      