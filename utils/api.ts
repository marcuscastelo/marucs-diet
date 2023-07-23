import axios from "axios";

export const DOMAIN = 'http://marucsdiet.ddns.net';
export const INTERNAL_API_URL = `${DOMAIN}:3000/api/`;

export const INTERNAL_API = axios.create({
    baseURL: INTERNAL_API_URL,
});
