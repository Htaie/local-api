import { config } from "dotenv";

import { QBittorrent } from "@ctrl/qbittorrent";

config();


const { QBIT_ADDRESS, USERNAME, PASSWORD } = process.env;

const client = new QBittorrent({
  baseUrl: QBIT_ADDRESS,
  username: USERNAME,
  password: PASSWORD,
});

export default client;
