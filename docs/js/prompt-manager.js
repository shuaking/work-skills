// ========== Prompt 管理器模块 ==========
export class PromptManager {
  constructor() {
    this.templates = {
      professional: `你是一个技术文档专家。请优化以下 Claude Code Skill 的 SKILL.md 内容。

优化要求：
1. 保持 YAML frontmatter (name, description) 不变
2. 润色 Overview 部分，使其更专业、清晰
3. 改进 Usage 部分，添加具体步骤
4. 在 Examples 部分补充 2-3 个实用代码示例
5. 在 Notes 部分添加注意事项和最佳实践
6. 保持 Markdown 格式规范

请直接输出优化后的完整 SKILL.md 内容，不要添加任何解释。`,

      examples: `你是一个技术文档专家。请为以下 SKILL.md 的 Examples 部分补充 3-5 个实用的代码示例。

要求：
- 示例要具体、可运行
- 覆盖常见使用场景
- 包含代码注释
- 展示不同参数组合

请输出完整的 SKILL.md，只修改 Examples 部分。`,

      simplify: `你是一个技术文档专家。请简化以下 SKILL.md 的描述，使其更易理解。

要求：
- 使用简单直白的语言
- 去除冗余和重复内容
- 保持核心信息完整
- 适合初学者阅读

请输出完整的优化后 SKILL.md。`,

      custom: ''
    };
  }

  getTemplate(name) {
    return this.templates[name] || this.templates.professional;
  }

  setCustomTemplate(content) {
    this.templates.custom = content;
  }

  renderTemplate(name, variables) {
    let template = this.getTemplate(name);

    // 变量替换
    Object.keys(variables).forEach(key => {
      const placeholder = `{${key}}`;
      template = template.replace(new RegExp(placeholder, 'g'), variables[key] || '');
    });

    return template;
  }

  getTemplateNames() {
    return Object.keys(this.templates).filter(name => name !== 'custom');
  }
}
