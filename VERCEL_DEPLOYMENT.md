# Vercel 部署指南

## 快速开始

### 方式 1：通过 Vercel Dashboard（推荐）

1. **访问 Vercel**
   - 前往 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择 `work-skills` 仓库
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (保持默认)
   - **Build Command**: 留空（静态站点）
   - **Output Directory**: `docs`
   - **Install Command**: 留空

4. **部署**
   - 点击 "Deploy"
   - 等待部署完成（约 1-2 分钟）

5. **访问网站**
   - 部署完成后，Vercel 会提供一个 URL
   - 例如：`https://work-skills.vercel.app`
   - AI 功能将自动启用

---

### 方式 2：通过 Vercel CLI

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录**
```bash
vercel login
```

3. **部署**
```bash
cd /path/to/work-skills
vercel
```

4. **按提示操作**
   - Set up and deploy? **Y**
   - Which scope? 选择你的账号
   - Link to existing project? **N**
   - What's your project's name? **work-skills**
   - In which directory is your code located? **.**
   - Want to override the settings? **N**

5. **生产部署**
```bash
vercel --prod
```

---

## 验证部署

### 检查 API 端点

打开浏览器控制台（F12），在网站上打开设置面板，查看 API 端点：

**Vercel 部署（正确）**：
```
https://your-app.vercel.app/api/openai-proxy
```

**GitHub Pages（受限）**：
```
https://api.openai.com/v1
```

### 测试 AI 功能

1. 打开设置面板
2. 输入 OpenAI API Key
3. 点击"刷新"按钮获取模型列表
4. 如果成功显示模型列表，说明 AI 功能已启用

---

## 自动部署

### 配置自动部署

Vercel 会自动监听 GitHub 仓库的推送：

- **推送到 `main` 分支** → 自动部署到生产环境
- **推送到其他分支** → 自动部署到预览环境

### 查看部署状态

1. 访问 Vercel Dashboard
2. 选择 `work-skills` 项目
3. 查看 "Deployments" 标签

---

## 环境变量（可选）

如果你想在服务器端存储 API Key（更安全）：

### 1. 在 Vercel Dashboard 设置

1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加变量：
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-...`
   - **Environment**: Production, Preview, Development

### 2. 更新 API 代理代码

修改 `api/openai-proxy.js`：

```javascript
export default async function handler(req, res) {
  // ... CORS 设置 ...

  // 优先使用环境变量中的 API Key
  let apiKey = process.env.OPENAI_API_KEY;

  // 如果没有环境变量，从请求头获取
  if (!apiKey) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { message: 'Missing API key' }
      });
    }
    apiKey = authHeader.replace('Bearer ', '');
  }

  // ... 其余代码 ...
}
```

### 3. 重新部署

```bash
vercel --prod
```

---

## 自定义域名（可选）

### 添加自定义域名

1. 在 Vercel Dashboard 中选择项目
2. 点击 "Settings" → "Domains"
3. 输入你的域名（例如：`skills.example.com`）
4. 按照提示配置 DNS 记录

### DNS 配置

在你的域名提供商处添加记录：

**CNAME 记录**：
```
skills.example.com → cname.vercel-dns.com
```

或

**A 记录**：
```
@ → 76.76.21.21
```

---

## 故障排查

### 问题 1：API 端点仍然是 OpenAI 直连

**原因**：浏览器缓存了旧配置

**解决**：
1. 打开浏览器开发者工具（F12）
2. Application → Storage → Clear site data
3. 刷新页面

### 问题 2：API 代理返回 500 错误

**原因**：API Key 无效或请求格式错误

**解决**：
1. 检查 API Key 是否正确
2. 查看 Vercel 函数日志：Dashboard → Functions → Logs

### 问题 3：部署成功但页面空白

**原因**：路由配置问题

**解决**：
检查 `vercel.json` 中的路由配置是否正确

### 问题 4：CORS 错误仍然存在

**原因**：代理函数未正确设置 CORS 头

**解决**：
检查 `api/openai-proxy.js` 中的 CORS 头设置

---

## 成本估算

### Vercel 免费额度

- **带宽**：100 GB/月
- **函数调用**：100 GB-小时/月
- **函数执行时间**：100 小时/月
- **部署次数**：无限制

### 预估使用量

假设每天 100 次 AI 优化请求：

- **函数调用**：100 次/天 × 30 天 = 3,000 次/月
- **执行时间**：3,000 × 2 秒 = 1.67 小时/月
- **带宽**：3,000 × 10 KB = 30 MB/月

**结论**：个人项目和小型团队完全在免费额度内。

---

## 监控和日志

### 查看函数日志

1. Vercel Dashboard → 选择项目
2. Functions → 选择 `openai-proxy`
3. 查看实时日志和错误

### 监控指标

- **调用次数**：Functions → Invocations
- **错误率**：Functions → Errors
- **响应时间**：Functions → Duration

---

## 回滚部署

如果新部署出现问题：

1. Vercel Dashboard → Deployments
2. 找到之前的稳定版本
3. 点击 "..." → "Promote to Production"

---

## 总结

✅ **部署完成后**：
- GitHub Pages 继续提供核心功能
- Vercel 提供完整功能（包括 AI）
- 两个部署互不影响

✅ **自动化**：
- 推送到 GitHub 自动触发 Vercel 部署
- 无需手动操作

✅ **成本**：
- 完全免费（在免费额度内）

---

## 下一步

部署完成后，你可以：

1. 在 Vercel URL 上测试 AI 功能
2. 配置自定义域名（可选）
3. 设置环境变量存储 API Key（可选）
4. 监控使用情况和日志

**需要帮助？** 查看 [Vercel 官方文档](https://vercel.com/docs)
