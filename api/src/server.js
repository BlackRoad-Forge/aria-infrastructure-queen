const createApp = require('./app');
const config = require('./config');

const app = createApp();

app.listen(config.port, () => {
  console.log(`Aria Stripe API running on port ${config.port} [${config.nodeEnv}]`);
});
