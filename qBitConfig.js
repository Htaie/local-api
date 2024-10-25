import { config } from "dotenv";

import { QBittorrent } from "@ctrl/qbittorrent";

config();


const { QBIT_WEBUI_URL, QBIT_USERNAME, QBIT_PASSWORD } = process.env;

const client = new QBittorrent({
  baseUrl: QBIT_WEBUI_URL,
  username: QBIT_USERNAME,
  password: QBIT_PASSWORD,
});

export default client;
