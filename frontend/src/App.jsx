import React, { useState, useEffect } from 'react'; 
import { supabase } from './lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import UserProfileModal from './components/UserProfileModal'; // 🌟 Import Component

function App() {
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState([]); 

  // --- States สำหรับ Requirement ใหม่ ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState('normal'); 
  
  // 🌟 States สำหรับ User & Modal
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const tiffanyBlue = '#0ABAB5';

  // สี Dynamic สำหรับกราฟและผลลัพธ์ (รองรับคนตาบอดสี)
  const getStatusColors = () => {
    switch(colorBlindMode) {
      case 'deuteranomaly': return { fake: '#EAB308', real: '#3B82F6' }; // เหลือง / น้ำเงิน
      case 'tritanopia': return { fake: '#EF4444', real: '#14B8A6' }; // แดง / เขียวอมฟ้า
      default: return { fake: '#EF4444', real: '#22C55E' }; // แดง / เขียว (ปกติ)
    }
  };

  const statusColors = getStatusColors();

  // 🌟 ฟังก์ชันเช็คสถานะการล็อกอิน
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('news_scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setHistory(data);
    if (error) console.error('ดึงประวัติไม่สำเร็จ:', error);
  };

  const fetchMetrics = async () => {
    const { data, error } = await supabase
      .from('model_metrics')
      .select('*')
      .order('accuracy_percentage', { ascending: false });
    if (data) setMetrics(data);
    if (error) console.error('ดึงสถิติโมเดลไม่สำเร็จ:', error);
  };

  useEffect(() => {
    checkUser(); // ดึงข้อมูล User ตอนเปิดเว็บ
    fetchHistory();
    fetchMetrics(); 
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
      .insert([{ content: inputText, credibility_score: aiScore, is_fake: aiIsFake }]);

    if (error) {
      console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error.message);
    } else {
      setResult({ score: aiScore, isFake: aiIsFake });
      fetchHistory(); 
    }
    setIsScanning(false);
  };

  // Theme Classes
  const bgMain = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textMain = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const bgCard = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const inputBg = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgMain} ${textMain} p-8`}>
      
      {/* 🌟 NavBar พร้อมเมนูตั้งค่า */}
      <nav className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold" style={{ color: tiffanyBlue }}>FakeNewsDetector</h1>
        
        <div className="flex items-center gap-4">
          {/* เมนูคนตาบอดสี */}
          <select 
            value={colorBlindMode}
            onChange={(e) => setColorBlindMode(e.target.value)}
            className={`text-sm rounded-lg p-2 ${inputBg} outline-none cursor-pointer`}
          >
            <option value="normal">👁️ โหมดสีปกติ</option>
            <option value="deuteranomaly">👁️ บอดสีแดง-เขียว</option>
            <option value="tritanopia">👁️ บอดสีน้ำเงิน-เหลือง</option>
          </select>

          {/* ปุ่มสลับธีม */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full w-10 h-10 flex items-center justify-center ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-600'}`}
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>

          {/* 🌟 ปุ่ม User Profile / Login (เปิด Modal) */}
          <button 
            onClick={() => setIsProfileOpen(true)} 
            className="px-4 py-2 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90 flex items-center gap-2 shadow-sm"
            style={{ backgroundColor: tiffanyBlue }}
          >
            {user ? (
              <>
                <img 
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=0ABAB5&color=fff`} 
                  alt="Profile" 
                  className="w-6 h-6 rounded-full border border-white object-cover bg-white" 
                />
                โปรไฟล์
              </>
            ) : 'เข้าสู่ระบบ'}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* คอลัมน์ซ้าย (ตรวจสอบข้อความ) */}
        <div className="md:col-span-7 space-y-6">
          <div className={`${bgCard} p-6 rounded-xl shadow-sm border`}>
            <h2 className="text-lg font-semibold mb-4">ตรวจสอบข้อความ / ข่าวสาร</h2>
            <textarea
              className={`w-full h-40 p-4 rounded-lg focus:ring-2 outline-none resize-none mb-4 ${inputBg}`}
              style={{ '--tw-ring-color': tiffanyBlue }}
              placeholder="วางเนื้อหาข่าว หรือข้อความที่คุณสงสัยที่นี่..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            ></textarea>

            <button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-opacity hover:opacity-90 flex justify-center items-center"
              style={{ backgroundColor: tiffanyBlue }}
            >
              {isScanning ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  กำลังวิเคราะห์ข้อมูล...
                </span>
              ) : 'วิเคราะห์ความน่าเชื่อถือ'}
            </button>
          </div>

          {result && (
            <div className={`${bgCard} p-6 rounded-xl shadow-sm border animate-fade-in-up`}>
              <h3 className="text-lg font-semibold mb-2">ผลการวิเคราะห์</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="opacity-80">ดัชนีความน่าเชื่อถือ:</span>
                <span className="font-bold text-xl" style={{ color: result.isFake ? statusColors.fake : statusColors.real }}>
                  {result.score}% ({result.isFake ? 'มีแนวโน้มเป็นข่าวปลอม' : 'น่าเชื่อถือ'})
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${result.score}%`, backgroundColor: result.isFake ? statusColors.fake : statusColors.real }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* คอลัมน์ขวา */}
        <div className="md:col-span-5 space-y-6">
          
          {/* สถิติความแม่นยำของโมเดล AI */}
          <div className={`${bgCard} p-6 rounded-xl shadow-sm border h-80 flex flex-col`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📊 สถิติความแม่นยำของโมเดล AI
            </h3>
            
            {metrics.length === 0 ? (
              <div className="flex-1 w-full animate-pulse flex flex-col justify-end gap-3 mt-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded" style={{ width: `${Math.random() * 50 + 40}%` }}></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis type="number" domain={[0, 100]} stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis dataKey="model_name" type="category" width={100} tick={{ fontSize: 12, fill: isDarkMode ? '#d1d5db' : '#4b5563' }} />
                    <Tooltip formatter={(value) => [`${value}%`, 'ความแม่นยำ']} contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#e5e7eb', color: isDarkMode ? '#fff' : '#000' }} />
                    <Bar dataKey="accuracy_percentage" fill={tiffanyBlue} radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ประวัติการตรวจสอบล่าสุด */}
          <div className={`${bgCard} p-6 rounded-xl shadow-sm border`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🕒 ประวัติการตรวจสอบล่าสุด
            </h3>

            {history.length === 0 ? (
              <p className="opacity-50 text-center py-4">ยังไม่มีประวัติการตรวจสอบ</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className={`p-3 border rounded-lg flex flex-col gap-1 ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                    <p className="text-sm truncate">{item.content}</p>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="opacity-60">
                        {new Date(item.created_at).toLocaleTimeString('th-TH')}
                      </span>
                      <span className="font-semibold" style={{ color: item.is_fake ? statusColors.fake : statusColors.real }}>
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

      {/* 🌟 แสดง Modal เมื่อ isProfileOpen เป็น true */}
      <UserProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
        onUserUpdate={checkUser} 
        isDarkMode={isDarkMode} 
      />
    </div>
  );
}

export default App;