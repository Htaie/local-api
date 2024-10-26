import { config } from "dotenv";
import express from "express";
import client from "./qBitConfig.js";
import cors from 'cors';

config();
const app = express();
const port = process.env.PORT || 3000; 
app.use(cors());
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig.js';

async function addMagnetLink(magnetLink) {
    return await client.addMagnet(magnetLink, {});
}

async function fetchAllData() {
    return await client.getAllData();
}

async function fetchTorrentFiles(hash) {
    return await client.torrentFiles(hash);
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /addMagnetLink:
 *   post:
 *     summary: Добавление magnet-ссылки
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               link:
 *                 type: string
 *                 description: Magnet-ссылка для добавления
 *     responses:
 *       200:
 *         description: Magnet link added successfully
 *       400:
 *         description: Magnet link is required
 *       500:
 *         description: Error adding magnet link
 */
app.post('/addMagnetLink', async (req, res) => {
    const { link: magnetLink } = req.body;

    if (!magnetLink) {
        return res.status(400).json({ error: "Magnet link is required." });
    }

    try {
        await addMagnetLink(magnetLink);
        res.json({ message: "Magnet link added successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error adding magnet link." });
    }
});
/**
 * @swagger
 * /getTorrentFiles/{hash}:
 *   get:
 *     summary: Получение файлов торрента
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Hash торрента
 *     responses:
 *       200:
 *         description: Файлы торрента
 *       400:
 *         description: Hash is required
 *       500:
 *         description: Error fetching torrent files
 */
app.get('/getTorrentFiles/:hash', async (req, res) => {
    const { hash } = req.params;
    if (!hash) {
        return res.status(400).json({ error: "hash is required." });
    }
    try {
        const torrentFiles = await fetchTorrentFiles(hash);
        res.json(torrentFiles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching torrent files." });
    }
})
/**
 * @swagger
 * /getAllData:
 *   get:
 *     summary: Получить все данные о торрентах
 *     responses:
 *       200:
 *         description: Успешное получение данных
 *       500:
 *         description: Ошибка получения данных
 */
app.get('/getAllData', async (req, res) => {
    try {
        const data = await fetchAllData();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching data." });
    }
});

/**
 * @swagger
 * /getCompleted:
 *   get:
 *     summary: Получить список завершенных торрентов
 *     responses:
 *       200:
 *         description: Список завершенных торрентов
 *       500:
 *         description: Ошибка получения завершенных торрентов
 */
app.get('/getCompleted', async (req, res) => {
    try {
        const data = await fetchAllData();
        const completedTorrents = data.torrents.filter(torrent => torrent.progress === 1);
        res.json(completedTorrents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching completed torrents." });
    }
});
/**
 * @swagger
 * /getNotCompleted:
 *   get:
 *     summary: Получить список незавершенных торрентов
 *     responses:
 *       200:
 *         description: Список незавершенных торрентов
 *       500:
 *         description: Ошибка получения незавершенных торрентов
 */
app.get('/getNotCompleted', async (req, res) => {
    try {
        const data = await fetchAllData();
        const notCompletedTorrents = data.torrents.filter(torrent => torrent.progress !== 1);
        res.json(notCompletedTorrents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching not completed torrents." });
    }
});

app.listen(port, () => {
    console.log(`API is running on port ${port}`);
});
