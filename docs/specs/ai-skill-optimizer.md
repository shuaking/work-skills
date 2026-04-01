# AI SKILL.md 优化功能 - 设计规范

**版本**: v1.0  
**创建日期**: 2026-04-01  
**状态**: 规划中

---

## 📋 功能概述

在用户生成 SKILL.md 后，提供 AI 优化功能，通过调用兼容 OpenAI 格式的 API 来改进内容质量，然后提交到 GitHub Issue。

### 核心价值
- 🤖 **智能优化**：自动润色描述、补充示例、改进格式
- ⚙️ **高度可配置**：支持自定义 API 端点、模型、Prompt 模板
- 🔒 **安全可靠**：本地存储配置，支持多种 API 提供商

---

## 🎯 用户流程

```
1. 用户填写技能信息
   ↓
2. 点击"生成 SKILL.md"
   ↓
3. 显示生成结果 + "AI 优化"按钮
   ↓
4. 点击"AI 优化"
   ↓
5. 调用 API 优化内容（显示加载状态）
   ↓
6. 展示优化后的 SKILL.md（可对比原版）
   ↓
7. 用户确认 → 提交 Issue（使用优化版）
```

---

## 🎨 UI/UX 设计

### 1. 设置面板（Settings Modal）

**触发方式**：
- Navbar 右侧添加"⚙️ 设置"按钮
- 点击打开模态框

**面板布局**：
```
┌─────────────────────────────────────────┐
│  ⚙️ AI 优化设置                          │
├─────────────────────────────────────────┤
│                                         │
│  API 配置                               │
│  ┌─────────────────────────────────┐   │
│  │ API 端点                         │   │
│  │ [https://api.openai.com/v1    ] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ API Key                          │   │
│  │ [sk-...                        ] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 模型                             │   │
│  │ [▼ gpt-4o                      ] │   │
│  │    gpt-4o-mini                   │   │
│  │    claude-3-5-sonnet-20241022    │   │
│  └─────────────────────────────────┘   │
│  [🔄 刷新模型列表]                      │
│                                         │
│  Prompt 模板                            │
│  ┌─────────────────────────────────┐   │
│  │ 预设模板: [▼ 专业润色]          │   │
│  │   - 专业润色                     │   │
│  │   - 补充示例                     │   │
│  │   - 简化描述                     │   │
│  │   - 自定义...                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 自定义 Prompt:                   │   │
│  │ [                              ] │   │
│  │ [                              ] │   │
│  │ [                              ] │   │
│  │                                  │   │
│  │ 可用变量:                        │   │
│  │ {skillId} {description}          │   │
│  │ {overview} {usage}               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [💾 保存配置]  [🔄 重置为默认]        │
└─────────────────────────────────────────┘
```

### 2. AI 优化按钮位置

在"生成 SKILL.md"结果区域：

```
┌─────────────────────────────────────┐
│ ✅ SKILL.md 已生成！                 │
├─────────────────────────────────────┤
│ [SKILL.md 预览区域]                 │
├─────────────────────────────────────┤
│ [📋 复制] [💾 下载] [🚀 Issue]      │
│                                     │
│ [✨ AI 优化] ← 新增按钮              │
└─────────────────────────────────────┘
```

### 3. 优化中状态

```
┌─────────────────────────────────────┐
│ 🤖 AI 正在优化中...                 │
│                                     │
│ [━━━━━━━━━━━━━━━━━━━━] 45%         │
│                                     │
│ 正在调用 gpt-4o 优化内容...         │
└─────────────────────────────────────┘
```

### 4. 优化结果对比

```
┌─────────────────────────────────────┐
│ ✨ AI 优化完成！                     │
├─────────────────────────────────────┤
│ [原始版本] [优化版本] ← Tab 切换     │
│                                     │
│ [优化后的 SKILL.md 内容]            │
│                                     │
│ 优化摘要:                           │
│ • 润色了描述语言                    │
│ • 补充了 3 个使用示例               │
│ • 优化了格式结构                    │
├─────────────────────────────────────┤
│ [📋 复制优化版] [💾 下载]           │
│ [🚀 提交 Issue (使用优化版)]        │
│ [↩️ 使用原始版本]                   │
└─────────────────────────────────────┘
```

