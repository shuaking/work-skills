# SKIILs 官网部署说明

## 部署方式

### GitHub Pages（当前方式）

**特点**：
- ✅ 免费托管
- ✅ 自动 HTTPS
- ✅ 简单易用
- ❌ 仅支持静态文件
- ❌ 无服务器端功能

**可用功能**：
- ✅ 技能展示和浏览
- ✅ 技能卡片详情查看
- ✅ 手动生成 SKILL.md
- ✅ 复制、下载、提交 Issue
- ❌ AI 优化功能（受 CORS 限制）

**部署步骤**：
```bash
# 1. 推送到 GitHub
git push origin main

# 2. 在 GitHub 仓库设置中启用 Pages
# Settings → Pages → Source: main branch → /docs folder

# 3. 访问
# https://[username].github.io/[repo-name]/
```

---

## AI 功能限制说明

### 为什么 AI 功能不可用？

浏览器安全策略（CORS）阻止前端直接调用 OpenAI API。这是标准的安全措施。

```
浏览器 → OpenAI API
   ❌ 被 CORS 策略阻止
```

### 如何启用 AI 功能？

需要添加后端代理服务。以下是几种方案：

---

## 方案 A：Vercel 部署（推荐）

**优点**：
- ✅ 免费额度充足
- ✅ 自动 HTTPS
- ✅ 支持 Serverless Functions
- ✅ 零配置部署

**步骤**：

1. **创建 API 代理函数**

```javascript
// api/openai-proxy.js
export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint, ...body } = req.body;
  const apiKey = req.headers.authorization?.replace('Bearer ', '');

  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  try {
    const response = await fetch(`https://api.openai.com/v1${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

2. **更新前端配置**

```javascript
// docs/js/config-manager.js
this.defaultConfig = {
  apiEndpoint: 'https://your-app.vercel.app/api/openai-proxy',
  // ...
};
```

3. **部署到 Vercel**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

---

## 方案 B：Cloudflare Workers

**优点**：
- ✅ 免费额度：每天 100,000 次请求
- ✅ 全球边缘网络
- ✅ 极低延迟

**步骤**：

1. **创建 Worker**

```javascript
// worker.js
export default {
  async fetch(request) {
    // 处理 CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    const url = new URL(request.url);
    const apiKey = request.headers.get('Authorization');

    if (!apiKey) {
      return new Response('Missing API key', { status: 401 });
    }

    // 代理到 OpenAI
    const openaiUrl = 'https://api.openai.com' + url.pathname;
    const response = await fetch(openaiUrl, {
      method: request.method,
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: request.body
    });

    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
```

2. **部署**

```bash
# 安装 Wrangler CLI
npm i -g wrangler

# 登录
wrangler login

# 部署
wrangler publish
```

3. **更新前端配置**

```javascript
// docs/js/config-manager.js
this.defaultConfig = {
  apiEndpoint: 'https://your-worker.workers.dev',
  // ...
};
```

---

## 方案 C：本地开发代理

**仅用于本地开发测试**

1. **安装 CORS 代理**

```bash
npm install -g local-cors-proxy
```

2. **启动代理**

```bash
lcp --proxyUrl https://api.openai.com
# 代理运行在 http://localhost:8010/proxy
```

3. **更新配置**

```javascript
apiEndpoint: 'http://localhost:8010/proxy/v1'
```

---

## 安全建议

### ⚠️ 不要在前端硬编码 API Key

即使使用代理，也不要在代码中硬编码 API Key：

```javascript
// ❌ 危险
const API_KEY = 'sk-...';

// ✅ 安全：让用户输入
// 当前实现已经是安全的
```

### 🔒 使用环境变量（服务器端）

如果使用 Vercel 或 Cloudflare Workers：

```bash
# Vercel
vercel env add OPENAI_API_KEY

# Cloudflare Workers
wrangler secret put OPENAI_API_KEY
```

然后在代码中使用：

```javascript
// Vercel
const apiKey = process.env.OPENAI_API_KEY;

// Cloudflare Workers
const apiKey = env.OPENAI_API_KEY;
```

---

## 当前部署状态

**托管方式**：GitHub Pages  
**可用功能**：核心功能（技能展示、生成、下载）  
**AI 功能**：不可用（需要后端代理）

**如需启用 AI 功能**：
1. 选择上述方案之一
2. 部署后端代理
3. 更新 `docs/js/config-manager.js` 中的 `apiEndpoint`

---

## 常见问题

### Q: 为什么不能直接调用 OpenAI API？
A: 浏览器的 CORS 安全策略阻止跨域请求。这是标准的安全措施，保护用户免受恶意网站攻击。

### Q: GitHub Pages 能运行服务器代码吗？
A: 不能。GitHub Pages 只能托管静态文件（HTML、CSS、JS）。

### Q: 使用代理安全吗？
A: 如果正确实现（不在前端暴露 API Key），代理是安全的。推荐使用 Vercel 或 Cloudflare Workers。

### Q: 免费方案够用吗？
A: 对于个人项目和小型团队，Vercel 和 Cloudflare Workers 的免费额度完全够用。

---

## 总结

- **当前状态**：核心功能完整，AI 功能受限
- **推荐方案**：Vercel（最简单）或 Cloudflare Workers（最快）
- **安全原则**：永远不要在前端硬编码 API Key
