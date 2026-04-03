# GitHub Pages + Vercel 双部署指南

## 架构说明

```
┌─────────────────┐         ┌──────────────────┐
│  GitHub Pages   │────────>│  Vercel Proxy    │
│  (静态网站)      │  调用    │  (API 代理)       │
└─────────────────┘         └──────────────────┘
                                     │
                                     ↓
                            ┌──────────────────┐
                            │   OpenAI API     │
                            └──────────────────┘

┌─────────────────┐         ┌──────────────────┐
│  Vercel 部署     │────────>│  Vercel Proxy    │
│  (静态网站)      │  调用    │  (同一个代理)     │
└─────────────────┘         └──────────────────┘
```

**关键点**：
- GitHub Pages 和 Vercel 都调用同一个 Vercel 代理
- 两个部署都能使用 AI 功能
- 只需维护一个 API 代理

---

## 部署步骤

### 第一步：部署到 Vercel（获取代理 URL）

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择 `work-skills` 仓库
   - 点击 "Import"

3. **配置项目**（保持默认）
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: 留空
   - Output Directory: `docs`

4. **部署**
   - 点击 "Deploy"
   - 等待部署完成

5. **获取 Vercel URL**
   - 部署完成后，复制 URL
   - 例如：`https://work-skills-abc123.vercel.app`

---

### 第二步：更新配置并推送到 GitHub

1. **打开配置文件**
   ```
   docs/js/config-manager.js
   ```

2. **替换占位符**
   
   找到这一行：
   ```javascript
   const VERCEL_PROXY_URL = 'https://YOUR-PROJECT.vercel.app/api/openai-proxy';
   ```

   替换为你的实际 Vercel URL：
   ```javascript
   const VERCEL_PROXY_URL = 'https://work-skills-abc123.vercel.app/api/openai-proxy';
   ```

3. **提交并推送**
   ```bash
   git add docs/js/config-manager.js
   git commit -m "配置：更新 Vercel 代理 URL"
   git push origin main
   ```

4. **等待部署**
   - GitHub Pages 会自动更新（约 1-2 分钟）
   - Vercel 也会自动重新部署

---

## 验证部署

### 验证 GitHub Pages

1. 访问 GitHub Pages URL
   - 例如：`https://shuaking.github.io/work-skills/`

2. 打开设置面板，查看部署模式
   - 应该显示：**"✓ Vercel 代理（AI 功能已启用）"**（绿色）

3. 测试 AI 功能
   - 输入 OpenAI API Key
   - 点击"刷新"按钮
   - 应该能成功获取模型列表

### 验证 Vercel 部署

1. 访问 Vercel URL
   - 例如：`https://work-skills-abc123.vercel.app`

2. 同样测试 AI 功能
   - 应该也能正常工作

---

## 工作原理

### 配置逻辑

```javascript
// config-manager.js

const VERCEL_PROXY_URL = 'https://work-skills-abc123.vercel.app/api/openai-proxy';

function getApiEndpoint() {
  // 如果已配置 Vercel 代理，所有部署都使用它
  if (!VERCEL_PROXY_URL.includes('YOUR-PROJECT')) {
    return VERCEL_PROXY_URL;  // ← GitHub Pages 和 Vercel 都用这个
  }
  
  // 未配置时的回退逻辑
  // ...
}
```

### 请求流程

**GitHub Pages 部署**：
```
用户浏览器
  → GitHub Pages (静态 HTML/JS)
  → Vercel 代理 (https://work-skills-abc123.vercel.app/api/openai-proxy)
  → OpenAI API
```

**Vercel 部署**：
```
用户浏览器
  → Vercel (静态 HTML/JS)
  → Vercel 代理 (同一个 URL)
  → OpenAI API
```

---

## 优势

✅ **两个部署都能用 AI**
- GitHub Pages：免费托管 + AI 功能
- Vercel：免费托管 + AI 功能

✅ **只维护一个代理**
- 代码更新自动同步到两边
- 只需管理一个 Vercel 项目

✅ **灵活性**
- 可以分享任一 URL
- 用户体验完全一致

✅ **成本**
- 完全免费（在免费额度内）

---

## 故障排查

### 问题 1：GitHub Pages 仍显示"AI 功能受限"

**原因**：配置文件未更新或未推送

**解决**：
1. 检查 `docs/js/config-manager.js` 中的 `VERCEL_PROXY_URL`
2. 确保已推送到 GitHub
3. 等待 GitHub Pages 重新部署（1-2 分钟）
4. 清除浏览器缓存并刷新

### 问题 2：API 代理返回 404

**原因**：Vercel URL 不正确

**解决**：
1. 在 Vercel Dashboard 确认正确的 URL
2. 确保 URL 包含 `/api/openai-proxy`
3. 测试代理端点：
   ```bash
   curl https://your-project.vercel.app/api/openai-proxy \
     -H "Authorization: Bearer sk-test"
   ```

### 问题 3：CORS 错误

**原因**：代理函数 CORS 配置问题

**解决**：
检查 `api/openai-proxy.js` 中的 CORS 头：
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

### 问题 4：两个部署行为不一致

**原因**：浏览器缓存了旧配置

**解决**：
1. 打开浏览器开发者工具（F12）
2. Application → Storage → Clear site data
3. 刷新页面

---

## 更新流程

以后更新代码时：

```bash
# 1. 修改代码
git add .
git commit -m "更新：xxx"
git push origin main

# 2. 自动部署
# - GitHub Pages 自动更新
# - Vercel 自动重新部署

# 3. 两边都会更新（约 1-2 分钟）
```

**无需手动操作**，推送一次，两边都更新。

---

## 自定义域名（可选）

### GitHub Pages 自定义域名

1. 在仓库设置中配置自定义域名
2. 添加 DNS 记录（CNAME）
3. 等待 DNS 生效

### Vercel 自定义域名

1. 在 Vercel Dashboard 添加域名
2. 配置 DNS 记录
3. 等待验证

**注意**：配置自定义域名后，需要更新 `VERCEL_PROXY_URL`。

---

## 总结

✅ **部署完成后**：
- GitHub Pages：`https://username.github.io/work-skills/`（AI ✓）
- Vercel：`https://work-skills-abc123.vercel.app`（AI ✓）

✅ **维护成本**：
- 推送一次代码，两边自动更新
- 只需维护一个 API 代理

✅ **用户体验**：
- 两个 URL 功能完全一致
- 都支持完整的 AI 功能

---

## 快速检查清单

部署前：
- [ ] 已推送代码到 GitHub
- [ ] 已在 Vercel 导入项目

部署后：
- [ ] 获取 Vercel URL
- [ ] 更新 `config-manager.js` 中的 `VERCEL_PROXY_URL`
- [ ] 推送更新到 GitHub
- [ ] 等待两边重新部署（1-2 分钟）
- [ ] 测试 GitHub Pages 的 AI 功能
- [ ] 测试 Vercel 的 AI 功能

---

**需要帮助？** 参考 `VERCEL_DEPLOYMENT.md` 或提交 Issue。