---

## 🏗️ 技术架构

### 1. 数据流

```
用户输入
  ↓
生成原始 SKILL.md
  ↓
用户点击"AI 优化"
  ↓
读取配置 (localStorage)
  ↓
构建 API 请求
  ↓
调用 OpenAI 兼容 API
  ↓
解析响应
  ↓
展示优化结果
  ↓
用户确认 → 提交 Issue
```

### 2. 核心模块

#### 2.1 配置管理模块 (`ConfigManager`)

```javascript
class ConfigManager {
  constructor() {
    this.storageKey = 'skillai_config';
    this.defaultConfig = {
      apiEndpoint: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o',
      promptTemplate: 'professional' // 或自定义 Prompt
    };
  }

  loadConfig() { /* 从 localStorage 读取 */ }
  saveConfig(config) { /* 保存到 localStorage */ }
  resetConfig() { /* 重置为默认值 */ }
  validateConfig() { /* 验证配置完整性 */ }
}
```

#### 2.2 API 客户端模块 (`AIClient`)

```javascript
class AIClient {
  constructor(config) {
    this.endpoint = config.apiEndpoint;
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  async getModels() {
    // GET /v1/models
    // 返回可用模型列表
  }

  async optimizeSkill(skillMd, promptTemplate) {
    // POST /v1/chat/completions
    // 发送优化请求
  }

  async streamOptimize(skillMd, promptTemplate, onChunk) {
    // 流式响应（可选）
  }
}
```

#### 2.3 Prompt 模板管理 (`PromptManager`)

```javascript
class PromptManager {
  constructor() {
    this.templates = {
      professional: `你是一个技术文档专家。请优化以下 SKILL.md 内容：

原始内容：
{skillMd}

优化要求：
1. 润色描述，使其更专业、清晰
2. 补充实用的使用示例
3. 改进格式和结构
4. 保持 YAML frontmatter 不变

请直接输出优化后的完整 SKILL.md 内容。`,

      examples: `请为以下 SKILL.md 补充 3-5 个实用的代码示例：

{skillMd}

要求：
- 示例要具体、可运行
- 覆盖常见使用场景
- 包含注释说明`,

      simplify: `请简化以下 SKILL.md 的描述，使其更易理解：

{skillMd}

要求：
- 使用简单直白的语言
- 去除冗余内容
- 保持核心信息完整`,

      custom: '' // 用户自定义
    };
  }

  getTemplate(name) { /* 获取模板 */ }
  setCustomTemplate(content) { /* 设置自定义模板 */ }
  renderTemplate(name, variables) { /* 变量替换 */ }
}
```

---

## 🔌 API 集成方案

### 1. OpenAI 兼容格式

支持所有兼容 OpenAI API 格式的服务：
- OpenAI
- Azure OpenAI
- Anthropic (通过代理)
- 本地模型 (Ollama, LM Studio)
- 其他第三方服务

### 2. 请求格式

```javascript
POST {apiEndpoint}/chat/completions

Headers:
  Authorization: Bearer {apiKey}
  Content-Type: application/json

Body:
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "你是一个技术文档专家..."
    },
    {
      "role": "user",
      "content": "请优化以下 SKILL.md:\n\n{skillMd}"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}
```

### 3. 错误处理

```javascript
try {
  const response = await aiClient.optimizeSkill(skillMd, prompt);
  showOptimizedResult(response);
} catch (error) {
  if (error.status === 401) {
    showToast('API Key 无效，请检查配置', 'error');
  } else if (error.status === 429) {
    showToast('请求过于频繁，请稍后再试', 'error');
  } else if (error.status === 500) {
    showToast('API 服务错误，请稍后再试', 'error');
  } else {
    showToast(`优化失败: ${error.message}`, 'error');
  }
}
```

