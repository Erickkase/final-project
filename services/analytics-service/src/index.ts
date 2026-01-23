import app from './app';
import { config } from './config/config';

const PORT = config.port;

/* eslint-disable no-console */
app.listen(PORT, () => {
  console.log(`📊 Analytics Service running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
/* eslint-enable no-console */
