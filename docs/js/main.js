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
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

  const colors = {
    success: 'linear-gradient(135deg, #00ffff, #00ff00)',
    error: 'linear-gradient(135deg, #ff00ff, #ff0000)',
    info: 'linear-gradient(135deg, #00ffff, #ff00ff)'
  };

  const durations = {
    success: 3000,
    info: 5000,
    error: 7000
  };

  toast.style.background = colors[type] || colors.success;

  // 图标
  const icon = document.createElement('i');
  icon.className = `fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}`;
  icon.setAttribute('aria-hidden', 'true');
  toast.appendChild(icon);

  // 消息文本
  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  toast.appendChild(messageSpan);

  // 关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.setAttribute('aria-label', '关闭通知');
  closeBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
  closeBtn.onclick = () => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  };
  toast.appendChild(closeBtn);

  document.body.appendChild(toast);

  // 自动关闭
  const duration = durations[type] || 3000;
  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
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
  const resultElement = document.getElementById('demoResult');
  resultElement.innerHTML = '<strong class="text-cyan-400">📋 摘要结果：</strong><br>';
  const resultSpan = document.createElement('span');
  resultSpan.className = 'text-white';
  resultSpan.textContent = result;
  resultElement.appendChild(resultSpan);
  showToast('摘要生成成功！');
};

