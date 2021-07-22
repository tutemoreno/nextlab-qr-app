import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@material-ui/core';
import ChevronDown from 'mdi-material-ui/ChevronDown';
import PropTypes from 'prop-types';
import React from 'react';

export default function AccordionHoc(props) {
  const { children, title, expanded, onChange } = props;
  return (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ChevronDown />}>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails
        style={{
          paddingTop: '0px',
        }}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );
}
AccordionHoc.propTypes = {
  children: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
};
