import { Box, List, ListItem, ListItemText } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

export default function ListHoc(props) {
  const { items } = props;
  return (
    <Box clone width="100%">
      <List dense disablePadding>
        {items.map((item) => (
          <ListItem divider key={item.id}>
            <ListItemText primary={item.id} secondary={item.Descripcion} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
ListHoc.propTypes = {
  items: PropTypes.array.isRequired,
};
