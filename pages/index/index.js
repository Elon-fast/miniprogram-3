// index.js
/**
 * 主页 - Smart Grade System
 * 包含：班级选择器、用户信息展示、功能模块导航
 */
import { get } from '../../utils/api.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 班级列表
    classList: [],
    currentClassIndex: 0, // 当前选中的班级索引，默认第一项
    currentClass: '', // 当前选中的班级名称
    
    // 用户信息
    userInfo: {
      avatarUrl: '',
      nickName: ''
    },
    hasUserInfo: false,
    
    // 功能模块列表
    modules: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 初始化数据
    this.initData();
  },

  /**
   * 初始化页面数据
   */
  async initData() {
    try {
      // 并行加载班级列表、用户信息、功能模块
      await Promise.all([
        this.loadClassList(),
        this.loadUserInfo(),
        this.loadModules()
      ]);
    } catch (error) {
      console.error('页面数据初始化失败:', error);
    }
  },

  /**
   * 加载班级列表
   */
  async loadClassList() {
    try {
      const res = await get('/api/class/list');
      if (res.code === 200 && res.data && res.data.length > 0) {
        this.setData({
          classList: res.data,
          currentClass: res.data[0] // 默认选中第一项
        });
        // 更新全局数据
        const app = getApp();
        app.globalData.currentClass = res.data[0];
        console.log('班级列表加载成功:', res.data);
      }
    } catch (error) {
      console.error('班级列表加载失败:', error);
    }
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      const res = await get('/api/user/info');
      if (res.code === 200 && res.data) {
        this.setData({
          userInfo: res.data,
          hasUserInfo: true
        });
        console.log('用户信息加载成功:', res.data);
      }
    } catch (error) {
      console.error('用户信息加载失败:', error);
    }
  },

  /**
   * 加载功能模块列表
   */
  async loadModules() {
    try {
      const res = await get('/api/modules/list');
      if (res.code === 200 && res.data) {
        this.setData({
          modules: res.data
        });
        console.log('功能模块加载成功:', res.data);
      }
    } catch (error) {
      console.error('功能模块加载失败:', error);
    }
  },

  /**
   * 班级选择器改变事件
   * @param {Object} e 事件对象
   */
  onClassChange(e) {
    const index = parseInt(e.detail.value);
    const selectedClass = this.data.classList[index];
    
    this.setData({
      currentClassIndex: index,
      currentClass: selectedClass
    });
    
    // 更新全局数据
    const app = getApp();
    app.globalData.currentClass = selectedClass;
    
    console.log('班级切换:', selectedClass);
    
    // 可以在这里触发重新加载该班级的数据
    // this.loadClassData(selectedClass);
  },

  /**
   * 跳转到功能模块页面
   * @param {Object} e 事件对象
   */
  navigateToModule(e) {
    const { path } = e.currentTarget.dataset;
    if (path) {
      wx.navigateTo({
        url: path,
        fail: err => {
          console.error('页面跳转失败:', err);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    }
  },

  /**
   * 获取用户信息（为后续集成wx.getUserProfile预留）
   */
  getUserProfile() {
    // 后续可集成真实的用户信息获取接口
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('获取用户信息成功:', res.userInfo);
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
      }
    });
  }
})
