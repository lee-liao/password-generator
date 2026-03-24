const app = getApp();

Page({
  data: {
    records: [],
    searchKeyword: '',
    filteredRecords: [],
    showDetail: false,
    currentRecord: null
  },

  onLoad() {
    this.loadRecords();
  },

  onShow() {
    this.loadRecords();
  },

  loadRecords() {
    const records = app.getPasswordRecords();
    // 为每条记录提取URL
    const recordsWithUrls = records.map(r => this.extractUrls(r));
    this.setData({
      records: recordsWithUrls,
      filteredRecords: recordsWithUrls
    });
  },

  // 从描述中提取URL
  extractUrls(record) {
    const urls = [];
    if (!record.description) return { ...record, urls: [] };

    // 匹配 http:// 或 https:// 开头的URL
    const urlRegex = /(https?:\/\/[^\s，。！？；：\)\]\}]+)/g;
    let match;
    while ((match = urlRegex.exec(record.description)) !== null) {
      urls.push(match[1]);
    }

    return { ...record, urls: urls };
  },

  onSearchInput(e) {
    const keyword = e.detail.value.toLowerCase();
    const filtered = this.data.records.filter(r =>
      r.label.toLowerCase().includes(keyword)
    );
    this.setData({
      searchKeyword: keyword,
      filteredRecords: filtered
    });
  },

  // 查看详情
  onViewDetail(e) {
    const id = e.currentTarget.dataset.id;
    const record = this.data.records.find(r => r.id === id);
    if (record) {
      this.setData({
        currentRecord: record,
        showDetail: true
      });
    }
  },

  onCloseDetail() {
    this.setData({
      showDetail: false,
      currentRecord: null
    });
  },

  onStopPropagation() {
    // 阻止点击弹窗内容时关闭
  },

  // 复制密码
  onCopyPassword() {
    if (!this.data.currentRecord) return;

    wx.setClipboardData({
      data: this.data.currentRecord.password,
      success: () => {
        wx.showToast({ title: '已复制' });
      }
    });
  },

  // 打开URL
  onOpenUrl(e) {
    const url = e.currentTarget.dataset.url;
    wx.showModal({
      title: '打开链接',
      content: `是否打开：${url}`,
      success: (res) => {
        if (res.confirm) {
          // 复制URL（小程序不能直接跳转外部链接）
          wx.setClipboardData({
            data: url,
            success: () => {
              wx.showToast({ title: '链接已复制，请在外部浏览器打开' });
            }
          });
        }
      }
    });
  },

  // 删除记录
  onDeleteRecord() {
    if (!this.data.currentRecord) return;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          const success = app.deletePasswordRecord(this.data.currentRecord.id);
          if (success) {
            wx.showToast({ title: '已删除' });
            this.onCloseDetail();
            this.loadRecords();
          }
        }
      }
    });
  },

  onAddNew() {
    wx.navigateBack();
  }
});