### 4. 重试逻辑

```javascript
async function optimizeWithRetry(skillMd, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await aiClient.optimizeSkill(skillMd);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * (i + 1)); // 指数退避
    }
  }
}
```

---

## 💾 数据存储方案

### 1. localStorage 结构

```javascript
{
  "skillai_config": {
    "apiEndpoint": "https://api.openai.com/v1",
    "apiKey": "sk-...",  // 加密存储？
    "model": "gpt-4o",
    "promptTemplate": "professional",
    "customPrompt": "...",
    "lastUpdated": "2026-04-01T12:00:00Z"
  },
  
  "skillai_history": [
    {
      "skillId": "web-scraper",
      "originalMd": "...",
      "optimizedMd": "...",
      "timestamp": "2026-04-01T12:00:00Z"
    }
  ]
}
```

### 2. 安全考虑

**API Key 存储**：
- ⚠️ localStorage 是明文存储，存在 XSS 风险
- 建议方案：
  1. 提示用户风险，由用户决定
  2. 使用简单的 Base64 编码（防止肉眼可见）
  3. 添加"仅本次使用"选项（不保存）

**最佳实践**：
```javascript
// 编码（非加密，仅混淆）
function encodeApiKey(key) {
  return btoa(key);
}

// 解码
function decodeApiKey(encoded) {
  return atob(encoded);
}
```

---

## 🎯 Prompt 模板系统

### 1. 预设模板

**专业润色模板**：
```
你是一个技术文档专家。请优化以下 Claude Code Skill 的 SKILL.md 内容。

原始内容：
---
{skillMd}
---

优化要求：
1. 保持 YAML frontmatter (name, description) 不变
2. 润色 Overview 部分，使其更专业、清晰
3. 改进 Usage 部分，添加具体步骤
4. 在 Examples 部分补充 2-3 个实用代码示例
5. 在 Notes 部分添加注意事项和最佳实践
6. 保持 Markdown 格式规范

请直接输出优化后的完整 SKILL.md 内容，不要添加任何解释。
```

**补充示例模板**：
```
请为以下 SKILL.md 的 Examples 部分补充 3-5 个实用的代码示例。

当前内容：
---
{skillMd}
---

要求：
- 示例要具体、可运行
- 覆盖常见使用场景
- 包含代码注释
- 展示不同参数组合

请输出完整的 SKILL.md，只修改 Examples 部分。
```

**简化描述模板**：
```
请简化以下 SKILL.md 的描述，使其更易理解。

当前内容：
---
{skillMd}
---

要求：
- 使用简单直白的语言
- 去除冗余和重复内容
- 保持核心信息完整
- 适合初学者阅读

请输出完整的优化后 SKILL.md。
```

### 2. 变量系统

支持的变量：
- `{skillMd}` - 完整的原始 SKILL.md 内容
- `{skillId}` - 技能 ID
- `{description}` - 简短描述
- `{overview}` - 详细概述
- `{usage}` - 使用说明

用户可以在自定义 Prompt 中使用这些变量。

### 3. 模板编辑器

```html
<div class="prompt-editor">
  <label>自定义 Prompt 模板</label>
  <textarea id="customPrompt" rows="10" placeholder="输入你的 Prompt 模板...">
你是一个技术文档专家。请优化以下内容：

{skillMd}

要求：
1. ...
2. ...
  </textarea>
  
  <div class="variables-help">
    <strong>可用变量：</strong>
    <code>{skillMd}</code>
    <code>{skillId}</code>
    <code>{description}</code>
    <code>{overview}</code>
    <code>{usage}</code>
  </div>
</div>
```

---

## 🔐 安全与隐私

### 1. API Key 安全

**风险**：
- localStorage 明文存储
- XSS 攻击可能窃取
- 浏览器开发者工具可见

