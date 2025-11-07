// app.js
/**
 * Smart_Grade_System 教师端班级管理工具
 * 小程序入口文件
 */
App({
  /**
   * 小程序初始化完成时触发（全局只触发一次）
   */
  onLaunch() {
    console.log('Smart Grade System 启动');
    
    // 登录（后续可对接真实登录接口）
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('登录成功，code:', res.code);
      },
      fail: err => {
        console.error('登录失败:', err);
      }
    });
  },

  /**
   * 小程序显示时触发
   */
  onShow() {
    console.log('小程序显示');
  },

  /**
   * 小程序隐藏时触发
   */
  onHide() {
    console.log('小程序隐藏');
  },

  /**
   * 全局数据
   */
  globalData: {
    userInfo: null,
    currentClass: null // 当前选中的班级
  }
})