window.generateAIPrompt = function() {
  const topic = document.getElementById('aiTopic').value.trim();
  if (!topic) {
    showToast('请输入主题！', 'error');
    return;
  }
  const resultElement = document.getElementById('aiDemoResult');
  resultElement.innerHTML = '<strong class="text-magenta-400">🤖 生成的提示词：</strong><br><br>';

  const promptText = document.createElement('span');
  promptText.textContent = `你是一个世界级专家。请详细讲解「${topic}」...`;
  resultElement.appendChild(promptText);

  const callInfo = document.createElement('small');
  callInfo.className = 'text-cyan-400';
  callInfo.textContent = `（真实调用：generate_prompt("${topic}")）`;
  resultElement.appendChild(document.createElement('br'));
  resultElement.appendChild(document.createElement('br'));
  resultElement.appendChild(callInfo);

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

  // 使用 DOM 方法构建结果，避免 XSS
  const resultContent = document.getElementById('resultContent');
  resultContent.innerHTML = '';

  // 创建预览容器
  const previewDiv = document.createElement('div');
  previewDiv.className = 'bg-black/50 p-4 rounded-xl max-h-80 overflow-auto border border-cyan-500/30';
  const pre = document.createElement('pre');
  pre.className = 'text-cyan-400 text-xs whitespace-pre-wrap';
  pre.textContent = skillMd;
  previewDiv.appendChild(pre);
  resultContent.appendChild(previewDiv);

  // 创建按钮组
  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'flex gap-2 mt-4';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'flex-1 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 py-3 rounded-xl font-semibold text-xs transition-all';
  copyBtn.textContent = '📋 复制';
  copyBtn.onclick = copySkillMd;

  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'flex-1 bg-magenta-600/20 hover:bg-magenta-600/40 border border-magenta-500/50 text-magenta-300 py-3 rounded-xl font-semibold text-xs transition-all';
  downloadBtn.textContent = '💾 下载';
  downloadBtn.onclick = () => downloadSkillMd(skillId);

  const issueBtn = document.createElement('button');
  issueBtn.className = 'flex-1 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/50 text-yellow-300 py-3 rounded-xl font-semibold text-xs transition-all';
  issueBtn.textContent = '🚀 Issue';
  issueBtn.onclick = () => submitSkillIssue(skillId);

  buttonGroup.appendChild(copyBtn);
  buttonGroup.appendChild(downloadBtn);
  buttonGroup.appendChild(issueBtn);
  resultContent.appendChild(buttonGroup);

  // 创建 AI 优化按钮
  const aiOptDiv = document.createElement('div');
  aiOptDiv.className = 'mt-4';
  const aiOptBtn = document.createElement('button');
  aiOptBtn.className = 'w-full bg-gradient-to-r from-cyan-600/30 to-magenta-600/30 hover:from-cyan-600/50 hover:to-magenta-600/50 border border-cyan-500/50 text-white py-3 rounded-xl font-bold text-sm transition-all';
  aiOptBtn.textContent = '✨ AI 优化';
  aiOptBtn.onclick = optimizeSkillWithAI;
  aiOptDiv.appendChild(aiOptBtn);
  resultContent.appendChild(aiOptDiv);

  // 保存到全局变量
  window.currentSkillMd = skillMd;
  window.currentSkillId = skillId;
  window.optimizedSkillMd = null;

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
      <p class="text-gray-400 text-sm mt-2">正在调用 ${escapeHtml(config.model)} 优化内容...</p>
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

    // 使用 DOM 方法构建结果，避免 XSS
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'space-y-4';

    // 标题和版本切换按钮
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between';

    const title = document.createElement('h3');
    title.className = 'text-xl font-bold text-cyan-400';
    title.textContent = '✨ AI 优化完成！';
    header.appendChild(title);

    const btnGroup = document.createElement('div');
    btnGroup.className = 'flex gap-2';

    const btnOriginal = document.createElement('button');
    btnOriginal.id = 'btnOriginal';
    btnOriginal.className = 'px-4 py-2 rounded-lg border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 transition-all';
    btnOriginal.textContent = '原始版本';
    btnOriginal.onclick = () => showVersion('original');

    const btnOptimized = document.createElement('button');
    btnOptimized.id = 'btnOptimized';
    btnOptimized.className = 'px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600/30 to-magenta-600/30 border border-cyan-500/50 text-white transition-all';
    btnOptimized.textContent = '优化版本';
    btnOptimized.onclick = () => showVersion('optimized');

    btnGroup.appendChild(btnOriginal);
    btnGroup.appendChild(btnOptimized);
    header.appendChild(btnGroup);
    container.appendChild(header);

    // 版本内容显示区域
    const versionContent = document.createElement('div');
    versionContent.id = 'versionContent';
    versionContent.className = 'glass-card p-6 rounded-xl';
    const pre = document.createElement('pre');
    pre.className = 'text-sm text-gray-300 whitespace-pre-wrap font-mono';
    pre.textContent = optimizedMd;
    versionContent.appendChild(pre);
    container.appendChild(versionContent);

    // 操作按钮组
    const actionBtns = document.createElement('div');
    actionBtns.className = 'flex flex-wrap gap-3';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'flex-1 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-white py-3 rounded-xl font-bold text-sm transition-all';
    copyBtn.textContent = '📋 复制优化版';
    copyBtn.onclick = copyOptimizedSkillMd;

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'flex-1 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-white py-3 rounded-xl font-bold text-sm transition-all';
    downloadBtn.textContent = '💾 下载优化版';
    downloadBtn.onclick = downloadOptimizedSkillMd;

    const issueBtn = document.createElement('button');
    issueBtn.className = 'flex-1 bg-gradient-to-r from-cyan-600/30 to-magenta-600/30 hover:from-cyan-600/50 hover:to-magenta-600/50 border border-cyan-500/50 text-white py-3 rounded-xl font-bold text-sm transition-all';
    issueBtn.textContent = '🚀 提交 Issue (使用优化版)';
    issueBtn.onclick = () => submitSkillIssue(window.currentSkillId);

    actionBtns.appendChild(copyBtn);
    actionBtns.appendChild(downloadBtn);
    actionBtns.appendChild(issueBtn);
    container.appendChild(actionBtns);

    // 返回原始版本链接
    const backLink = document.createElement('div');
    backLink.className = 'text-center';
    const backBtn = document.createElement('button');
    backBtn.className = 'text-gray-400 hover:text-cyan-400 text-sm underline transition-all';
    backBtn.textContent = '↩️ 使用原始版本';
    backBtn.onclick = useOriginalVersion;
    backLink.appendChild(backBtn);
    container.appendChild(backLink);

    resultContent.appendChild(container);
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
  const versionContent = document.getElementById('versionContent');
  versionContent.innerHTML = '';

  const pre = document.createElement('pre');
  pre.className = 'text-sm text-gray-300 whitespace-pre-wrap font-mono';
  pre.textContent = content;
  versionContent.appendChild(pre);

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

  // 显示部署模式
  const deploymentModeEl = document.getElementById('deploymentMode');
  if (deploymentModeEl) {
    const config = configManager.loadConfig();
    const isProxy = config.apiEndpoint.includes('/api/openai-proxy');
    if (isProxy) {
      deploymentModeEl.innerHTML = '<strong class="text-green-400">✓ Vercel 部署（AI 功能已启用）</strong>';
    } else {
      deploymentModeEl.innerHTML = '<strong class="text-yellow-400">GitHub Pages（AI 功能受限）</strong>';
    }
  }

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
