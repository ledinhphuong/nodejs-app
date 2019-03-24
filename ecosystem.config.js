module.exports = {
  apps: [{
    name: 'nodejs-app',
    script: 'build/index.js',
    instances: 1,
    watch: true,
    autorestart: false,
    max_memory_restart: '500M',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}
