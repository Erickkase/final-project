import app from './app';
import { config } from './config/config';

const PORT = config.port;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`📔 Journal Service running on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Environment: ${config.nodeEnv}`);
});
