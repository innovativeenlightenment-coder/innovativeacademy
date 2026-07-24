/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
  domains: ['res.cloudinary.com','images.unsplash.com',
      'i.ytimg.com',
      'source.unsplash.com']
},

  output: "standalone",
};

module.exports = nextConfig;
