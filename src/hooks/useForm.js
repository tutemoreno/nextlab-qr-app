import { useState } from 'react';

export const useFormState = (initialState) => {
  const [content, setContent] = useState(initialState);

  const setValue = (key, value) => {
    setContent((prevState) => ({ ...prevState, [key]: value }));
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    setContent((prevState) => ({
      ...prevState,
      [name]: type != 'checkbox' ? value.toUpperCase() : checked,
    }));
  };

  return {
    content,
    setContent,
    setValue,
    onChange,
  };
};
