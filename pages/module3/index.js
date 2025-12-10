// module3/index.js - 班委胜任力模型模块
import { get } from '../../utils/api.js';
import { calculateCadreSuitability, LEADER_POSITIONS } from '../../utils/classLeaderRecommendation.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '班委胜任力模型',
    loading: false,
    students: [],
    positions: [], // 岗位列表
    hasAnyHolder: false, // 状态：是否有任何任职
    
    // 弹窗控制
    showAddPositionModal: false,
    showAppointModal: false,
    selectedStudent: null,
    
    // 新增/编辑岗位数据
    editingPosition: {
      name: '',
      weights: {
        leadership: 35,
        responsibility: 35,
        communication: 15,
        agreeableness: 15
      }
    },
    
    // 能力维度选项 (更新为新维度)
    abilityOptions: [
      { key: 'leadership', name: '领导力潜质' },
      { key: 'responsibility', name: '责任心' },
      { key: 'communication', name: '外向性' },
      { key: 'agreeableness', name: '宜人性' }
    ],

    // 任命相关
    currentAppointingPositionId: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initPositions();
    this.loadData();
  },

  /**
   * 统一更新岗位数据和任职状态
   */
  updatePositionsAndState(positions) {
    const hasAnyHolder = positions && positions.some(p => p.currentHolder);
    this.setData({
      positions,
      hasAnyHolder
    });
  },

  /**
   * 初始化默认岗位
   */
  initPositions() {
    // 将 LEADER_POSITIONS 转换为数组格式，并添加 id 和 mock 的现任班委
    const initialPositions = Object.entries(LEADER_POSITIONS).map(([key, value], index) => ({
      id: `pos_${index}`,
      name: value.name,
      description: value.description,
      // 使用定义的权重
      weights: value.requiredAbilities,
      candidates: [], // 将计算得出的候选人列表
      currentHolder: null // 现任班委
    }));

    // Mock 一些现任班委
    if (initialPositions.length > 0) {
      initialPositions[0].currentHolder = { name: '张小明', id: 's001' }; // 班长
      initialPositions[1].currentHolder = { name: '李小红', id: 's002' }; // 学委
    }

    this.updatePositionsAndState(initialPositions);
  },

  /**
   * 加载学生数据
   */
  async loadData() {
    this.setData({ loading: true });
    
    try {
      const res = await get('/api/module3/students');
      if (res.code === 200 && res.data) {
        this.setData({ students: res.data });
        this.calculateAllRecommendations();
      }
    } catch (error) {
      console.error('数据加载失败:', error);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 计算所有岗位的推荐候选人
   */
  calculateAllRecommendations() {
    const { students, positions } = this.data;
    if (!students.length || !positions.length) return;

    const updatedPositions = positions.map(pos => {
      // 计算每个学生对该岗位的匹配度
      const candidates = students.map(student => {
        // 传入当前岗位的权重
        const finalScore = calculateCadreSuitability(student, pos.weights);
        
        return {
          student: student,
          score: finalScore,
          percentage: Math.round(finalScore)
        };
      });

      // 排序并取前5名
      candidates.sort((a, b) => b.score - a.score);
      
      return {
        ...pos,
        candidates: candidates.slice(0, 5)
      };
    });

    this.updatePositionsAndState(updatedPositions);
  },

  /**
   * 显示添加岗位弹窗
   */
  showAddPosition() {
    this.setData({
      showAddPositionModal: true,
      editingPosition: {
        name: '',
        description: '自定义岗位',
        weights: {
          leadership: 25,
          responsibility: 25,
          communication: 25,
          agreeableness: 25
        }
      }
    });
  },

  /**
   * 关闭添加岗位弹窗
   */
  closeAddPositionModal() {
    this.setData({ showAddPositionModal: false });
  },

  /**
   * 处理岗位名称输入
   */
  onPositionNameInput(e) {
    this.setData({
      'editingPosition.name': e.detail.value
    });
  },

  /**
   * 处理权重滑块变化
   */
  onWeightChange(e) {
    const { key } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`editingPosition.weights.${key}`]: value
    });
  },

  /**
   * 保存新岗位
   */
  saveNewPosition() {
    const { editingPosition, positions } = this.data;
    
    if (!editingPosition.name.trim()) {
      wx.showToast({ title: '请输入岗位名称', icon: 'none' });
      return;
    }

    const newPos = {
      id: `custom_${Date.now()}`,
      name: editingPosition.name,
      description: editingPosition.description || '自定义岗位',
      weights: editingPosition.weights,
      candidates: [],
      currentHolder: null
    };

    const newPositions = [...positions, newPos];
    
    this.updatePositionsAndState(newPositions);
    this.setData({ showAddPositionModal: false });

    // 重新计算推荐
    this.calculateAllRecommendations();
    
    wx.showToast({ title: '添加成功', icon: 'success' });
  },

  /**
   * 显示任命弹窗
   */
  showAppointModal(e) {
    const posId = e.currentTarget.dataset.id;
    this.setData({
      showAppointModal: true,
      currentAppointingPositionId: posId
    });
  },

  /**
   * 关闭任命弹窗
   */
  closeAppointModal() {
    this.setData({ showAppointModal: false, currentAppointingPositionId: null });
  },

  /**
   * 确认任命
   */
  confirmAppoint(e) {
    const student = e.currentTarget.dataset.student;
    const { currentAppointingPositionId, positions } = this.data;

    const updatedPositions = positions.map(pos => {
      if (pos.id === currentAppointingPositionId) {
        return { ...pos, currentHolder: student };
      }
      return pos;
    });

    this.updatePositionsAndState(updatedPositions);
    this.setData({
      showAppointModal: false,
      currentAppointingPositionId: null
    });

    wx.showToast({ title: `已任命${student.name}`, icon: 'success' });
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {}
});
