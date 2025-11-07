// module2/index.js - 智能排座引擎模块
import { get } from '../../utils/api.js';
import { generateSeatArrangement } from '../../utils/seatArrangementAlgorithm.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '智能排座引擎',
    loading: false,
    students: [],
    interactionHistory: [],
    seatTable: null,
    rows: 4,  // 默认4行
    cols: 4,  // 默认4列
    showSeatTable: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadData();
  },

  /**
   * 加载学生数据和互动历史
   */
  async loadData() {
    this.setData({ loading: true });
    
    try {
      const [studentsRes, interactionsRes] = await Promise.all([
        get('/api/module2/students'),
        get('/api/module2/interactions')
      ]);
      
      if (studentsRes.code === 200 && studentsRes.data) {
        this.setData({
          students: studentsRes.data,
          interactionHistory: interactionsRes.code === 200 ? interactionsRes.data : []
        });
        
        // 自动生成座位表
        this.generateSeats();
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
   * 生成座位表
   */
  generateSeats() {
    if (this.data.students.length === 0) {
      wx.showToast({
        title: '暂无学生数据',
        icon: 'none'
      });
      return;
    }
    
    try {
      // 计算合适的行列数（根据学生数量）
      const studentCount = this.data.students.length;
      const cols = Math.ceil(Math.sqrt(studentCount));
      const rows = Math.ceil(studentCount / cols);
      
      const result = generateSeatArrangement(
        this.data.students,
        rows,
        cols,
        {
          interactionHistory: this.data.interactionHistory,
          weights: {
            complementarity: 0.4,
            compatibility: 0.4,
            interference: 0.2
          }
        }
      );
      
      // 将座位表中的学生ID转换为学生信息（包含姓名）
      const seatTableWithNames = result.seatTable.map(row => 
        row.map(studentId => {
          if (!studentId) return null;
          const student = this.data.students.find(s => s.id === studentId);
          return student ? { id: student.id, name: student.name } : { id: studentId, name: studentId };
        })
      );
      
      this.setData({
        seatTable: seatTableWithNames,
        rows: rows,
        cols: cols,
        showSeatTable: true,
        seatStats: result.stats
      });
      
      console.log('座位表生成成功:', result);
    } catch (error) {
      console.error('座位表生成失败:', error);
      wx.showToast({
        title: '生成失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 重新生成座位表
   */
  reGenerate() {
    this.generateSeats();
  },

  /**
   * 根据学生ID获取学生信息
   */
  getStudentById(studentId) {
    return this.data.students.find(s => s.id === studentId) || null;
  }
});
