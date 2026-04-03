// ========== 技能加载与展示模块 ==========
export class SkillsManager {
  constructor() {
    this.skillsData = [];
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

      // 渲染技能卡片
      this.renderSkillCards(container);

    } catch (error) {
      console.error('Load skills error:', error);
      container.innerHTML = `
        <div class="col-span-full text-center text-red-400">
          <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
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

      const skillsList = category.skills.map(skill =>
        `<li class="flex items-center gap-2">
          <i class="fas fa-check text-${category.color}-400 text-xs"></i>
          ${this.escapeHtml(skill.name)}
        </li>`
      ).join('');

      card.innerHTML = `
        <div class="text-4xl mb-4 skill-icon">${category.icon}</div>
        <h4 class="text-xl font-semibold mb-3 text-${category.color}-300">${this.escapeHtml(category.category)}</h4>
        <ul class="space-y-2 text-sm text-gray-300">
          ${skillsList}
        </ul>
      `;

      // 添加点击事件显示详情
      card.addEventListener('click', () => {
        this.showSkillDetails(category);
      });

      container.appendChild(card);
    });
  }

  showSkillDetails(category) {
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
  }

  closeSkillDetails() {
    const modal = document.getElementById('skillDetailsModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
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
