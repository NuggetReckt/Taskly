import axios, {AxiosInstance} from "axios";
import {API_BASEURL, API_SECRET} from "@/app/secrets";

export const client: AxiosInstance = axios.create({
    baseURL: API_BASEURL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_SECRET
    }
});
