import sys
import json
import joblib
from pythainlp.tokenize import word_tokenize

# 1. ฟังก์ชันตัดคำ (ต้องมี เพราะตอนเทรนเราใช้ตัวนี้)
def thai_tokenizer(text):
    return word_tokenize(text, engine='newmm', keep_whitespace=False)

def main():
    try:
        # 2. รับข้อความที่หน้าเว็บ (React) ส่งมาผ่าน server.js
        if len(sys.argv) < 2:
            raise ValueError("ไม่มีข้อความส่งมาให้ AI วิเคราะห์")
        
        input_text = sys.argv[1]

        # 3. โหลดสมองกล (ไฟล์ .pkl) ที่เราเทรนไว้แล้ว
        # ⚠️ หมายเหตุ: ตรวจสอบ Path ให้ตรงกับที่คุณเอฟเก็บไฟล์ไว้
        model = joblib.load('models/fake_news_rf_model.pkl')
        vectorizer = joblib.load('models/tfidf_vectorizer.pkl')

        # 4. แปลงข้อความและให้ AI ทำนายผล
        X_new = vectorizer.transform([input_text])
        prediction = model.predict(X_new)[0]
        
        # ดึงค่าความมั่นใจ (Accuracy/Confidence) ของ AI
        probability = model.predict_proba(X_new)[0]
        confidence = max(probability) * 100

        # 5. จัดรูปแบบผลลัพธ์
        # (สมมติว่า label '1' คือข่าวปลอม และ '0' คือข่าวจริง ปรับได้ตาม Dataset ของคุณเอฟครับ)
        is_fake = bool(prediction == 1) 
        
        result = {
            "isFake": is_fake,
            "confidence": round(confidence, 2)
        }

        # 6. ส่งกลับเป็น JSON (สำคัญมาก: ห้าม print ข้อความอื่นเด็ดขาด!)
        print(json.dumps(result))

    except Exception as e:
        # ถ้ามี Error ให้ส่ง Error กลับไปแบบ JSON หน้าเว็บจะได้ไม่พัง
        error_result = {"error": str(e)}
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()