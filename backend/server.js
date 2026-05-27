const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/scan', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'กรุณาส่งข้อความมาด้วยครับ' });

    const pythonProcess = spawn('python3', ['predict.py', text]);
    let outputData = '';

    pythonProcess.stdout.on('data', (data) => { outputData += data.toString(); });
    pythonProcess.stderr.on('data', (data) => { console.error(`Python Error: ${data}`); });

    pythonProcess.on('close', (code) => {
        if (code !== 0) return res.status(500).json({ error: 'กระบวนการวิเคราะห์ล้มเหลว' });
        try {
            res.json(JSON.parse(outputData));
        } catch (error) {
            res.status(500).json({ error: 'รูปแบบข้อมูลผิดพลาด' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend Server รันอยู่ที่ http://localhost:${PORT}`);
});