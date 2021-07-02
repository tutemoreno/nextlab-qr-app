import axios from 'axios';
import { setStore, getStore, removeStore } from './store';

setStore('nextlab-qr', { token: 'nlsvctok' });

axios.defaults.baseURL = 'http://192.168.10.172:2005/Paciente_WS.asmx';
axios.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded';

axios.interceptors.request.use(
  (config) => {
    const store = getStore('nextlab-qr');

    if (store) {
      config.data = {
        ...config.data,
        token: store.token,
        codigo: 0,
      };
    }

    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status == 401) removeStore('nextlab-qr');
    // router.push('/login');
    Promise.reject(error);
  },
);
