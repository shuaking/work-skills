// ========== 主入口文件 ==========
import { ConfigManager } from './config-manager.js';
import { AIClient } from './ai-client.js';
import { PromptManager } from './prompt-manager.js';
import { ParticleSystem } from './particles.js';
import { SkillsManager } from './skills.js';

// 配置常量
const GITHUB_USERNAME = 'shuaking';
const REPO_NAME = 'work-skills';

// 全局实例
const configManager = new ConfigManager();
const promptManager = new PromptManager();
const skillsManager = new SkillsManager();
let particleSystem = null;

// 全局变量（用于技能生成）
window.currentSkillMd = null;
window.currentSkillId = null;
window.optimizedSkillMd = null;

// 焦点管理
let previousFocusElement = null;

// 焦点陷阱辅助函数
function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  modal.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });

  // 自动聚焦第一个元素
  if (firstElement) {
    firstElement.focus();
  }
}

// ========== 工具函数 ==========
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast';

  const colors = {
    success: 'linear-gradient(135deg, #00ffff, #00ff00)',
    error: 'linear-gradient(135deg, #ff00ff, #ff0000)',
    info: 'linear-gradient(135deg, #00ffff, #ff00ff)'
  };

  toast.style.background = colors[type] || colors.success;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

const escapeHtmlDiv = document.createElement('div');
function escapeHtml(text) {
  escapeHtmlDiv.textContent = text;
  return escapeHtmlDiv.innerHTML;
}

// ========== 设置面板功能 ==========
window.openSettings = function() {
  // 保存当前焦点
  previousFocusElement = document.activeElement;

  const modal = document.getElementById('settingsModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // 加载当前配置
  const config = configManager.loadConfig();
  document.getElementById('apiEndpoint').value = config.apiEndpoint;
  document.getElementById('apiKey').value = config.apiKey;
  document.getElementById('modelSelect').value = config.model;
  document.getElementById('promptTemplate').value = config.promptTemplate;
  document.getElementById('customPrompt').value = config.customPrompt;

  // 显示/隐藏自定义 Prompt 区域
  onTemplateChange();

  // 应用焦点陷阱
  trapFocus(modal);
};

window.closeSettings = function() {
  const modal = document.getElementById('settingsModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');

  // 恢复焦点
  if (previousFocusElement) {
    previousFocusElement.focus();
    previousFocusElement = null;
  }
};

window.saveSettings = function() {
  const config = {
    apiEndpoint: document.getElementById('apiEndpoint').value.trim(),
    apiKey: document.getElementById('apiKey').value.trim(),
    model: document.getElementById('modelSelect').value,
    promptTemplate: document.getElementById('promptTemplate').value,
    customPrompt: document.getElementById('customPrompt').value
  };

  // 验证配置
  const validation = configManager.validateConfig(config);
  if (!validation.valid) {
    showToast(validation.error, 'error');
    return;
  }

  // 保存配置
  if (configManager.saveConfig(config)) {
    showToast('配置已保存！');
    closeSettings();
  } else {
    showToast('保存配置失败', 'error');
  }
};

window.resetSettings = function() {
  if (confirm('确定要重置为默认配置吗？')) {
    const config = configManager.resetConfig();
    document.getElementById('apiEndpoint').value = config.apiEndpoint;
    document.getElementById('apiKey').value = '';
    document.getElementById('modelSelect').value = config.model;
    document.getElementById('promptTemplate').value = config.promptTemplate;
    document.getElementById('customPrompt').value = '';
    showToast('已重置为默认配置');
  }
};

window.onTemplateChange = function() {
  const template = document.getElementById('promptTemplate').value;
  const customSection = document.getElementById('customPromptSection');

  if (template === 'custom') {
    customSection.classList.remove('hidden');
  } else {
    customSection.classList.add('hidden');
  }
};

window.refreshModels = async function() {
  const config = {
    apiEndpoint: document.getElementById('apiEndpoint').value.trim(),
    apiKey: document.getElementById('apiKey').value.trim(),
    model: document.getElementById('modelSelect').value
  };

  // 验证配置
  const validation = configManager.validateConfig(config);
  if (!validation.valid) {
    showToast(validation.error, 'error');
    return;
  }

  try {
    showToast('正在获取模型列表...', 'info');
    const client = new AIClient(config);
    const models = await client.getModels();

    const select = document.getElementById('modelSelect');
    const fragment = document.createDocumentFragment();

    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.id;
      fragment.appendChild(option);
    });

    select.innerHTML = '';
    select.appendChild(fragment);

    showToast(`已加载 ${models.length} 个模型`);
  } catch (error) {
    showToast(`获取模型列表失败: ${error.message}`, 'error');
  }
};

