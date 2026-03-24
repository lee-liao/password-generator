App({
  globalData: {
    storageKey: 'pwd_records_v1'
  },

  onLaunch() {
    // 检查本地存储是否可用
    try {
      const res = wx.getStorageSync(this.globalData.storageKey);
      if (!res) {
        wx.setStorageSync(this.globalData.storageKey, []);
      }
    } catch (e) {
      console.error('Storage check failed:', e);
    }
  },

  // 获取保存的密码记录
  getPasswordRecords() {
    try {
      return wx.getStorageSync(this.globalData.storageKey) || [];
    } catch (e) {
      return [];
    }
  },

  // 保存密码记录
  savePasswordRecord(record) {
    try {
      const records = this.getPasswordRecords();
      record.createdAt = new Date().getTime();
      record.id = Date.now().toString(36) + Math.random().toString(36).substr(2);

      // 检查是否已存在相同的标签和关键词
      const existingIndex = records.findIndex(
        r => r.label === record.label && r.keyword === record.keyword
      );

      if (existingIndex >= 0) {
        records[existingIndex] = record;
      } else {
        records.unshift(record);
      }

      // 最多保存100条记录
      if (records.length > 100) {
        records.length = 100;
      }

      wx.setStorageSync(this.globalData.storageKey, records);
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  },

  // 删除密码记录
  deletePasswordRecord(id) {
    try {
      const records = this.getPasswordRecords();
      const newRecords = records.filter(r => r.id !== id);
      wx.setStorageSync(this.globalData.storageKey, newRecords);
      return true;
    } catch (e) {
      return false;
    }
  }
})
