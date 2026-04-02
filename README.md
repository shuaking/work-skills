# SKIILs

**🚀 SKIILs - 模块化多技能工具库**  
随时可被**任意其他项目**通过 pip 一键调用！

[![GitHub Pages](https://img.shields.io/badge/访问官网-https%3A%2F%2Fshuaking.github.io%2Fwork--skills-9f7aea?style=flat&logo=vercel)](https://shuaking.github.io/work-skills)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ 特性
- **随时调用**：一行 `pip install` 即可导入所有技能
- **可视化官网**：https://shuaking.github.io/work-skills（带实时演示）
- **页面自定义技能**：官网上填表单 → 自动生成代码 + 提交 Issue
- **自动同步**：新增技能后，前端卡片自动实时更新 🔄
- **自动部署**：GitHub Actions 一键更新官网
- **持续扩展**：已内置 10 个实用技能（数据/文本/AI/文件/工具）

## 🚀 快速安装（其他项目使用）
```bash
pip install git+https://github.com/shuaking/work-skills.git

📖 使用示例
from skiils import (
    summarize, calculate_stats, generate_prompt,
    simple_ai_chat, save_to_file, get_time
)

print(summarize("这是一篇很长的文章内容，我们来测试摘要功能..."))
print(calculate_stats([10, 20, 30, 40, 50]))
print(generate_prompt("Python 项目最佳实践"))
print(simple_ai_chat("你好 SKIILs！"))
print("当前时间:", get_time())
save_to_file("测试内容", "output.txt")

📋 当前可用技能（10 个）

技能列表会自动从代码中提取并同步到官网！

| 类别 | 技能函数 | 功能描述 |
|------|---------|---------|
| 数据处理 | clean_list | 去重去空 |
| 数据处理 | calculate_stats | 统计均值/总数 |
| 文本处理 | word_count | 字数统计 |
| 文本处理 | summarize | 智能摘要 |
| AI 智能 | generate_prompt | 专业提示词生成 |
| AI 智能 | simple_ai_chat | 模拟智能对话 |
| 文件操作 | list_files | 列出目录文件 |
| 文件操作 | save_to_file | 保存内容到文件 |
| 通用工具 | get_time | 当前时间 |
| 通用工具 | hello_world | 打招呼 |

## 📂 项目结构

```
SKIILs/
├── pyproject.toml
├── src/skiils/          # 可 pip 安装的核心包
│   └── skills/          # 技能模块目录
├── scripts/             # 构建脚本
│   └── generate_skills_json.py  # 自动生成技能元数据
├── docs/                # GitHub Pages 官网
│   ├── index.html       # 前端页面（动态渲染）
│   └── skills.json      # 技能元数据（自动生成）
├── .github/workflows/   # 自动部署工作流
└── README.md
```

## 🔄 自动同步机制

**新增技能后，前端卡片会自动更新！**

### 工作原理

1. **开发者添加新技能**：在 `src/skiils/skills/` 目录创建 `.py` 文件
2. **提交代码**：推送到 `main` 分支
3. **自动构建**：GitHub Actions 运行 `generate_skills_json.py`
4. **生成元数据**：扫描所有技能文件，生成 `docs/skills.json`
5. **前端渲染**：官网从 JSON 动态加载并渲染技能卡片

### 如何添加新技能

```python
# 1. 在 src/skiils/skills/ 创建新文件，如 web.py
def fetch_url(url: str):
    """从 URL 获取内容"""
    import requests
    return requests.get(url).text

# 2. 提交并推送代码
git add src/skiils/skills/web.py
git commit -m "新增 web 技能"
git push

# 3. 等待 GitHub Actions 自动部署（约 1-2 分钟）
# 4. 访问官网，新技能卡片已自动显示！✨
```

### 技能分类规则

脚本会根据文件名自动分类：

- `data.py` → 📊 数据处理技能
- `text.py` → 📝 文本处理技能
- `ai.py` → 🤖 AI 智能技能
- `file.py` → 📁 文件操作技能
- `utils.py` → 🛠️ 通用工具技能

如需添加新类别，编辑 `scripts/generate_skills_json.py` 中的 `CATEGORY_MAP`。

