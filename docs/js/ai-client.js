// ========== AI 客户端模块 ==========
export class AIClient {
  constructor(config) {
    this.endpoint = config.apiEndpoint;
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  async getModels() {
    try {
      const response = await fetch(`${this.endpoint}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
      const response = await fetch(`${this.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
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
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
}
