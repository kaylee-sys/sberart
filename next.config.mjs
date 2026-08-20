/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        destination: 'http://213.226.124.51//:path*', // Вставь сюда ссылку на рабочий версел или твой домен/сервер
        permanent: false, // false — временный редирект (302), true — постоянный (301)
      },
    ];
  },
};

export default nextConfig;
