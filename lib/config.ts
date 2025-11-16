interface Config {
  apiUrl: string;
}

export const getConfig = (): Config => {
  if (typeof window !== 'undefined') {
    return {
      apiUrl:
        (window as Record<string, any>).__ENV__?.NEXT_PUBLIC_API_URL ||
        'http://localhost:8080/api',
    };
  }
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  };
};
