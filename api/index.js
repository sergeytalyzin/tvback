console.log("Server file loaded");
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/take', async (req, res) => {
    const url = req.query.url; // URL передается через query параметр
    if (url) {
        try {
            const response = await axios.get(url, {
                responseType: 'stream', // Поток данных для передачи клиенту
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            });

            // Устанавливаем заголовки, чтобы видео правильно обрабатывалось
            res.set({
                'Content-Type': response.headers['content-type'],
                'Content-Disposition': response.headers['content-disposition'] || '',
                'Cache-Control': response.headers['cache-control'] || '',
            });

            // Прокидываем поток данных
            response.data.pipe(res);
        } catch (error) {
            console.error('Error in /take route:', error.message);
            res.status(500).json({ error: 'Failed to fetch the stream' });
        }
    } else {
        res.status(400).json({ error: 'URL query parameter is required' });
    }
});
// Новый маршрут для проксирования
app.get('/proxy', async (req, res) => {
    console.log("Route /proxy called");
    const url = req.query.url
    if (url) {
        try {
            const response = await axios.get(url, {
                responseType: "stream", // Загружаем поток данных
                headers: {
                    // Добавляем User-Agent, чтобы имитировать браузер
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
            });

            // Передаём заголовки и поток данных клиенту
            res.set({
                "Content-Type": response.headers["content-type"],
                "Content-Disposition": response.headers["content-disposition"] || "",
                "Cache-Control": response.headers["cache-control"] || "",
                "Access-Control-Allow-Origin": "*",
                Referer: "https://reflextv.ru/",
            });

            response.data.pipe(res); // Прокидываем поток
        } catch (error) {
            console.error('Error in proxy route:', error.message);
            res.status(500).json({ error: "Failed to fetch the URL" });
        }
    } else {
        res.status(400).json({ error: "URL query parameter is required" });
    }
});


export default app;
