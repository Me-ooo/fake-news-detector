const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
// ใช้ process.env.PORT เพื่อให้ Render กำหนด Port เองได้ (มาตรฐาน Cloud)
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/scan', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'กรุณาส่งข้อความมาด้วยครับ' });

    // ใช้ python3 สำหรับ Linux Server (Render)
    const pythonProcess = spawn('python3', ['predict.py', text]);
    
    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error(`🐍 Python Log/Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`❌ Python Process exited with code ${code}`);
            console.error(`❌ Error Detail: ${errorData}`);
            return res.status(500).json({ 
                error: 'กระบวนการวิเคราะห์ล้มเหลว',
                details: errorData 
            });
        }

        try {
            // ตรวจสอบว่ามีข้อมูลส่งกลับมาไหม
            if (!outputData.trim()) {
                throw new Error('Python did not return any output');
            }
            
            const result = JSON.parse(outputData.trim());
            res.json(result);
        } catch (error) {
            console.error('⚠️ JSON Parse Error!');
            console.error('Raw Output from Python:', outputData);
            res.status(500).json({ 
                error: 'รูปแบบข้อมูลผิดพลาด',
                debug: outputData // ส่งค่าดิบกลับไปดูที่หน้าบ้านเพื่อเช็ค Error
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend Server is running on port ${PORT}`);
});