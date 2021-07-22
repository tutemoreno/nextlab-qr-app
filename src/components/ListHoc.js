import { List, ListItem, ListItemText } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

export default function ListHoc(props) {
  const { items } = props;
  return (
    <List
      style={{
        paddingTop: '0px',
      }}
    >
      {items.map((item) => (
        <ListItem
          divider
          key={item.id}
          style={{
            paddingTop: '0px',
          }}
        >
          <ListItemText primary={item.id} secondary={item.Descripcion} />
        </ListItem>
      ))}
    </List>
  );
}
ListHoc.propTypes = {
  items: PropTypes.array.isRequired,
};
