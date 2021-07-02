export const setStore = (name, content, remember) => {
  if (typeof content !== 'string') content = JSON.stringify(content);

  const storage = remember ? localStorage : sessionStorage;

  return storage.setItem(name, content);
};

export const getStore = (name) => {
  return JSON.parse(sessionStorage.getItem(name) || localStorage.getItem(name));
};

export const removeStore = (name) => {
  localStorage.removeItem(name);
  sessionStorage.removeItem(name);

  return;
};