// ========== 演示功能 ==========
window.runSummarize = function() {
  const text = document.getElementById('textInput').value.trim();
  if (!text) {
    showToast('请先输入文字！', 'error');
    return;
  }
  const result = text.length > 50 ? text.slice(0, 50) + '...' : text;
  document.getElementById('demoResult').innerHTML = `<strong class="text-cyan-400">📋 摘要结果：</strong><br><span class="text-white">${result}</span>`;
  showToast('摘要生成成功！');
};

window.generateAIPrompt = function() {
  const topic = document.getElementById('aiTopic').value.trim();
  if (!topic) {
    showToast('请输入主题！', 'error');
    return;
  }
  const result = `你是一个世界级专家。请详细讲解「${topic}」...`;
  document.getElementById('aiDemoResult').innerHTML = `<strong class="text-magenta-400">🤖 生成的提示词：</strong><br><br>${result}<br><br><small class="text-cyan-400">（真实调用：generate_prompt("${topic}")）</small>`;
  showToast('提示词生成成功！');
};

// ========== 技能生成功能 ==========
window.generateNewSkill = function() {
  const skillId = document.getElementById('skillId').value.trim();
  const shortDesc = document.getElementById('shortDesc').value.trim();
  const overview = document.getElementById('overview').value.trim();
  const usage = document.getElementById('usage').value.trim();

  if (!skillId) {
    showToast('请填写技能 ID！', 'error');
    return;
  }
  if (!shortDesc) {
    showToast('请填写简短描述！', 'error');
    return;
  }

  // 生成 SKILL.md 内容
  const skillMd = `---
name: ${skillId}
description: ${shortDesc}
---

# ${skillId}

## Overview

${overview || '这是一个新的技能，用于...'}

## Usage

${usage || '使用方法：\n\n1. 调用技能\n2. 提供必要的参数\n3. 获取结果'}

## Examples

\`\`\`
示例代码或命令
\`\`\`

## Notes

- 注意事项 1
- 注意事项 2
`;

  const resultHTML = `
    <div class="bg-black/50 p-4 rounded-xl max-h-80 overflow-auto border border-cyan-500/30">
      <pre class="text-cyan-400 text-xs whitespace-pre-wrap">${escapeHtml(skillMd)}</pre>
    </div>
    <div class="flex gap-2 mt-4">
      <button onclick="copySkillMd()" class="flex-1 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 py-3 rounded-xl font-semibold text-xs transition-all">📋 复制</button>
      <button onclick="downloadSkillMd('${skillId}')" class="flex-1 bg-magenta-600/20 hover:bg-magenta-600/40 border border-magenta-500/50 text-magenta-300 py-3 rounded-xl font-semibold text-xs transition-all">💾 下载</button>
      <button onclick="submitSkillIssue('${skillId}')" class="flex-1 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/50 text-yellow-300 py-3 rounded-xl font-semibold text-xs transition-all">🚀 Issue</button>
    </div>
    <div class="mt-4">
      <button onclick="optimizeSkillWithAI()" class="w-full bg-gradient-to-r from-cyan-600/30 to-magenta-600/30 hover:from-cyan-600/50 hover:to-magenta-600/50 border border-cyan-500/50 text-white py-3 rounded-xl font-bold text-sm transition-all">
        ✨ AI 优化
      </button>
    </div>
  `;

  // 保存到全局变量
  window.currentSkillMd = skillMd;
  window.currentSkillId = skillId;
  window.optimizedSkillMd = null;

  document.getElementById('resultContent').innerHTML = resultHTML;
  document.getElementById('resultBox').classList.remove('hidden');
  showToast('SKILL.md 生成成功！');
};

