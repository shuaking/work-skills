# API 代理函数

这个目录包含 Vercel Serverless Functions，用于代理前端请求到 OpenAI API。

## 文件说明

### `openai-proxy.js`

OpenAI API 代理函数，解决浏览器 CORS 限制。

**功能**：
- 接收前端请求
- 转发到 OpenAI API
- 返回响应给前端
- 处理 CORS 跨域

**端点**：
- **URL**: `/api/openai-proxy`
- **方法**: GET, POST
- **认证**: Bearer Token（从请求头获取）

**请求示例**：

```javascript
// 获取模型列表
fetch('/api/openai-proxy', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer sk-...',
    'Content-Type': 'application/json'
  }
});

// AI 优化
fetch('/api/openai-proxy', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    endpoint: '/chat/completions',
    model: 'gpt-4o',
    messages: [...]
  })
});
```

## 安全说明

**当前实现**：
- API Key 从前端请求头传递
- 用户需要自己提供 API Key
- API Key 存储在 sessionStorage（标签页关闭时清除）

**可选增强**（更安全）：
- 在 Vercel 环境变量中存储 API Key
- 前端无需提供 API Key
- 参考 `VERCEL_DEPLOYMENT.md` 中的"环境变量"部分

## 本地测试

```bash
# 安装 Vercel CLI
npm install -g vercel

# 本地运行
vercel dev

# 访问
# http://localhost:3000
```

## 部署

推送到 GitHub 后，Vercel 会自动部署此函数。

详见：`../VERCEL_DEPLOYMENT.md`
