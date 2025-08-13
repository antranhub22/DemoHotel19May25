module.exports = {
  apps: [
    {
      name: "demo-hotel-server",
      script: "apps/server/index.ts",
      interpreter: "node",
      node_args: [
        "--require",
        "ts-node/register",
        "--max-old-space-size=768",
        "--expose-gc",
      ],
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      autorestart: true,
      max_memory_restart: "700M",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "production",
        PORT: "10000",
      },
      env_production: {
        NODE_ENV: "production",
      },
      exp_backoff_restart_delay: 200,
      kill_timeout: 5000,
      wait_ready: false,
    },
  ],
};
