import { Avatar, Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles(({ palette, spacing }) => ({
  avatar: {
    backgroundColor: palette.secondary[palette.type],
  },
  small: {
    width: spacing(4),
    height: spacing(4),
  },
  large: {
    width: spacing(8),
    height: spacing(8),
  },
}));

export const HeaderHoc = (props) => {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" py={2}>
      <Box clone mb={2}>
        <Avatar className={[classes.avatar, classes.large]}>
          {props.icon}
        </Avatar>
      </Box>
      <Typography component="h1" variant="h5">
        {props.title}
      </Typography>
    </Box>
  );
};
HeaderHoc.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.element,
};
