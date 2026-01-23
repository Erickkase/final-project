import app from './app';
import { config } from './config/config';

const PORT = config.port;

/* eslint-disable no-console */
app.listen(PORT, () => {
  console.log(`🚀 Recommendation Service running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Emotion Service: ${config.emotionServiceUrl}`);
  console.log(`🔗 Analytics Service: ${config.analyticsServiceUrl}`);
  console.log(`🔗 Goal Service: ${config.goalServiceUrl}`);
  console.log(`🔗 Journal Service: ${config.journalServiceUrl}`);
});
/* eslint-enable no-console */
