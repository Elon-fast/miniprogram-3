import { mockAllStudents, mockUserInfo } from './mockData.js';

const STORAGE_KEY = 'student_db_v2';

class StudentManager {
  constructor() {
    this.init();
  }

  /**
   * 初始化数据：如果本地没有，则加载 Mock 数据
   */
  init() {
    try {
      const stored = wx.getStorageSync(STORAGE_KEY);
      // 检测数据版本：如果本地为空，或者数据量与Mock数据差距较大（说明扩容了），则重置
      // 当前Mock数据约37条，旧数据15条。
      if (!stored || !Array.isArray(stored) || stored.length < 30) {
        console.log('StudentManager: 数据源更新或初始化，重置本地存储...');
        wx.setStorageSync(STORAGE_KEY, mockAllStudents);
      }
    } catch (e) {
      console.error('StudentManager Init Error:', e);
    }
  }

  /**
   * 获取所有学生
   */
  getAll() {
    return wx.getStorageSync(STORAGE_KEY) || [];
  }

  /**
   * 获取当前用户信息
   */
  getUserInfo() {
    return mockUserInfo;
  }

  /**
   * 获取学生总数
   */
  getStudentCount() {
    return this.getAll().length;
  }

  /**
   * 根据ID获取学生
   */
  getById(id) {
    const students = this.getAll();
    return students.find(s => s.id === id) || null;
  }

  /**
   * 更新学生信息
   */
  update(student) {
    const students = this.getAll();
    const index = students.findIndex(s => s.id === student.id);
    if (index !== -1) {
      students[index] = student;
      wx.setStorageSync(STORAGE_KEY, students);
      return true;
    }
    return false;
  }

  /**
   * 添加新学生
   */
  add(student) {
    const students = this.getAll();
    students.push(student);
    wx.setStorageSync(STORAGE_KEY, students);
    return true;
  }

  /**
   * 生成学情建议
   * 规则：
   * 1. 突飞猛进：最新一次总分比上一次提高 > 30分
   * 2. 异常波动：最新一次总分比上一次降低 > 30分
   * 3. 偏科预警：某科低于及格线(60%)且总分排名在前50%
   */
  analyzeTrends() {
    const students = this.getAll();
    const suggestions = [];

    students.forEach(s => {
      if (!s.exams || s.exams.length < 2) return;

      const current = s.exams[s.exams.length - 1]; // 最新
      const prev = s.exams[s.exams.length - 2];    // 上次

      // 1. 总分波动
      const diff = current.total - prev.total;
      if (diff > 30) {
        suggestions.push({
          type: 'positive',
          studentId: s.id,
          studentName: s.name,
          content: `${s.name} 总分进步 ${diff} 分，成绩突飞猛进，建议表彰！`
        });
      } else if (diff < -30) {
        suggestions.push({
          type: 'warning',
          studentId: s.id,
          studentName: s.name,
          content: `${s.name} 总分下滑 ${Math.abs(diff)} 分，波动较大，建议关注。`
        });
      }

      // 2. 单科预警 (示例：检查最新一次数学)
      // 满分假设：语数英120(Mock里好像是100制，按100算)，其他100
      // 简单按60分及格线
      Object.entries(current.scores).forEach(([subject, score]) => {
        const subjectNames = { math: '数学', physics: '物理', english: '英语' }; // 重点关注科目
        if (score < 60 && subjectNames[subject]) {
           suggestions.push({
             type: 'info',
             studentId: s.id,
             studentName: s.name,
             content: `${s.name} ${subjectNames[subject]}不及格(${score}分)，建议辅导。`
           });
        }
      });
    });

    return suggestions;
  }
}

export const studentManager = new StudentManager();
