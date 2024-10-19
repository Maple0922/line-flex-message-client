const loadMode = () => {
  const MODE = import.meta.env.MODE;
  const IS_DEV = import.meta.env.DEV;
  const IS_PROD = import.meta.env.PROD;

  return {
    MODE,
    IS_DEV,
    IS_PROD,
  };
};

const loadApiUrl = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  return {
    API_URL,
  };
};

export const useEnv = () => {
  return {
    ...loadMode(),
    ...loadApiUrl(),
  };
};
