const path = require("path");

module.exports = {
    apps: [
        {
            name: "dc",
            script: "pnpm",
            args: "prod",
            cwd: path.join(__dirname, ".."),
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            max_memory_restart: "500M",
        },
    ],
};
