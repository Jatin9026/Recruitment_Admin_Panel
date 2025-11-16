import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    // proxy: {
    //   '/api/v1': {
    //     target: 'http://ecellideatex.theprelofts.in:8080',
    //     changeOrigin: true,
    //     secure: false,
    //     configure: (proxy, _options) => {
    //       proxy.on('error', (err, _req, _res) => {
    //         console.log('Proxy error:', err);
    //       });
    //       proxy.on('proxyReq', (proxyReq, req, _res) => {
    //         console.log('Sending Request to:', req.method, req.url);
    //       });
    //       proxy.on('proxyRes', (proxyRes, req, _res) => {
    //         console.log('Received Response:', proxyRes.statusCode, req.url);
    //       });
    //     }
    //   }
    // }
  }
})
