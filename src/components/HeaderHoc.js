import { Avatar, Box, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

export default function HeaderHoc(props) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={3}>
      <Box clone bgcolor="secondary.main">
        <Avatar>{props.avatarIcon}</Avatar>
      </Box>
      <Typography component="h1" variant="h5">
        {props.title}
      </Typography>
    </Box>
  );
}
HeaderHoc.propTypes = {
  title: PropTypes.string.isRequired,
  avatarIcon: PropTypes.element,
};
