const passwordGen = require('../../utils/password.js');
const app = getApp();

Page({
  data: {
    keyword: '',
    label: '',
    seed: '520',
    description: '',
    currentPassword: '',
    passwordMeta: null,
    strength: null,
    isSaved: false
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onLabelInput(e) {
    this.setData({ label: e.detail.value });
  },

  onSeedInput(e) {
    // 只保留数字
    const value = e.detail.value.replace(/\D/g, '');
    this.setData({ seed: value });
  },

  onDescriptionInput(e) {
    this.setData({ description: e.detail.value });
  },

  // 生成密码
  onGenerate() {
    const { keyword, label, seed, description } = this.data;

    if (!keyword.trim()) {
      wx.showToast({ title: '请输入关键词', icon: 'none' });
      return;
    }

    if (!label.trim()) {
      wx.showToast({ title: '请输入标签', icon: 'none' });
      return;
    }

    if (!seed.trim()) {
      wx.showToast({ title: '请输入种子', icon: 'none' });
      return;
    }

    const result = passwordGen.generatePassword({
      keyword: keyword.trim(),
      label: label.trim(),
      seed: seed.trim()
    });

    if (result.success) {
      const strength = passwordGen.evaluateStrength(result.password);
      this.setData({
        currentPassword: result.password,
        passwordMeta: result.meta,
        strength,
        isSaved: false
      });
    } else {
      wx.showToast({ title: result.message, icon: 'none' });
    }
  },

  // 复制密码
  onCopy() {
    if (!this.data.currentPassword) {
      wx.showToast({ title: '请先生成密码', icon: 'none' });
      return;
    }

    wx.setClipboardData({
      data: this.data.currentPassword,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板' });
      }
    });
  },

  // 保存密码记录
  onSave() {
    const { currentPassword, passwordMeta, label, description, keyword, seed, isSaved } = this.data;

    if (!currentPassword) {
      wx.showToast({ title: '请先生成密码', icon: 'none' });
      return;
    }

    if (isSaved) {
      wx.showToast({ title: '已保存', icon: 'none' });
      return;
    }

    const success = app.savePasswordRecord({
      label: label.trim(),
      description: description.trim(),
      keyword: keyword.trim(),
      seed: seed.trim(),
      password: currentPassword,
      meta: passwordMeta
    });

    if (success) {
      this.setData({ isSaved: true });
      wx.showToast({ title: '已保存到本地' });
    } else {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  // 查看历史记录
  onViewHistory() {
    wx.navigateTo({
      url: '/pages/list/list'
    });
  },

  // 显示键盘映射
  onShowKeyboard() {
    wx.showModal({
      title: '键盘第一行映射',
      content: '1→!  2→@  3→#  4→$\n5→%  6→^  7→&  8→*\n9→(  0→)\n\n种子 520 → 5%2@0)',
      showCancel: false,
      confirmText: '知道了'
    });
  }
});
