import axios from 'axios';
import PropTypes from 'prop-types';
import React, { createContext, useContext } from 'react';
import xmlParser from 'xml-js';
import { useFormContent } from '../hooks/useForm';
import { getStore, removeStore, setStore } from '../utils/store';

const {
    REACT_APP_NEXTLAB_TOKEN,
    REACT_APP_STORE_PATH,
    REACT_APP_USER_SERVICE,
  } = process.env,
  authContext = createContext();

export function ProvideAuth({ children }) {
  const auth = useProvideAuth();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}
ProvideAuth.propTypes = {
  children: PropTypes.element.isRequired,
};

export const useAuth = () => {
  return useContext(authContext);
};

function useProvideAuth() {
  const store = getStore(REACT_APP_STORE_PATH),
    { content: user, setContent: setUser } = useFormContent(
      store ? store : null,
    );

  const signIn = async (content) => {
    const { username, password, remember } = content,
      data = new URLSearchParams();

    data.append('token', REACT_APP_NEXTLAB_TOKEN);
    data.append('tipo', 'OR');
    data.append('aplicacion', 'WEB');
    data.append('usuario', username);
    data.append('clave', password);

    const response = await axios({
      method: 'post',
      url: `${REACT_APP_USER_SERVICE}/usuario_valido`,
      data,
    });

    const parsedInfo = xmlParser.xml2js(response.data, {
      compact: true,
      textKey: 'value',
    });

    const {
        Usuario: {
          EsValido: { value: isValid },
        },
      } = parsedInfo,
      usr = { username, isValid: isValid === 'true' };

    setUser(usr);
    setStore(REACT_APP_STORE_PATH, usr, remember);

    return usr.isValid;
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
