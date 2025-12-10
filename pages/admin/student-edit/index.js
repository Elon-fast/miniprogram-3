// pages/admin/student-edit/index.js
import { studentManager } from '../../../utils/studentManager';

Page({
  data: {
    students: [],
    isEditing: false,
    editingId: null,
    
    // 表单数据
    formData: {
      name: '',
      gender: 'male',
      roles: [],
      scores: {}, // 最新一次考试成绩
      psychologicalData: {},
      friends: []
    },

    // 候选班委职务
    candidateRoles: ['班长', '学习委员', '体育委员', '文艺委员', '劳动委员', '心理委员', '英语课代表', '数学课代表', '语文课代表', '宣传委员'],

    // 科目配置
    subjectKeys: [
      { key: 'chinese', name: '语文' },
      { key: 'math', name: '数学' },
      { key: 'english', name: '英语' },
      { key: 'physics', name: '物理' },
      { key: 'chemistry', name: '化学' },
      { key: 'biology', name: '生物' },
      { key: 'history', name: '历史' },
      { key: 'geography', name: '地理' },
      { key: 'politics', name: '政治' }
    ],

    // 心理测评维度
    psychologicalKeys: [
      { key: 'empathy', name: '同理心' },
      { key: 'expressiveness', name: '表达能力' },
      { key: 'patience', name: '耐心' },
      { key: 'observation', name: '观察力' },
      { key: 'courage', name: '勇气' },
      { key: 'creativity', name: '创造力' }
    ],

    // 搜索相关
    friendSearchKey: '',
    filteredStudents: []
  },

  onShow() {
    this.loadStudents();
  },

  loadStudents() {
    const list = studentManager.getAll();
    this.setData({ 
      students: list,
      filteredStudents: list // 初始时显示所有
    });
  },

  // --- 搜索逻辑 ---
  onFriendSearchInput(e) {
    const key = e.detail.value.trim();
    this.setData({ friendSearchKey: key });
    
    if (!key) {
      this.setData({ filteredStudents: this.data.students });
      return;
    }
    
    const filtered = this.data.students.filter(s => s.name.includes(key));
    this.setData({ filteredStudents: filtered });
  },

  // --- 切换好友选中状态 (替代原有的 checkbox-group bindchange) ---
  toggleFriend(e) {
    const id = e.currentTarget.dataset.id;
    // 禁止选中自己
    if (id === this.data.editingId) return;

    const currentFriends = this.data.formData.friends || [];
    let newFriends;
    
    if (currentFriends.includes(id)) {
      // 移除
      newFriends = currentFriends.filter(fid => fid !== id);
    } else {
      // 添加
      newFriends = [...currentFriends, id];
    }
    
    this.setData({
      'formData.friends': newFriends
    });
  },

  // --- 编辑逻辑 ---
  startAdd() {
    this.setData({
      isEditing: true,
      editingId: null,
      friendSearchKey: '', // 重置搜索
      filteredStudents: this.data.students, // 重置列表
      formData: {
        name: '',
        gender: 'male',
        roles: [],
        scores: this.initEmptyScores(),
        psychologicalData: this.initEmptyPsychological(),
        friends: []
      }
    });
  },

  startEdit(e) {
    const id = e.currentTarget.dataset.id;
    const student = studentManager.getById(id);
    if (!student) return;

    // 获取最新一次考试成绩
    const lastExam = student.exams && student.exams.length > 0 
      ? student.exams[student.exams.length - 1] 
      : { scores: this.initEmptyScores() };

    this.setData({
      isEditing: true,
      editingId: id,
      friendSearchKey: '', // 重置搜索
      filteredStudents: this.data.students, // 重置列表
      formData: {
        name: student.name,
        gender: student.gender,
        roles: student.roles || [],
        scores: { ...lastExam.scores }, // 浅拷贝
        psychologicalData: student.psychologicalData || this.initEmptyPsychological(),
        friends: student.friends || []
      }
    });
  },

  cancelEdit() {
    this.setData({ isEditing: false, editingId: null });
  },

  initEmptyScores() {
    const scores = {};
    this.data.subjectKeys.forEach(sub => scores[sub.key] = 0);
    return scores;
  },

  initEmptyPsychological() {
    const psy = {};
    this.data.psychologicalKeys.forEach(item => psy[item.key] = 50);
    return psy;
  },

  // --- 表单处理 ---
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  onGenderChange(e) {
    this.setData({
      'formData.gender': e.detail.value
    });
  },

  onRolesChange(e) {
    this.setData({
      'formData.roles': e.detail.value
    });
  },

  onFriendsChange(e) {
    this.setData({
      'formData.friends': e.detail.value
    });
  },

  onScoreInput(e) {
    const key = e.currentTarget.dataset.key;
    const value = Number(e.detail.value) || 0;
    this.setData({
      [`formData.scores.${key}`]: value
    });
  },

  onPsychologicalInput(e) {
    const key = e.currentTarget.dataset.key;
    const value = Number(e.detail.value) || 0;
    this.setData({
      [`formData.psychologicalData.${key}`]: value
    });
  },

  // --- 保存 ---
  saveStudent() {
    const { name, gender, roles, scores, psychologicalData, friends } = this.data.formData;
    if (!name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }

    // 计算总分
    const total = Object.values(scores).reduce((a, b) => a + b, 0);

    if (this.data.editingId) {
      // 更新现有学生
      const student = studentManager.getById(this.data.editingId);
      student.name = name;
      student.gender = gender;
      student.roles = roles;
      student.psychologicalData = psychologicalData;
      student.friends = friends;
      
      // 更新最新一次考试 (简化处理: 直接覆盖最后一次)
      if (!student.exams) student.exams = [];
      if (student.exams.length > 0) {
        student.exams[student.exams.length - 1].scores = scores;
        student.exams[student.exams.length - 1].total = total;
      } else {
        student.exams.push({ name: '期末考试', total, scores });
      }

      // 同时更新 behaviorData 里的平均分（为了兼容旧逻辑）
      if (!student.behaviorData) student.behaviorData = {};
      student.behaviorData.averageScore = Math.round(total / 9);

      studentManager.update(student);
      wx.showToast({ title: '修改成功' });
    } else {
      // 新增学生
      const newStudent = {
        id: 's' + Date.now().toString().slice(-4), // 简单ID
        name,
        gender,
        roles,
        friends,
        personality: { type: '未测', traits: [] },
        exams: [
          // 默认填充前两次为空或模拟数据，确保图表能画出来
          { name: '第一次月考', total: total - 20, scores }, 
          { name: '期中考试', total: total - 10, scores },
          { name: '期末考试', total, scores }
        ],
        behaviorData: { averageScore: Math.round(total / 9) },
        psychologicalData
      };
      studentManager.add(newStudent);
      wx.showToast({ title: '添加成功' });
    }

    this.setData({ isEditing: false });
    this.loadStudents();
  },

  deleteStudent() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该学生吗？',
      success: (res) => {
        if (res.confirm) {
          const students = studentManager.getAll();
          const newLists = students.filter(s => s.id !== this.data.editingId);
          // 需要更新 Storage，此处简化直接覆盖
          wx.setStorageSync('student_db_v1', newLists);
          
          wx.showToast({ title: '已删除' });
          this.setData({ isEditing: false });
          this.loadStudents();
        }
      }
    });
  }
})
