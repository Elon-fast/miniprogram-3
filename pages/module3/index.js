// module3/index.js - 班委胜任力模型模块
import { get } from '../../utils/api.js';
import { recommendClassLeaders, getBestCandidatesForEachPosition, LEADER_POSITIONS } from '../../utils/classLeaderRecommendation.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '班委胜任力模型',
    loading: false,
    students: [],
    recommendations: [],
    positionCandidates: null,
    selectedView: 'students', // 'students' 或 'positions'
    selectedStudent: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadData();
  },

  /**
   * 加载学生数据并生成推荐
   */
  async loadData() {
    this.setData({ loading: true });
    
    try {
      const res = await get('/api/module3/students');
      if (res.code === 200 && res.data) {
        this.setData({
          students: res.data
        });
        
        // 生成推荐结果
        this.generateRecommendations();
      }
    } catch (error) {
      console.error('数据加载失败:', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 生成班委推荐结果
   */
  generateRecommendations() {
    if (this.data.students.length === 0) {
      return;
    }
    
    try {
      // 为所有学生生成推荐
      const recommendations = recommendClassLeaders(this.data.students);
      
      // 为每个岗位生成最佳候选人
      const positionCandidates = getBestCandidatesForEachPosition(recommendations);
      
      this.setData({
        recommendations: recommendations,
        positionCandidates: positionCandidates
      });
      
      console.log('班委推荐生成成功:', recommendations);
    } catch (error) {
      console.error('推荐生成失败:', error);
      wx.showToast({
        title: '生成失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 切换视图
   */
  switchView(e) {
    const view = e.currentTarget.dataset.view;
    this.setData({
      selectedView: view
    });
  },

  /**
   * 查看学生详情
   */
  viewStudentDetail(e) {
    const index = e.currentTarget.dataset.index;
    const student = this.data.recommendations[index];
    this.setData({
      selectedStudent: student
    });
  },

  /**
   * 关闭学生详情
   */
  closeStudentDetail() {
    this.setData({
      selectedStudent: null
    });
  },

  /**
   * 阻止事件冒泡（用于弹窗）
   */
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
});
