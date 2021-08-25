import {
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

export const ListHoc = (props) => {
  const { items, setItems } = props;

  const handleToggle = (index) => {
    const newItems = [...items];

    newItems.splice(index, 1, {
      ...items[index],
      checked: !items[index].checked,
    });

    setItems(newItems);
  };

  return (
    <Box clone width="100%">
      <List dense disablePadding>
        {items.map(({ CodigoAnalisis, Descripcion, checked }, index) => (
          <ListItem
            key={CodigoAnalisis}
            divider
            button
            onClick={() => handleToggle(index)}
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                color="primary"
                checked={checked}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText primary={CodigoAnalisis} secondary={Descripcion} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
ListHoc.propTypes = {
  items: PropTypes.array.isRequired,
  setItems: PropTypes.func,
};
