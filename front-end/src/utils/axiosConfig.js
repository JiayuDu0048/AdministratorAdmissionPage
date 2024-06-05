import axios from 'axios';

const serverURL = import.meta.env.VITE_SERVER_URL; // With Vite, and some other build tools, there's often a requirement for environment variables to be prefixed with VITE_ to be exposed to your project. 
console.log("ServerURL:", serverURL);

const axiosProvider = axios.create({
    baseURL: serverURL,
    withCredentials: true,
});

export default axiosProvider;