import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@material-ui/core';
import ChevronDown from 'mdi-material-ui/ChevronDown';
import PropTypes from 'prop-types';
import React from 'react';

export const AccordionHoc = ({ children, title, ...rest }) => {
  return (
    <Accordion elevation={24} {...rest}>
      <AccordionSummary expandIcon={<ChevronDown />}>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};
AccordionHoc.propTypes = {
  children: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
};
