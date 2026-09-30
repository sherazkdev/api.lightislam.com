const path = require('path');

/** Run from repo root: pm2 start deploy/ecosystem.config.cjs */
const appRoot = path.resolve(__dirname, '..');

module.exports = {
  apps: [
    {
      name: 'light-islam-reminder-api',
      cwd: appRoot,
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '3022',
      },
      error_file: path.join(appRoot, 'logs', 'api-error.log'),
      out_file: path.join(appRoot, 'logs', 'api-out.log'),
      merge_logs: true,
      time: true,
    },
    {
      name: 'light-islam-reminder-worker',
      cwd: appRoot,
      script: 'dist/worker.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: path.join(appRoot, 'logs', 'worker-error.log'),
      out_file: path.join(appRoot, 'logs', 'worker-out.log'),
      merge_logs: true,
      time: true,
    },
  ],
};
