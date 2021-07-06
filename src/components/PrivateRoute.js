import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import { useAuth } from '../context/auth';

export default function PrivateRoute({ children, ...rest }) {
  const auth = useAuth();

  console.log('[USERRRR]', auth.user);

  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

PrivateRoute.propTypes = {
  children: PropTypes.element.isRequired,
};
