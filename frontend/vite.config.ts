import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'traffic-video-server',
      configureServer(server) {
        // Stream video with full HTTP 206 Partial Content Range support
        server.middlewares.use((req, res, next) => {
          const rawUrl = req.url?.split('?')[0] || '';
          if (
            rawUrl === '/NFD_Junction_annotated_5min.mp4' ||
            rawUrl === '/video/traffic.mp4' ||
            rawUrl === '/video/NFD_Junction_annotated_5min.mp4'
          ) {
            const videoPath = path.resolve(__dirname, 'public', 'NFD_Junction_annotated_5min.mp4');
            if (!fs.existsSync(videoPath)) {
              res.statusCode = 404;
              res.end('Video file not found');
              return;
            }
            const stat = fs.statSync(videoPath);
            const fileSize = stat.size;
            const range = req.headers.range;

            if (range) {
              const parts = range.replace(/bytes=/, '').split('-');
              const start = parseInt(parts[0], 10);
              const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
              const chunksize = end - start + 1;
              const file = fs.createReadStream(videoPath, { start, end });
              const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
              };
              res.writeHead(206, head);
              file.pipe(res);
            } else {
              const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
                'Accept-Ranges': 'bytes',
              };
              res.writeHead(200, head);
              fs.createReadStream(videoPath).pipe(res);
            }
            return;
          }

          // Trajectory CSV streaming
          if (
            rawUrl === '/data/trajectories.csv' ||
            rawUrl === '/trajectories.csv' ||
            rawUrl === '/Smoothed_trajectories_5min.csv'
          ) {
            const csvPath = path.resolve(__dirname, 'public', 'Smoothed_trajectories_5min.csv');
            if (!fs.existsSync(csvPath)) {
              res.statusCode = 404;
              res.end('Trajectory CSV file not found');
              return;
            }
            const stat = fs.statSync(csvPath);
            res.writeHead(200, {
              'Content-Length': stat.size,
              'Content-Type': 'text/csv; charset=utf-8',
            });
            fs.createReadStream(csvPath).pipe(res);
            return;
          }

          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
