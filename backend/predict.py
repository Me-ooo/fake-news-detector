import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import sys

# 🌟 นำเข้าไลบรารีตัดคำภาษาไทย
from pythainlp.tokenize import word_tokenize

print("🚀 กำลังเริ่มต้นกระบวนการสร้างสมองกล AI (รองรับภาษาไทย)...")

try:
    df = pd.read_csv('news_dataset.csv')
    print(f"📊 โหลดข้อมูลสำเร็จ! จำนวนข่าวทั้งหมด: {len(df)} ข่าว")
except FileNotFoundError:
    print("❌ ไม่พบไฟล์ 'news_dataset.csv' ครับ!")
    sys.exit()

df = df.dropna(subset=['text', 'label'])

# 🌟 ฟังก์ชันพิเศษสำหรับตัดคำภาษาไทยโดยเฉพาะ
def thai_tokenizer(text):
    # ใช้ engine 'newmm' ซึ่งเป็นมาตรฐานที่แม่นยำและทำงานเร็วที่สุด
    return word_tokenize(text, engine='newmm', keep_whitespace=False)

print("⏳ กำลังเรียนรู้และตัดคำภาษาไทย (ขั้นตอนนี้อาจใช้เวลาหลายนาที หากข้อมูลมีขนาดใหญ่)...")

# ส่งฟังก์ชัน thai_tokenizer เข้าไปให้ TfidfVectorizer ใช้งาน
vectorizer = TfidfVectorizer(tokenizer=thai_tokenizer, max_features=5000) 
X = vectorizer.fit_transform(df['text'])
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("🧠 กำลังเทรนโมเดล Random Forest...")
model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"✅ เทรนเสร็จสิ้น! ความแม่นยำของโมเดล (Accuracy): {accuracy * 100:.2f}%")

joblib.dump(model, 'fake_news_rf_model.pkl')
joblib.dump(vectorizer, 'tfidf_vectorizer.pkl')
print("💾 บันทึกไฟล์โมเดลเสร็จสมบูรณ์!")
print("📌 พร้อมนำไฟล์ .pkl ทั้ง 2 ไฟล์ไปวางทับในโฟลเดอร์ fake-news-backend/models/ แล้วครับ")