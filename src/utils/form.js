import { useState } from 'react';

export function useFormInput(initialState) {
  const [value, setValue] = useState(initialState);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  return {
    value,
    setValue,
    onChange,
  };
}

export function useFormContent(initialState) {
  const [content, setContent] = useState(initialState);

  const setValue = (key, value) => {
    setContent((prevState) => ({ ...prevState, [key]: value }));
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    setContent((prevState) => ({ ...prevState, [name]: value }));
  };

  return {
    content,
    setContent,
    setValue,
    onChange,
  };
}
