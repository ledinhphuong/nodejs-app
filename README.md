# A Node.JS application boilerplate writing in ES6, Babel and ESLint

### Requirements
```bash
node v10.22.0
pm2 v3.2.2
```

#### Runs by npm
```bash
npm install
npm start
npm test
npm test --collectCoverage --coverageDirectory ".coverage"
npm run lint
npm run build
```

### Runs by pm2
```bash
npm run build
pm2 start ecosystem.config.js # development env
pm2 start ecosystem.config.js --env production # production env
```
