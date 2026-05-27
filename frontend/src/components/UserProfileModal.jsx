// ไฟล์: frontend/src/components/UserProfileModal.jsx
import React, { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';

export default function UserProfileModal({ isOpen, onClose, user, onUserUpdate, isDarkMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);

  // States สำหรับ Crop รูป
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const tiffanyBlue = '#0ABAB5';
  const bgCard = isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-100';
  const inputBg = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800';

  if (!isOpen) return null;

  // --- จัดการ Login & Register ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('สมัครสมาชิกสำเร็จ! กรุณาล็อกอิน');
        setIsLoginMode(true);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  // --- จัดการอัปโหลดและ Crop รูป ---
  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageSrc(reader.result);
      };
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveProfilePic = async () => {
    try {
      setLoading(true);
      // 1. ตัดรูปจาก Canvas
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      // 2. ตั้งชื่อไฟล์และอัปโหลดขึ้น Supabase Storage (Bucket: avatars)
      const fileName = `${user.id}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedImageBlob);

      if (uploadError) throw uploadError;

      // 3. ดึง URL รูปที่อัปโหลดเสร็จ
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // 4. อัปเดตข้อมูลผู้ใช้
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;
      
      onUserUpdate(); // โหลดข้อมูลผู้ใช้ใหม่
      setImageSrc(null); // ปิดหน้าต่าง Crop
      alert('อัปเดตรูปโปรไฟล์สำเร็จ!');

    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className={`w-full max-w-md p-6 rounded-2xl shadow-xl relative ${bgCard}`}>
        
        {/* ปุ่มปิด */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          ✕
        </button>

        {!user ? (
          /* --- หน้า Login / Register --- */
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: tiffanyBlue }}>
              {isLoginMode ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="email"
                placeholder="อีเมล"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputBg}`}
                style={{ '--tw-ring-color': tiffanyBlue }}
              />
              <input
                type="password"
                placeholder="รหัสผ่าน"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputBg}`}
                style={{ '--tw-ring-color': tiffanyBlue }}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold py-3 rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: tiffanyBlue }}
              >
                {loading ? 'กำลังดำเนินการ...' : (isLoginMode ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก')}
              </button>
            </form>
            <p className="text-center mt-4 text-sm">
              {isLoginMode ? 'ยังไม่มีบัญชี? ' : 'มีบัญชีอยู่แล้ว? '}
              <button onClick={() => setIsLoginMode(!isLoginMode)} style={{ color: tiffanyBlue }} className="font-semibold underline">
                {isLoginMode ? 'สมัครเลย' : 'ล็อกอิน'}
              </button>
            </p>
          </div>

        ) : (
          
          /* --- หน้า User Profile (เมื่อล็อกอินแล้ว) --- */
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: tiffanyBlue }}>โปรไฟล์ของคุณ</h2>
            
            {/* โหมดแก้ไขรูปภาพ */}
            {imageSrc ? (
              <div className="flex flex-col items-center">
                <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden mb-4">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} // บังคับสัดส่วนเป็น 1:1 (จัตุรัส/วงกลม)
                    cropShape="round"
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full mb-4"
                />
                <div className="flex gap-2 w-full">
                  <button onClick={() => setImageSrc(null)} className="flex-1 py-2 bg-gray-300 text-gray-800 rounded-lg">ยกเลิก</button>
                  <button onClick={handleSaveProfilePic} disabled={loading} className="flex-1 py-2 text-white rounded-lg" style={{ backgroundColor: tiffanyBlue }}>
                    {loading ? 'กำลังบันทึก...' : 'บันทึกรูปภาพ'}
                  </button>
                </div>
              </div>
            ) : (
              /* แสดงโปรไฟล์ปกติ */
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer mb-4">
                  <img 
                    src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=0ABAB5&color=fff`} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full border-4 object-cover" 
                    style={{ borderColor: tiffanyBlue }} 
                  />
                  {/* ปุ่มซ้อนทับเพื่อเปลี่ยนรูป */}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-xs">เปลี่ยนรูป</span>
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </label>
                </div>
                <p className="font-semibold mb-1 truncate w-full text-center">{user.email}</p>
                
                <button 
                  onClick={handleLogout} 
                  className="mt-6 w-full py-2 bg-red-50 text-red-500 border border-red-200 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}