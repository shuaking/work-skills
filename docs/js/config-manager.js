// ========== 配置管理模块 ==========

// 自动检测部署环境
function detectApiEndpoint() {
  const hostname = window.location.hostname;

  // Vercel 部署（支持 AI 功能）
  if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
    return window.location.origin + '/api/openai-proxy';
  }

  // 自定义域名（假设使用 Vercel）
  if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('github.io')) {
    return window.location.origin + '/api/openai-proxy';
  }

  // GitHub Pages 或本地开发（直接调用 OpenAI，会有 CORS 限制）
  return 'https://api.openai.com/v1';
}

export class ConfigManager {
  constructor() {
    this.storageKey = 'skillai_config';
    this.sessionKey = 'skillai_session'; // 用于存储敏感数据
    this.defaultConfig = {
      apiEndpoint: detectApiEndpoint(),
      apiKey: '',
      model: 'gpt-4o',
      promptTemplate: 'professional',
      customPrompt: ''
    };
  }

  loadConfig() {
    try {
      // 从 localStorage 加载非敏感配置
      const stored = localStorage.getItem(this.storageKey);
      const config = stored ? JSON.parse(stored) : {};

      // 从 sessionStorage 加载 API Key（仅在当前标签页会话中有效）
      const sessionData = sessionStorage.getItem(this.sessionKey);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        config.apiKey = session.apiKey || '';
      }

      return { ...this.defaultConfig, ...config };
    } catch (error) {
      console.error('加载配置失败:', error);
      return { ...this.defaultConfig };
    }
  }

  saveConfig(config) {
    try {
      // 分离敏感和非敏感数据
      const { apiKey, ...nonSensitiveConfig } = config;

      // 非敏感配置存储到 localStorage（持久化）
      localStorage.setItem(this.storageKey, JSON.stringify(nonSensitiveConfig));

      // API Key 存储到 sessionStorage（标签页关闭时自动清除）
      if (apiKey && apiKey.trim() !== '') {
        sessionStorage.setItem(this.sessionKey, JSON.stringify({ apiKey }));
      } else {
        sessionStorage.removeItem(this.sessionKey);
      }

      return true;
    } catch (error) {
      console.error('保存配置失败:', error);
      return false;
    }
  }

  resetConfig() {
    localStorage.removeItem(this.storageKey);
    sessionStorage.removeItem(this.sessionKey);
    return { ...this.defaultConfig };
  }

  validateConfig(config) {
    if (!config.apiEndpoint || !config.apiEndpoint.startsWith('http')) {
      return { valid: false, error: 'API 端点格式不正确' };
    }
    if (!config.apiKey || config.apiKey.trim() === '') {
      return { valid: false, error: 'API Key 不能为空' };
    }
    if (!config.model || config.model.trim() === '') {
      return { valid: false, error: '请选择模型' };
    }
    return { valid: true };
  }
}
