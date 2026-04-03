// ========== AI 客户端模块 ==========

// 通用重试工具函数
async function fetchWithRetry(url, options, maxRetries = 3, timeout = 10000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // 如果是超时或网络错误，等待后重试
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      } else {
        throw error; // 其他错误直接抛出
      }
    }
  }
}

export class AIClient {
  constructor(config) {
    this.endpoint = config.apiEndpoint;
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.isProxy = this.endpoint.includes('/api/openai-proxy');
  }

  async getModels() {
    try {
      const url = this.isProxy ? this.endpoint : `${this.endpoint}/models`;

      const response = await fetchWithRetry(
        url,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        },
        3,
        10000
      );

      if (!response.ok) {
        const status = response.status;
        if (status === 401) {
          throw new Error('API Key 无效或已过期');
        } else if (status === 429) {
          throw new Error('请求过于频繁，请稍后再试');
        } else if (status >= 500) {
          throw new Error('API 服务暂时不可用，请稍后再试');
        }
        throw new Error(`HTTP ${status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('获取模型列表失败:', error);
      throw error;
    }
  }

  async optimizeSkill(skillMd, systemPrompt) {
    try {
      const url = this.isProxy ? this.endpoint : `${this.endpoint}/chat/completions`;

      const requestBody = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `请优化以下 SKILL.md 内容：\n\n${skillMd}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      };

      // 如果是代理端点，添加 endpoint 字段
      if (this.isProxy) {
        requestBody.endpoint = '/chat/completions';
      }

      const response = await fetchWithRetry(
        url,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        },
        3,
        30000 // AI 请求超时时间更长
      );

      if (!response.ok) {
        const status = response.status;
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || '';

        if (status === 401) {
          throw new Error('API Key 无效或已过期');
        } else if (status === 429) {
          throw new Error('请求过于频繁，请稍后再试');
        } else if (status === 400 && errorMsg.includes('context_length')) {
          throw new Error('内容过长，请缩短技能描述');
        } else if (status >= 500) {
          throw new Error('API 服务暂时不可用，请稍后再试');
        }
        throw new Error(errorMsg || `HTTP ${status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI 优化失败:', error);
      throw error;
    }
  }

  async optimizeWithRetry(skillMd, systemPrompt, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.optimizeSkill(skillMd, systemPrompt);
      } catch (error) {
        // 某些错误不应重试（如 API Key 无效、内容过长）
        if (error.message.includes('API Key') || error.message.includes('内容过长')) {
          throw error;
        }
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
}
