import axios from 'axios';

// IP local detectado para que o celular no Wi-Fi consiga acessar o computador
const API_BASE_URL = 'http://192.168.3.5:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export { api };
