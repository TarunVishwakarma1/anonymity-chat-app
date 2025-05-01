module.exports = {
    apps: [{
      name: "chat-app-tarun",
      script: "bun",
      args: "start",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3005
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3005
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3005
      }
    }]
  };