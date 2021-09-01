import { useCallback, useState } from 'react';

export function useFormState(initialState) {
  const [content, setContent] = useState(initialState);

  const setValue = useCallback((key, value) => {
    setContent((prevState) => ({ ...prevState, [key]: value }));
  }, []);

  return {
    content,
    setContent,
    setValue,
  };
}

export function formReducer(state, action) {
  switch (action.type) {
    case 'change': {
      const { type, value, checked, name } = action.target;

      switch (type) {
        case 'text':
          return { ...state, [name]: value.toUpperCase() };
        case 'checkbox':
          return { ...state, [name]: checked };
        case 'date':
          return { ...state, [name]: value };
      }
      break;
    }
    case 'setContent': {
      return { ...state, ...action.value };
    }
    default:
      console.log(action);
      return state;
  }
}
