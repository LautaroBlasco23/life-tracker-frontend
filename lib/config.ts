interface Config {
  apiUrl: string;
}

export const getConfig = (): Config => ({
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost/api',
});
