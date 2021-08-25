import axios from 'axios';
import PropTypes from 'prop-types';
import qs from 'qs';
import React, { createContext, useContext, useState } from 'react';
import xml2js from 'xml2js';
import { getStore, removeStore, setStore } from '../utils/store';

const xml2jsParser = new xml2js.Parser({
  explicitArray: false,
  charkey: 'value',
});

const {
    REACT_APP_NEXTLAB_TOKEN,
    REACT_APP_STORE_PATH,
    REACT_APP_USER_SERVICE,
  } = process.env,
  AuthContext = createContext();

export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  //asda

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
ProvideAuth.propTypes = {
  children: PropTypes.element.isRequired,
};

export const useAuth = () => {
  return useContext(AuthContext);
};

function useProvideAuth() {
  const store = getStore(REACT_APP_STORE_PATH);
  const [user, setUser] = useState(store ? store : null);

  const signIn = async (content) => {
    const { username, password, remember } = content;
    let isValid = false;

    const response = await axios({
      method: 'post',
      url: `${REACT_APP_USER_SERVICE}/usuario_valido`,
      data: qs.stringify({
        tipo: 'OR',
        aplicacion: 'WEB',
        usuario: username,
        clave: password,
        token: REACT_APP_NEXTLAB_TOKEN,
      }),
    });

    if (response.status == 200) {
      const parsedInfo = await xml2jsParser.parseStringPromise(response.data);

      isValid = parsedInfo.Usuario.EsValido == 'true';
      const codigo = parsedInfo.Usuario.Codigo;

      if (isValid) {
        const usr = { username, isValid, codigo };

        setUser(usr);
        setStore(REACT_APP_STORE_PATH, usr, remember, codigo);
      }
    }

    return isValid;
  };

  const signOut = () => {
    removeStore(REACT_APP_STORE_PATH);
    setUser(null);
  };

  return {
    user,
    signIn,
    signOut,
  };
}
