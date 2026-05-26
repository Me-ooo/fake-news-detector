import React from 'react'; // 👈 เพิ่มบรรทัดนี้เพื่อให้ Vitest รู้จัก React พื้นฐาน
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import '@testing-library/jest-dom';
import App from '../App';

// 👈 เพิ่มบล็อกนี้เพื่อจำลองหน้าจอให้ไลบรารีกราฟ (Recharts) ไม่พังตอนเทสต์
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

test('ตรวจสอบว่าหัวข้อ App แสดงผลถูกต้อง', () => {
  render(<App />);
  const linkElement = screen.getByText(/FakeNewsDetector/i);
  expect(linkElement).toBeInTheDocument();
});