import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const serverURL = process.env.SERVER_URL;
console.log("ServerURL (backend):", serverURL);

const axiosProvider = axios.create({
    baseURL: serverURL,
    withCredentials: true,
});

export default axiosProvider;
