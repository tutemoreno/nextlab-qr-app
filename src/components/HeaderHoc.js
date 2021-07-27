import { Avatar, Box, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

const avatarSize = 64;

export default function HeaderHoc(props) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" my={2}>
      <Box
        clone
        width={avatarSize}
        height={avatarSize}
        mb={2}
        bgcolor="secondary.main"
      >
        <Avatar>{props.icon}</Avatar>
      </Box>
      <Typography component="h1" variant="h5">
        {props.title}
      </Typography>
    </Box>
  );
}
HeaderHoc.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.element,
};