**缓解措施**：
1. **用户提示**：
   ```
   ⚠️ 安全提示
   API Key 将存储在浏览器本地，存在一定风险。
   建议：
   - 使用受限权限的 API Key
   - 定期轮换 Key
   - 或选择"仅本次使用"（不保存）
   ```

2. **简单混淆**（非加密）：
   ```javascript
   // 防止肉眼直接看到
   const encoded = btoa(apiKey);
   localStorage.setItem('api_key', encoded);
   ```

3. **仅本次使用选项**：
   ```html
   <input type="checkbox" id="saveApiKey">
   <label>保存 API Key（下次自动填充）</label>
   ```

### 2. 数据隐私

- 用户生成的 SKILL.md 会发送到第三方 API
- 需要在 UI 中明确告知用户
- 提供"本地模式"选项（使用本地 LLM）

---

## 📦 实施步骤

### Phase 1: 基础设施（1-2 小时）

1. **创建配置管理模块**
   - `ConfigManager` 类
   - localStorage 读写
   - 默认配置

2. **创建 API 客户端**
   - `AIClient` 类
   - OpenAI 兼容请求
   - 错误处理

3. **创建 Prompt 管理器**
   - `PromptManager` 类
   - 预设模板
   - 变量替换

### Phase 2: UI 实现（2-3 小时）

1. **设置面板**
   - 模态框组件
   - 表单验证
   - 保存/重置功能

2. **AI 优化按钮**
   - 按钮位置
   - 加载状态
   - 进度显示

3. **结果展示**
   - 对比视图
   - Tab 切换
   - 优化摘要

### Phase 3: 集成与测试（1-2 小时）

1. **集成到现有流程**
   - 修改 `generateNewSkill()`
   - 添加优化逻辑
   - 更新 Issue 提交

2. **测试**
   - 不同 API 提供商
   - 错误场景
   - 边界情况

### Phase 4: 优化与文档（1 小时）

1. **性能优化**
   - 请求缓存
   - 防抖处理

2. **用户文档**
   - 使用说明
   - 配置示例
   - 常见问题

---

## 🎨 未来主义风格适配

保持与当前页面风格一致：

### 设置面板样式
```css
.settings-modal {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 20px 60px rgba(0, 255, 255, 0.3);
}

.settings-input {
  background: rgba(10, 1, 24, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #ffffff;
}

.settings-input:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}
```

### AI 优化按钮
```css
.ai-optimize-btn {
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta));
  border: none;
  color: white;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.ai-optimize-btn:hover {
  box-shadow: 0 0 40px rgba(0, 255, 255, 0.8);
  transform: scale(1.05);
}
```

---

## ✅ 验收标准

### 功能完整性
- [ ] 可以配置 API 端点、Key、模型
- [ ] 可以选择预设 Prompt 模板
- [ ] 可以自定义 Prompt 模板
- [ ] 可以从 API 获取模型列表
- [ ] 可以优化 SKILL.md 内容
- [ ] 可以对比原始版和优化版
- [ ] 可以提交优化后的 Issue

### 用户体验
- [ ] 设置面板易于使用
- [ ] 加载状态清晰可见
- [ ] 错误提示友好明确
- [ ] 配置持久化保存
- [ ] 响应式设计（移动端友好）

### 安全性
- [ ] API Key 有安全提示
- [ ] 支持"仅本次使用"选项
- [ ] 输入验证完整
- [ ] 错误处理健壮

### 性能
- [ ] API 请求有超时控制
- [ ] 有重试机制
- [ ] 大文本处理流畅
- [ ] 无内存泄漏

---

## 📚 参考资料

- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [Anthropic API 文档](https://docs.anthropic.com/claude/reference)
- [localStorage 最佳实践](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

## 🚀 下一步

规划完成后，执行 `/vibe-exec` 开始实施。

预计总开发时间：**5-8 小时**
