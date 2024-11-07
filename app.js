import { config } from "dotenv";
import express from "express";
import client from "./qBitConfig.js";
import cors from "cors";

config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig.js";
import axios from "axios";

async function addMagnetLink(magnetLink) {
 return await client.addMagnet(magnetLink, {});
}

async function fetchAllData() {
 return await client.getAllData();
}

async function fetchTorrentFiles(hash) {
 return await client.torrentFiles(hash);
}

const fetchTorrents = async (title) => {
 try {
  const response = await axios.get(
   `http://192.168.1.187:8443/api/search/title/all?query=${title}&page=0&year=0&format=0`
  );
  return response.data; // Возвращаем массив с данными, включая ID для каждого элемента
 } catch (error) {
  console.error("Ошибка при поиске по названию:", error);
  return [];
 }
};

// Функция для получения данных по ID из разных сервисов
const fetchDetailsById = async (id, service) => {
 try {
  const response = await axios.get(
   `http://192.168.1.187:8443/api/search/id/${service}?query=${id}`
  );
  // console.log(response.data[0].Magnet)
  return response.data[0].Magnet;
 } catch (error) {
  console.error(
   `Ошибка при получении данных для ID ${id} от ${service}:`,
   error
  );
  return null;
 }
};

const fetchRutrackerTorrents = async (title, page) => {
 // console.log('aaaaa', title)
 try {
  const torrents = await axios.get(
   `http://192.168.1.187:8443/api/search/title/rutracker?query=${title}&page=${page}&year=0&format=0`
  );
  return torrents.data;
 } catch (error) {
  console.error("Ошибка при обработке данных:", error);
 }
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const getTorrentData = async (id, data) => {
 try {
  const magnetLink = await fetchDetailsById(id, "rutracker");
  await addMagnetLink(magnetLink).then((res) => {
  });
 } catch (err) {}
};
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
app.post("/addMagnetLink", async (req, res) => {
 const { link } = req.query;

 if (!link) {
  return res.status(400).json({ error: "Magnet link is required." });
 }

 try {
  // await addMagnetLink(link);
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
app.post("/addTorrent", async (req, res) => {
 const { id } = req.query;
 const data = req.body;
 console.log(data, "sss");
 getTorrentData(id);
 if (!id) {
  return res.status(400).json({ error: "link is required." });
 }

 try {
  // await getTorrentData(id)
  res.json({ message: "Magnet link added successfully." });
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: "Error adding magnet link." });
 }
});
app.get("/getTorrentFiles/:hash", async (req, res) => {
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
});
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
app.get("/getAllData", async (req, res) => {
 try {
  const data = await fetchAllData();
  res.json(data);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: "Error fetching data." });
 }
});
app.get("/getTorrents", async (req, res) => {
 const { title } = req.query;

 fetchRutrackerTorrents(title).then((data) => {
  console.log(data);
  res.json(data);
 });
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
app.get("/getCompleted", async (req, res) => {
 try {
  const data = await fetchAllData();
  const completedTorrents = data.torrents.filter(
   (torrent) => torrent.progress === 1
  );
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
app.get("/getNotCompleted", async (req, res) => {
 try {
  const data = await fetchAllData();
  const notCompletedTorrents = data.torrents.filter(
   (torrent) => torrent.progress !== 1
  );
  res.json(notCompletedTorrents);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: "Error fetching not completed torrents." });
 }
});

app.listen(port, () => {
 console.log(`API is running on port ${port}`);
});
