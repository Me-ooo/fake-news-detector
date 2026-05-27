import React, { useState, useEffect } from 'react'; 
import { supabase } from './lib/supabase';
// Import คอมโพเนนต์สำหรับสร้างกราฟจาก Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState([]); // State เก็บข้อมูลกราฟ

  // ฟังก์ชันดึงประวัติล่าสุด
  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('news_scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setHistory(data);
    if (error) console.error('ดึงประวัติไม่สำเร็จ:', error);
  };

  // ฟังก์ชันดึงสถิติความแม่นยำของโมเดล AI
  const fetchMetrics = async () => {
    const { data, error } = await supabase
      .from('model_metrics')
      .select('*')
      .order('accuracy_percentage', { ascending: false });

    if (data) setMetrics(data);
    if (error) console.error('ดึงสถิติโมเดลไม่สำเร็จ:', error);
  };

  useEffect(() => {
    fetchHistory();
    fetchMetrics();  // เรียกใช้ตอนโหลดหน้าเว็บ
  }, []);

  const handleScan = async () => {
    if (!inputText.trim()) return alert('กรุณาใส่ข้อความก่อนตรวจสอบครับ!');

    setIsScanning(true);
    setResult(null);
    
    let aiScore = 0;
    let aiIsFake = false;
    
    try {
      const response = await fetch('https://fake-news-detector-w1gx.onrender.com/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }), 
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      // 🌟 จุดที่แก้ไข: เปลี่ยนจาก data.score เป็น data.confidence เพื่อให้รับค่า % จาก AI ได้ถูกต้อง
      aiScore = data.confidence; 
      aiIsFake = data.isFake;
      
    } catch (error) {
      console.error('เชื่อมต่อ AI ไม่สำเร็จ:', error);
      alert('เซิร์ฟเวอร์ AI มีปัญหา หรือลืมเปิด Backend ครับ!');
      setIsScanning(false);
      return; 
    }

    const { error } = await supabase
      .from('news_scans')
      .insert([
        { content: inputText, credibility_score: aiScore, is_fake: aiIsFake }
      ]);

    if (error) {
      console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error.message);
      alert('ไม่สามารถบันทึกข้อมูลได้');
    } else {
      setResult({ score: aiScore, isFake: aiIsFake });
      fetchHistory(); 
    }

    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <nav className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold text-blue-600">FakeNewsDetector</h1>
        <div className="bg-gray-200 px-4 py-2 rounded-full text-sm font-medium">User Profile</div>
      </nav>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* คอลัมน์ซ้าย (ส่วนกรอกข้อความ) */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">ตรวจสอบข้อความ / ข่าวสาร</h2>
            <textarea
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none mb-4"
              placeholder="วางเนื้อหาข่าว หรือข้อความที่คุณสงสัยที่นี่..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            ></textarea>

            <button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
            >
              {isScanning ? 'กำลังวิเคราะห์ข้อมูล...' : 'วิเคราะห์ความน่าเชื่อถือ'}
            </button>
          </div>

          {result && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in-up">
              <h3 className="text-lg font-semibold mb-2">ผลการวิเคราะห์</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">ดัชนีความน่าเชื่อถือ:</span>
                <span className={`font-bold text-xl ${result.isFake ? 'text-red-500' : 'text-green-500'}`}>
                  {result.score}% ({result.isFake ? 'มีแนวโน้มเป็นข่าวปลอม' : 'น่าเชื่อถือ'})
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${result.isFake ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${result.score}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* คอลัมน์ขวา */}
        <div className="md:col-span-5 space-y-6">
          
          {/* 🌟 ส่วนแสดงกราฟสถิติ */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📊 สถิติความแม่นยำของโมเดล AI
            </h3>
            {metrics.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                กำลังโหลดข้อมูลกราฟ...
              </div>
            ) : (
              <div className="h-56 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="model_name" type="category" width={140} tick={{ fontSize: 12, fill: '#4b5563' }} />
                    <Tooltip formatter={(value) => [`${value}%`, 'ความแม่นยำ']} />
                    <Bar dataKey="accuracy_percentage" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ประวัติการตรวจสอบล่าสุด */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🕒 ประวัติการตรวจสอบล่าสุด
            </h3>

            {history.length === 0 ? (
              <p className="text-gray-400 text-center py-4">ยังไม่มีประวัติการตรวจสอบ</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex flex-col gap-1">
                    <p className="text-sm text-gray-700 truncate">{item.content}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {new Date(item.created_at).toLocaleTimeString('th-TH')}
                      </span>
                      <span className={`font-semibold ${item.is_fake ? 'text-red-500' : 'text-green-500'}`}>
                        {item.is_fake ? 'ข่าวปลอม' : 'ข่าวจริง'} ({item.credibility_score}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;