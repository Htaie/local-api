import { config } from "dotenv";
import express from "express";
import client from "./qBitConfig.js";
config();
const app = express();
const port = process.env.PORT || 3000; 
app.use(express.urlencoded({ extended: true }));

async function addMagnetLink(magnetLink) {
    return await client.addMagnet(magnetLink, {});
}

async function fetchAllData() {
    return await client.getAllData();
}

async function fetchTorrentFiles(hash) {
    return await client.torrentFiles(hash);
}


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

app.get('/getAllData', async (req, res) => {
    try {
        const data = await fetchAllData();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching data." });
    }
});

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
