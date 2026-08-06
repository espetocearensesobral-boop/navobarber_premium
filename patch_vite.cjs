const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');
code = code.replace(/server:\s*\{[\s\S]*?\},/, `server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR === 'true' ? false : {
      protocol: 'wss',
      clientPort: 443
    },
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },`);
fs.writeFileSync('vite.config.ts', code);
