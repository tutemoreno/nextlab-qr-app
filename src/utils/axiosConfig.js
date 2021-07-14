import axios from 'axios';

// setStore('nextlab-qr', { token: 'nlsvctok' });

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
// axios.defaults.headers.post['Content-Type'] =
//   'application/x-www-form-urlencoded';

/* axios.interceptors.request.use(
  (config) => {
    console.log('[CONFIG]', config);
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
); */

// axios.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response.status == 401) removeStore('nextlab-qr');
//     // router.push('/login');
//     Promise.reject(error);
//   },
// );
