# A Node.JS application boilerplate writing in ES6, Babel and ESLint

### Requirements
```bash
node v6.10.0
npm v3.10.10
pm2 v3.2.2
```

#### Runs by npm
```bash
npm install
npm start
npm run lint
npm run build
npm run start-product
```

### Runs by pm2
```bash
npm run build
pm2 start ecosystem.config.js # development env
pm2 start ecosystem.config.js --env production # production env
```
