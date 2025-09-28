module.exports = {
  apps: [
    {
      name: 'takken-boost',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=takken-boost-db --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_restarts: 3,
      restart_delay: 3000
    }
  ]
}