import app from './app';
import { config } from './config/config';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🎯 Goal Service running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
