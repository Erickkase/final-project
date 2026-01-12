import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import config from '../config/config';

interface ServiceProxyOptions {
  serviceUrl: string;
  timeout?: number;
}

class ServiceProxy {
  private client: AxiosInstance;

  constructor(options: ServiceProxyOptions) {
    this.client = axios.create({
      baseURL: options.serviceUrl,
      timeout: options.timeout || config.serviceTimeout,
      validateStatus: () => true, // No lanzar error por status codes
    });
  }

  async get(path: string, config?: AxiosRequestConfig) {
    return this.client.get(path, config);
  }

  async post(path: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post(path, data, config);
  }

  async put(path: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put(path, data, config);
  }

  async delete(path: string, config?: AxiosRequestConfig) {
    return this.client.delete(path, config);
  }

  async patch(path: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch(path, data, config);
  }
}

// Crear instancias de proxies para cada servicio
export const authServiceProxy = new ServiceProxy({
  serviceUrl: config.services.auth,
});

export const userServiceProxy = new ServiceProxy({
  serviceUrl: config.services.user,
});

export const emotionServiceProxy = new ServiceProxy({
  serviceUrl: config.services.emotion,
});

export const reportServiceProxy = new ServiceProxy({
  serviceUrl: config.services.report,
});

export const notificationServiceProxy = new ServiceProxy({
  serviceUrl: config.services.notification,
});

export const motivationServiceProxy = new ServiceProxy({
  serviceUrl: config.services.motivation,
});

export const aiAnalysisServiceProxy = new ServiceProxy({
  serviceUrl: config.services.aiAnalysis,
});

export const auditServiceProxy = new ServiceProxy({
  serviceUrl: config.services.audit,
});

export const backupServiceProxy = new ServiceProxy({
  serviceUrl: config.services.backup,
});

export const integrationServiceProxy = new ServiceProxy({
  serviceUrl: config.services.integration,
});

export default ServiceProxy;
