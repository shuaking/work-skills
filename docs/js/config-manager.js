// ========== 配置管理模块 ==========
export class ConfigManager {
  constructor() {
    this.storageKey = 'skillai_config';
    this.defaultConfig = {
      apiEndpoint: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o',
      promptTemplate: 'professional',
      customPrompt: '',
      saveApiKey: false
    };
  }

  loadConfig() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const config = JSON.parse(stored);
        // 解码 API Key
        if (config.apiKey) {
          config.apiKey = this.decodeApiKey(config.apiKey);
        }
        return { ...this.defaultConfig, ...config };
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
    return { ...this.defaultConfig };
  }

  saveConfig(config) {
    try {
      const toSave = { ...config };
      // 编码 API Key（简单混淆）
      if (toSave.apiKey && toSave.saveApiKey) {
        toSave.apiKey = this.encodeApiKey(toSave.apiKey);
      } else {
        toSave.apiKey = ''; // 不保存
      }
      localStorage.setItem(this.storageKey, JSON.stringify(toSave));
      return true;
    } catch (error) {
      console.error('保存配置失败:', error);
      return false;
    }
  }

  resetConfig() {
    localStorage.removeItem(this.storageKey);
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

  encodeApiKey(key) {
    return btoa(key); // Base64 编码（非加密）
  }

  decodeApiKey(encoded) {
    try {
      return atob(encoded);
    } catch {
      return encoded; // 如果解码失败，返回原值
    }
  }
}
