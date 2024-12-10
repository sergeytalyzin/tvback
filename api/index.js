console.log("Server file loaded");
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/take', async (req, res) => {
    const url = req.query.url; // Получаем URL исходного плейлиста
    if (!url) {
        return res.status(400).json({ error: 'URL query parameter is required' });
    }

    try {
        // Загружаем плейлист
        const response = await axios.get(url, { responseType: 'text' });

        // Определяем базовый URL исходного плейлиста
        const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);

        // Заменяем относительные пути на абсолютные
        const updatedPlaylist = response.data.replace(
            /(^(?!https).+\.m3u8\?token=.*)/gm, // Регулярное выражение для захвата относительных путей с параметром `token`
            `${baseUrl}$1` // Подставляем базовый URL
        );

        // Устанавливаем заголовки и отправляем обновленный плейлист
        res.set('Content-Type', 'application/vnd.apple.mpegurl');
        res.send(updatedPlaylist);
    } catch (error) {
        console.error('Error processing playlist:', error.message);
        res.status(500).json({ error: 'Failed to process playlist' });
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
