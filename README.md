# SKIILs

**🚀 SKIILs - 模块化多技能工具库**  
随时可被**任意其他项目**通过 pip 一键调用！

[![GitHub Pages](https://img.shields.io/badge/访问官网-https%3A%2F%2Fshuaking.github.io%2FSKIILs-9f7aea?style=flat&logo=vercel)](https://shuaking.github.io/SKIILs)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ 特性
- **随时调用**：一行 `pip install` 即可导入所有技能
- **可视化官网**：https://shuaking.github.io/SKIILs（带实时演示）
- **页面自定义技能**：官网上填表单 → 自动生成代码 + 提交 Issue
- **自动部署**：GitHub Actions 一键更新官网
- **持续扩展**：已内置 8 个实用技能（数据/文本/AI/文件/工具）

## 🚀 快速安装（其他项目使用）
```bash
pip install git+https://github.com/shuaking/SKIILs.git

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

📋 当前可用技能（8 个）
类别,技能函数,功能描述
数据处理,clean_list,去重去空
数据处理,calculate_stats,统计均值/总数
文本处理,word_count,字数统计
文本处理,summarize,智能摘要
AI 智能,generate_prompt,专业提示词生成
AI 智能,simple_ai_chat,模拟智能对话
文件操作,list_files,列出目录文件
文件操作,save_to_file,保存内容到文件
通用工具,get_time,当前时间
通用工具,hello_world,打招呼

项目结构

SKIILs/
├── pyproject.toml
├── src/skiils/          # 可 pip 安装的核心包
├── docs/                # GitHub Pages 官网
├── .github/workflows/   # 自动部署工作流
└── README.md

