import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@material-ui/core';
import ChevronDown from 'mdi-material-ui/ChevronDown';
import PropTypes from 'prop-types';
import React from 'react';

const { REACT_APP_PAPER_ELEVATION } = process.env;

export default function AccordionHoc(props) {
  const { children, title, expanded, onChange } = props;
  return (
    <Accordion elevation={24} expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ChevronDown />}>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}
AccordionHoc.propTypes = {
  children: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
};
