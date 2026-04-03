// ========== 技能加载与展示模块 ==========
export class SkillsManager {
  constructor() {
    this.skillsData = [];
    this.previousFocusElement = null;
  }

  async loadSkills() {
    const container = document.getElementById('skillsContainer');
    const title = document.getElementById('skillsTitle');

    try {
      const response = await fetch('skills.json');
      if (!response.ok) throw new Error('Failed to load skills.json');

      this.skillsData = await response.json();
      const totalSkills = this.skillsData.reduce((sum, cat) => sum + cat.skills.length, 0);

      // 更新标题
      title.textContent = `当前可用技能（已上线 ${totalSkills} 个）`;

      // 清空容器
      container.innerHTML = '';

      // 移除加载状态
      container.setAttribute('aria-busy', 'false');

      // 渲染技能卡片
      this.renderSkillCards(container);

    } catch (error) {
      console.error('Load skills error:', error);
      container.setAttribute('aria-busy', 'false');
      container.innerHTML = `
        <div class="col-span-full text-center text-red-400" role="alert">
          <i class="fas fa-exclamation-triangle text-4xl mb-4" aria-hidden="true"></i>
          <p>加载技能数据失败，请刷新页面重试</p>
        </div>
      `;
      this.showToast('加载技能数据失败', 'error');
    }
  }

  renderSkillCards(container) {
    this.skillsData.forEach(category => {
      const card = document.createElement('div');
      card.className = `glass-card rounded-2xl p-6 border-${category.color}-500/30 cursor-pointer hover:scale-105 transition-transform`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `查看 ${category.category} 类别的 ${category.skills.length} 个技能详情`);

      const skillsList = category.skills.map(skill =>
        `<li class="flex items-center gap-2">
          <i class="fas fa-check text-${category.color}-400 text-xs" aria-hidden="true"></i>
          ${this.escapeHtml(skill.name)}
        </li>`
      ).join('');

      card.innerHTML = `
        <div class="text-4xl mb-4 skill-icon" aria-hidden="true">${category.icon}</div>
        <h4 class="text-xl font-semibold mb-3 text-${category.color}-300">${this.escapeHtml(category.category)}</h4>
        <ul class="space-y-2 text-sm text-gray-300">
          ${skillsList}
        </ul>
      `;

      // 添加点击和键盘事件
      const handleActivation = () => {
        this.showSkillDetails(category);
      };

      card.addEventListener('click', handleActivation);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleActivation();
        }
      });

      container.appendChild(card);
    });
  }

  showSkillDetails(category) {
    // 保存当前焦点
    this.previousFocusElement = document.activeElement;

    const modal = document.getElementById('skillDetailsModal');
    const icon = document.getElementById('skillDetailsIcon');
    const categoryName = document.getElementById('skillDetailsCategory');
    const count = document.getElementById('skillDetailsCount');
    const list = document.getElementById('skillDetailsList');

    // 设置标题信息
    icon.textContent = category.icon;
    categoryName.textContent = category.category;
    count.textContent = `共 ${category.skills.length} 个技能`;

    // 渲染技能列表
    list.innerHTML = category.skills.map(skill => `
      <div class="glass-card rounded-xl p-4 border-${category.color}-500/20">
        <h3 class="text-lg font-semibold text-${category.color}-300 mb-2">
          <i class="fas fa-code text-sm mr-2"></i>${this.escapeHtml(skill.name)}
        </h3>
        <p class="text-sm text-gray-300">${this.escapeHtml(skill.description)}</p>
      </div>
    `).join('');

    // 显示模态框
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // 应用焦点陷阱
    this.trapFocus(modal);
  }

  closeSkillDetails() {
    const modal = document.getElementById('skillDetailsModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');

    // 恢复焦点
    if (this.previousFocusElement) {
      this.previousFocusElement.focus();
      this.previousFocusElement = null;
    }
  }

  trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
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
    };

    modal.addEventListener('keydown', handleTabKey);

    // 自动聚焦第一个元素
    if (firstElement) {
      firstElement.focus();
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showToast(message, type = 'success') {
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
}