window.copySkillMd = function() {
  if (!window.currentSkillMd) return;
  navigator.clipboard.writeText(window.currentSkillMd);
  showToast('SKILL.md 内容已复制到剪贴板！');
};

window.downloadSkillMd = function(skillId) {
  if (!window.currentSkillMd) return;
  const blob = new Blob([window.currentSkillMd], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SKILL.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('SKILL.md 文件已下载！');
};

window.submitSkillIssue = function(skillId) {
  const title = encodeURIComponent(`新增技能：${skillId}`);
  const skillMdToSubmit = window.optimizedSkillMd || window.currentSkillMd;
  const body = encodeURIComponent(`**新技能请求**\n\n技能 ID: ${skillId}\n\n请查看附件中的 SKILL.md 文件。\n\n---\n\n\`\`\`markdown\n${skillMdToSubmit}\n\`\`\``);
  window.open(`https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/issues/new?title=${title}&body=${body}&labels=new-skill`, '_blank');
  showToast('正在跳转到 GitHub Issue...', 'info');
};

// ========== AI 优化功能 ==========
window.optimizeSkillWithAI = async function() {
  if (!window.currentSkillMd) {
    showToast('没有可优化的 SKILL.md', 'error');
    return;
  }

  const config = configManager.loadConfig();
  const validation = configManager.validateConfig(config);
  if (!validation.valid) {
    showToast(`配置错误: ${validation.error}`, 'error');
    openSettings();
    return;
  }

  if (config.promptTemplate === 'custom' && config.customPrompt) {
    promptManager.setCustomTemplate(config.customPrompt);
  }

  const loadingHTML = `
    <div class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
      <p class="text-cyan-400 text-lg font-bold">🤖 AI 正在优化中...</p>
      <p class="text-gray-400 text-sm mt-2">正在调用 ${config.model} 优化内容...</p>
    </div>
  `;
  document.getElementById('resultContent').innerHTML = loadingHTML;

  try {
    const aiClient = new AIClient(config);
    const systemPrompt = promptManager.renderTemplate(config.promptTemplate, {
      skillMd: window.currentSkillMd,
      skillId: window.currentSkillId
    });

    const optimizedMd = await aiClient.optimizeWithRetry(window.currentSkillMd, systemPrompt);
    window.optimizedSkillMd = optimizedMd;

    const comparisonHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-cyan-400">✨ AI 优化完成！</h3>
          <div class="flex gap-2">
            <button onclick="showVersion('original')" id="btnOriginal" class="px-4 py-2 rounded-lg border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 transition-all">
              原始版本
            </button>
            <button onclick="showVersion('optimized')" id="btnOptimized" class="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600/30 to-magenta-600/30 border border-cyan-500/50 text-white transition-all">
              优化版本
            </button>
          </div>
        </div>

        <div id="versionContent" class="glass-card p-6 rounded-xl">
          <pre class="text-sm text-gray-300 whitespace-pre-wrap font-mono">${escapeHtml(optimizedMd)}</pre>
        </div>

        <div class="flex flex-wrap gap-3">
          <button onclick="copyOptimizedSkillMd()" class="flex-1 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-white py-3 rounded-xl font-bold text-sm transition-all">
            📋 复制优化版
          </button>
          <button onclick="downloadOptimizedSkillMd()" class="flex-1 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-white py-3 rounded-xl font-bold text-sm transition-all">
            💾 下载优化版
          </button>
          <button onclick="submitSkillIssue('${window.currentSkillId}')" class="flex-1 bg-gradient-to-r from-cyan-600/30 to-magenta-600/30 hover:from-cyan-600/50 hover:to-magenta-600/50 border border-cyan-500/50 text-white py-3 rounded-xl font-bold text-sm transition-all">
            🚀 提交 Issue (使用优化版)
          </button>
        </div>

        <div class="text-center">
          <button onclick="useOriginalVersion()" class="text-gray-400 hover:text-cyan-400 text-sm underline transition-all">
            ↩️ 使用原始版本
          </button>
        </div>
      </div>
    `;

    document.getElementById('resultContent').innerHTML = comparisonHTML;
    showToast('AI 优化完成！', 'success');

  } catch (error) {
    console.error('AI 优化失败:', error);

    let errorMessage = 'AI 优化失败';
    if (error.message.includes('401')) {
      errorMessage = 'API Key 无效，请检查配置';
    } else if (error.message.includes('429')) {
      errorMessage = '请求过于频繁，请稍后再试';
    } else if (error.message.includes('500')) {
      errorMessage = 'API 服务错误，请稍后再试';
    } else {
      errorMessage = `优化失败: ${error.message}`;
    }

    showToast(errorMessage, 'error');
    generateNewSkill();
  }
};

window.showVersion = function(version) {
  const content = version === 'original' ? window.currentSkillMd : window.optimizedSkillMd;
  document.getElementById('versionContent').innerHTML = `
    <pre class="text-sm text-gray-300 whitespace-pre-wrap font-mono">${escapeHtml(content)}</pre>
  `;

  const btnOriginal = document.getElementById('btnOriginal');
  const btnOptimized = document.getElementById('btnOptimized');

  const activeClasses = ['bg-gradient-to-r', 'from-cyan-600/30', 'to-magenta-600/30', 'text-white'];
  const inactiveClasses = ['text-cyan-400', 'hover:bg-cyan-500/20'];

  if (version === 'original') {
    btnOriginal.classList.add(...activeClasses);
    btnOriginal.classList.remove(...inactiveClasses);
    btnOptimized.classList.remove(...activeClasses);
    btnOptimized.classList.add(...inactiveClasses);
  } else {
    btnOptimized.classList.add(...activeClasses);
    btnOptimized.classList.remove(...inactiveClasses);
    btnOriginal.classList.remove(...activeClasses);
    btnOriginal.classList.add(...inactiveClasses);
  }
};

window.copyOptimizedSkillMd = function() {
  if (!window.optimizedSkillMd) return;
  navigator.clipboard.writeText(window.optimizedSkillMd);
  showToast('优化版 SKILL.md 已复制到剪贴板！');
};

window.downloadOptimizedSkillMd = function() {
  if (!window.optimizedSkillMd) return;
  const blob = new Blob([window.optimizedSkillMd], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SKILL.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('优化版 SKILL.md 已下载！');
};

window.useOriginalVersion = function() {
  window.optimizedSkillMd = null;
  generateNewSkill();
  showToast('已切换回原始版本', 'info');
};

// ========== 技能详情模态框 ==========
window.closeSkillDetails = function() {
  skillsManager.closeSkillDetails();
};

// ========== 页面初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
  // 设置 GitHub 链接和安装命令
  const repoUrl = `https://github.com/${GITHUB_USERNAME}/${REPO_NAME}`;
  document.getElementById('githubLink').href = repoUrl;
  document.getElementById('installCommand').textContent = `pip install git+${repoUrl}.git`;

  // 初始化粒子系统
  particleSystem = new ParticleSystem('particles');

  // 加载技能数据
  skillsManager.loadSkills();

  // 启动滚动动画
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // 模态框外部点击关闭
  document.addEventListener('click', (e) => {
    const settingsModal = document.getElementById('settingsModal');
    const skillDetailsModal = document.getElementById('skillDetailsModal');

    if (e.target === settingsModal) {
      closeSettings();
    }
    if (e.target === skillDetailsModal) {
      closeSkillDetails();
    }
  });

  // Escape 键关闭模态框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSettings();
      closeSkillDetails();
    }
  });
});

// Tailwind 配置
tailwind.config = { content: ["*"] };
