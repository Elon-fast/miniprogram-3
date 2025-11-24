// index.js
/**
 * 主页 - Smart Grade System
 * 包含：班级选择器、用户信息展示、功能模块导航、数据概览（含待办、班会）
 */
import { get } from '../../utils/api.js';

Page({
  data: {
    statusBarHeight: 20,
    
    // 班级列表
    classList: [],
    currentClassIndex: 0,
    currentClass: '',
    
    // 用户信息
    userInfo: {
      avatarUrl: '/images/teacher.png',
      nickName: '张老师' 
    },
    hasUserInfo: true,
    
    // 日期信息
    currentDate: '',
    currentWeek: '',
    
    // 功能模块列表
    modules: [],
    
    // 仪表盘数据
    dashboardData: [
      { id: 1, type: 'student_count', title: '学生总数', value: '45', unit: '人', icon: '👨‍🎓', color: '#1890ff' },
      { id: 2, type: 'todo', title: '待处理', value: '0', unit: '项', icon: '📝', color: '#faad14' },
      { id: 3, type: 'meeting', title: '本周班会', value: '未设置', unit: '', icon: '📅', color: '#52c41a' }
    ],

    // 待办事项相关
    showTodoModal: false,
    todoList: [],
    todoInputValue: '',

    // 班会时间本地存储 Key (与班级关联)
    classMeetingKey: 'class_meeting_schedule'
  },

  onLoad(options) {
    this.initDate();
    this.initData();
  },

  /**
   * 初始化日期
   */
  initDate() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const week = weeks[now.getDay()];
    
    this.setData({
      currentDate: `${month}月${day}日`,
      currentWeek: week
    });
  },

  async initData() {
    try {
      await Promise.all([
        this.loadClassList(),
        this.loadUserInfo(),
        this.loadModules()
      ]);
      // 加载本地存储的待办事项（过滤掉上次已标记完成的）
      this.loadTodos(); 
    } catch (error) {
      console.error('页面数据初始化失败:', error);
    }
  },

  // --- 班级 & 用户 & 模块加载 ---
  async loadClassList() {
    try {
      const res = await get('/api/class/list');
      if (res.code === 200 && res.data && res.data.length > 0) {
        this.setData({
          classList: res.data,
          currentClass: res.data[0]
        });
        const app = getApp();
        if (app && app.globalData) {
          app.globalData.currentClass = res.data[0];
        }
        // 加载班会信息
        this.loadClassMeeting(res.data[0]);
      }
    } catch (error) {
      console.error('班级列表加载失败:', error);
    }
  },

  async loadUserInfo() {
    try {
      const res = await get('/api/user/info');
      if (res.code === 200 && res.data) {
        this.setData({
          userInfo: res.data,
          hasUserInfo: true
        });
      }
    } catch (error) {
      console.error('用户信息加载失败:', error);
    }
  },

  async loadModules() {
    try {
      const res = await get('/api/modules/list');
      if (res.code === 200 && res.data) {
        const styledModules = res.data.map((m, index) => ({
          ...m,
          color: ['#40a9ff', '#ff85c0', '#5cdbd3'][index % 3] || '#1890ff',
          bg: ['#e6f7ff', '#fff0f6', '#e6fffb'][index % 3] || '#f0f5ff'
        }));
        
        this.setData({ modules: styledModules });
      }
    } catch (error) {
      console.error('功能模块加载失败:', error);
    }
  },

  onClassChange(e) {
    const index = parseInt(e.detail.value);
    const selectedClass = this.data.classList[index];
    
    this.setData({
      currentClassIndex: index,
      currentClass: selectedClass
    });
    
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.currentClass = selectedClass;
    }

    // 切换班级时，刷新班会时间
    this.loadClassMeeting(selectedClass);
  },

  navigateToModule(e) {
    const { path } = e.currentTarget.dataset;
    if (path) {
      wx.navigateTo({
        url: path,
        fail: err => {
          wx.switchTab({ url: path });
        }
      });
    }
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      }
    });
  },

  // --- Dashboard 交互逻辑 ---
  onDashboardItemClick(e) {
    const type = e.currentTarget.dataset.type;
    if (type === 'todo') {
      this.openTodoModal();
    } else if (type === 'meeting') {
      this.showMeetingActionSheet();
    }
  },

  // --- 待办事项逻辑 ---
  loadTodos() {
    // 读取时，过滤掉上次已完成的（completed: true）
    const rawTodos = wx.getStorageSync('local_todos') || [];
    const activeTodos = rawTodos.filter(t => !t.completed);
    
    // 如果过滤后数量有变化，说明清理了旧数据，顺便更新一下 Storage
    if (activeTodos.length !== rawTodos.length) {
      wx.setStorageSync('local_todos', activeTodos);
    }

    this.setData({
      todoList: activeTodos
    });
    this.updateTodoCount();
  },

  openTodoModal() {
    this.setData({ showTodoModal: true });
  },

  closeTodoModal() {
    // 关闭时，清理界面，并保存当前状态（包含已完成的）到 Storage
    // 下次 loadTodos 时会清理掉 completed: true 的项
    wx.setStorageSync('local_todos', this.data.todoList);
    this.setData({ showTodoModal: false });
    
    // 更新首页显示的计数 (只统计未完成)
    this.updateTodoCount();
  },

  updateTodoCount() {
    const pendingCount = this.data.todoList.filter(t => !t.completed).length;
    const newData = this.data.dashboardData.map(item => {
      if (item.type === 'todo') {
        return { ...item, value: String(pendingCount) };
      }
      return item;
    });
    this.setData({ dashboardData: newData });
  },

  onTodoInput(e) {
    this.setData({ todoInputValue: e.detail.value });
  },

  addTodo() {
    const text = this.data.todoInputValue.trim();
    if (!text) return;

    const newTodo = {
      id: Date.now(), // 简单生成 ID
      text: text,
      completed: false
    };

    const newList = [newTodo, ...this.data.todoList];
    this.setData({
      todoList: newList,
      todoInputValue: ''
    });
    
    // 实时保存
    wx.setStorageSync('local_todos', newList);
  },

  toggleTodo(e) {
    const index = e.currentTarget.dataset.index;
    const list = this.data.todoList;
    // 切换状态
    list[index].completed = !list[index].completed;
    
    this.setData({ todoList: list });
    // 实时保存 (保留状态)
    wx.setStorageSync('local_todos', list);
  },

  deleteTodo(e) {
    const index = e.currentTarget.dataset.index;
    const list = this.data.todoList;
    list.splice(index, 1); // 移除
    
    this.setData({ todoList: list });
    wx.setStorageSync('local_todos', list);
  },

  catchTap() {
    // 阻止点击弹窗内容时关闭弹窗
  },

  // --- 班会时间逻辑 ---
  loadClassMeeting(className) {
    if (!className) return;
    
    const schedules = wx.getStorageSync(this.data.classMeetingKey) || {};
    const meetingDay = schedules[className] || '周三'; // 默认周三
    
    const newData = this.data.dashboardData.map(item => {
      if (item.type === 'meeting') {
        return { ...item, value: meetingDay };
      }
      return item;
    });
    
    this.setData({ dashboardData: newData });
  },

  showMeetingActionSheet() {
    const days = ['周一', '周二', '周三', '周四', '周五'];
    wx.showActionSheet({
      itemList: days,
      success: (res) => {
        const selectedDay = days[res.tapIndex];
        this.updateClassMeeting(selectedDay);
      },
      fail: (res) => {
        console.log(res.errMsg);
      }
    });
  },

  updateClassMeeting(day) {
    const className = this.data.currentClass;
    if (!className) return;

    // 更新本地存储
    const schedules = wx.getStorageSync(this.data.classMeetingKey) || {};
    schedules[className] = day;
    wx.setStorageSync(this.data.classMeetingKey, schedules);

    // 更新 UI
    const newData = this.data.dashboardData.map(item => {
      if (item.type === 'meeting') {
        return { ...item, value: day };
      }
      return item;
    });
    this.setData({ dashboardData: newData });
    
    wx.showToast({ title: '设置成功', icon: 'success' });
  }
})
