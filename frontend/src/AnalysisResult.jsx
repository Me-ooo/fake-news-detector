// ไฟล์: frontend/src/components/AnalysisResult.jsx
import React, { useState } from 'react';

export default function AnalysisResult() {
  const [isLoading, setIsLoading] = useState(false);
  const [accuracyData, setAccuracyData] = useState(null);

  const handleAnalyze = () => {
    setIsLoading(true);
    setAccuracyData(null);

    // จำลองเวลาเรียก API 2 วินาที
    setTimeout(() => {
      setAccuracyData(4); // สมมติว่าได้ค่า 4% 
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ปุ่มวิเคราะห์ */}
      <button 
        onClick={handleAnalyze}
        className="px-4 py-3 text-white font-semibold rounded-lg w-full transition-colors hover:opacity-90"
        style={{ backgroundColor: '#0ABAB5' }} 
      >
        วิเคราะห์ความน่าเชื่อถือ
      </button>

      {/* กล่องผลการวิเคราะห์ */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">ผลการวิเคราะห์</h3>

        {isLoading ? (
          <div className="animate-pulse">
            <div className="flex justify-between mb-3">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="h-3 bg-gray-300 rounded-full w-full"></div>
            </div>
          </div>
        ) : accuracyData !== null ? (
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">ดัชนีความน่าเชื่อถือ:</span>
              <span className={`text-sm font-bold ${accuracyData < 50 ? 'text-red-500' : 'text-green-500'}`}>
                {accuracyData}% {accuracyData < 50 ? '(มีแนวโน้มเป็นข่าวปลอม)' : '(ข่าวจริง)'}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${accuracyData}%`, backgroundColor: '#0ABAB5' }} 
              ></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-sm">กรุณากดวิเคราะห์ความน่าเชื่อถือเพื่อดูผลลัพธ์</p>
          </div>
        )}
      </div>
    </div>
  );
}