import { useState } from 'react';

export function useFormContent(initialState) {
  const [content, setContent] = useState(initialState);

  const setValue = (key, value) => {
    setContent((prevState) => ({ ...prevState, [key]: value }));
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    setContent((prevState) => ({
      ...prevState,
      [name]: type != 'checkbox' ? value : checked,
    }));
  };

  return {
    content,
    setContent,
    setValue,
    onChange,
  };
}
