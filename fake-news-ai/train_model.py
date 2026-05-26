import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import sys
import ast # สำหรับจัดการข้อความที่เป็น List ใน string
from pythainlp.tokenize import word_tokenize # สำหรับตัดคำไทย

print("🚀 กำลังเริ่มต้นกระบวนการสร้างสมองกล AI เวอร์ชันอัปเกรด...")

# 1. โหลดข้อมูลจากไฟล์ CSV (เพิ่ม encoding เพื่อแก้ปัญหาตัวต่างดาว)
try:
    # ใช้ encoding='utf-8-sig' เพื่อให้อ่านภาษาไทยจาก Excel ได้ถูกต้อง
    df = pd.read_csv('news_dataset.csv', encoding='utf-8-sig')
    print(f"📊 โหลดข้อมูลสำเร็จ! จำนวนข่าวทั้งหมด: {len(df)} ข่าว")
except FileNotFoundError:
    print("❌ ไม่พบไฟล์ 'news_dataset.csv'!")
    sys.exit()

# --- ขั้นตอนพิเศษ: ล้างข้อมูลจาก Excel ของคุณเอฟ ---

# 1.1 แปลง Label จากตัวหนังสือเป็นตัวเลข (Fake News -> 1, อื่นๆ -> 0)
df['label'] = df['label'].apply(lambda x: 1 if str(x).strip() == 'Fake News' else 0)

# 1.2 จัดการคอลัมน์ text ที่เป็น List (['คำ', 'คำ']) ให้กลายเป็นประโยคปกติ
def clean_text_list(text_val):
    text_val = str(text_val).strip()
    if text_val.startswith('['):
        try:
            # แปลง string list เป็น list จริงๆ แล้วรวมคำด้วยช่องว่าง
            actual_list = ast.literal_eval(text_val)
            return " ".join(actual_list)
        except:
            return text_val
    return text_val

print("🧹 กำลังล้างข้อมูลและจัดรูปแบบภาษาไทย...")
df['text'] = df['text'].apply(clean_text_list)

# ลบแถวที่ว่างเปล่าออก
df = df.dropna(subset=['text', 'label'])

# --- จบขั้นตอนการล้างข้อมูล ---

# 2. ฟังก์ชันตัดคำภาษาไทย
def thai_tokenizer(text):
    return word_tokenize(text, engine='newmm', keep_whitespace=False)

# 3. แปลงข้อความเป็นตัวเลข (Vectorization)
print("⏳ กำลังตัดคำและทำ TF-IDF (ขั้นตอนนี้อาจใช้เวลานิดนึง)...")
vectorizer = TfidfVectorizer(tokenizer=thai_tokenizer, max_features=5000) 
X = vectorizer.fit_transform(df['text'])
y = df['label']

# 4. แบ่งข้อมูลสำหรับ สอน 80% และ ทดสอบ 20%
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. เริ่มการสอน (Model Training)
print("🧠 กำลังเทรนโมเดล Random Forest...")
model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

# 6. ประเมินผล
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"✅ เทรนเสร็จสิ้น! ความแม่นยำ (Accuracy): {accuracy * 100:.2f}%")

# 7. บันทึกไฟล์
joblib.dump(model, 'fake_news_rf_model.pkl')
joblib.dump(vectorizer, 'tfidf_vectorizer.pkl')
print("💾 บันทึกไฟล์ .pkl เรียบร้อย! นำไปวางทับใน backend/models ได้เลยครับ")