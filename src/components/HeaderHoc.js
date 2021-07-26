import { Avatar, Box, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

export default function HeaderHoc(props) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" my={3}>
      <Box clone width={64} height={64} mb={2} bgcolor="secondary.main">
        <Avatar>{props.avatarChildren}</Avatar>
      </Box>
      <Typography component="h1" variant="h5">
        {props.title}
      </Typography>
    </Box>
  );
}
HeaderHoc.propTypes = {
  title: PropTypes.string.isRequired,
  avatarChildren: PropTypes.element,
};
