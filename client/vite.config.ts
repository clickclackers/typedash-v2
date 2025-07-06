import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '127.0.0.1',
    open: true,
  },
  plugins: [svgr(), react()],
});
