/**
 * 网络请求封装模块
 * 基于wx.request封装通用请求函数，返回Promise对象
 * 当前阶段集成Mock数据，模拟异步请求
 */

import { 
  mockClassList, 
  mockModules, 
  mockInteractionHistory
} from './mockData.js';
import { generateSeatArrangement } from './seatArrangementAlgorithm.js';
import { studentManager } from './studentManager.js';

/**
 * 通用请求函数
 * @param {Object} options 请求配置对象
 */
function request(options = {}) {
  return new Promise((resolve, reject) => {
    const {
      url = '',
      method = 'GET',
      data = {},
      header = { 'content-type': 'application/json' },
      showLoading = true
    } = options;

    if (showLoading) {
      wx.showLoading({ title: '加载中...', mask: true });
    }

    // 模拟异步延迟
    setTimeout(() => {
      if (showLoading) {
        wx.hideLoading();
      }

      let mockResponse = null;
      const allStudents = studentManager.getAll(); // 获取最新学生数据

      // ---------------------------------------------------------
      // 1. 通用接口
      // ---------------------------------------------------------

      // 班级列表接口
      if (url.includes('/api/class/list') || url === '/api/class/list') {
        mockResponse = { code: 200, message: 'success', data: mockClassList };
      }
      // 班级基本信息（人数等）- 用于首页 Dashboard
      else if (url.includes('/api/class/info') || url === '/api/class/info') {
        mockResponse = {
          code: 200,
          message: 'success',
           data: {
             studentCount: allStudents.length,
             className: '九年级一班', // 暂定
             teacherName: '张老师'
           }
        };
      }
      // 用户信息接口
      else if (url.includes('/api/user/info') || url === '/api/user/info') {
        mockResponse = { code: 200, message: 'success', data: studentManager.getUserInfo() };
      }
      // 功能模块列表接口
      else if (url.includes('/api/modules/list') || url === '/api/modules/list') {
        mockResponse = { code: 200, message: 'success', data: mockModules };
      }

      // ---------------------------------------------------------
      // 2. 模块1：班级生态评估
      // ---------------------------------------------------------

      // 问卷数据接口 (社交关系)
      else if (url.includes('/api/module1/questionnaire') || url === '/api/module1/questionnaire') {
        const questionnaireData = allStudents.map(s => ({
          studentId: s.id,
          studentName: s.name,
          friends: s.friends || []
        }));
        mockResponse = { code: 200, message: 'success', data: questionnaireData };
      }
      // 分析结果接口
      else if (url.includes('/api/module1/analyze') || url === '/api/module1/analyze') {
        mockResponse = { code: 200, message: 'success', data: { message: '分析结果将在后端计算' } };
      }
      // 心理测评数据接口 (新版 8+4 维度)
      else if (url.includes('/api/module1/psychology') || url === '/api/module1/psychology') {
        const psychologyData = allStudents.map(s => ({
          studentId: s.id,
          studentName: s.name,
          // 如果没有新数据，回退到空对象，防止报错
          psychologicalData: s.psychologicalData || {}
        }));
        mockResponse = { code: 200, message: 'success', data: psychologyData };
      }

      // ---------------------------------------------------------
      // 3. 模块2：智能排座
      // ---------------------------------------------------------

      // 学生数据接口
      else if (url.includes('/api/module2/students') || url === '/api/module2/students') {
        const seatingStudents = allStudents.map(s => {
           // 获取最新一次考试成绩
           const lastExam = s.exams && s.exams.length > 0 ? s.exams[s.exams.length - 1] : { scores: {} };
           return {
             id: s.id,
             name: s.name,
             gender: s.gender,
             roles: s.roles,
             personality: s.personality,
             scores: lastExam.scores,
             socialScore: s.behaviorData ? s.behaviorData.interactionFrequency : 50,
             // 确保 socialScore 有值，防止排座模块 undefined
             tags: [] // 排座模块前端会生成 tags，这里可以为空
           };
        });
        mockResponse = { code: 200, message: 'success', data: seatingStudents };
      }
      // 互动历史接口 (保持静态Mock，或者如果有动态生成逻辑也可以加上)
      else if (url.includes('/api/module2/interactions') || url === '/api/module2/interactions') {
        mockResponse = { code: 200, message: 'success', data: mockInteractionHistory };
      }
      // 自动排列接口
      else if (url.includes('/api/module2/autoArrange') || url === '/api/module2/autoArrange') {
        setTimeout(() => {
          const { students: studentIds, rows, cols, weights, interactionHistory } = data;
          // 从最新数据中获取完整的学生信息
          const seatingStudents = allStudents.map(s => {
             const lastExam = s.exams && s.exams.length > 0 ? s.exams[s.exams.length - 1] : { scores: {} };
             return {
               id: s.id,
               name: s.name,
               gender: s.gender,
               roles: s.roles,
               personality: s.personality,
               scores: lastExam.scores,
               socialScore: s.behaviorData ? s.behaviorData.interactionFrequency : 50
             };
          });
          
          const fullStudents = seatingStudents.filter(s => studentIds.includes(s.id));
          
          const result = generateSeatArrangement(
            fullStudents,
            rows,
            cols,
            {
              interactionHistory: interactionHistory || [],
              weights: weights || { complementarity: 1, compatibility: 1, interference: 1 }
            }
          );
          
          resolve({ code: 200, message: '自动排列成功', data: result });
        }, 800);
        return;
      }

      // ---------------------------------------------------------
      // 4. 模块3：班委推荐
      // ---------------------------------------------------------

      // 学生数据接口
      else if (url.includes('/api/module3/students') || url === '/api/module3/students') {
        const leaderStudents = allStudents.map(s => ({
          id: s.id,
          name: s.name,
          roles: s.roles,
          behaviorData: s.behaviorData || {},
          psychologicalData: s.psychologicalData || {}
        }));
        mockResponse = { code: 200, message: 'success', data: leaderStudents };
      }

      // ---------------------------------------------------------
      // 5. 默认响应
      // ---------------------------------------------------------
      else {
        mockResponse = { code: 200, message: 'success', data: {} };
      }

      // 统一返回处理
      if (mockResponse && mockResponse.code === 200) {
        resolve(mockResponse);
      } else {
        wx.showToast({ title: mockResponse ? mockResponse.message : '请求失败', icon: 'none' });
        reject(mockResponse);
      }
    }, 500);
  });
}

/**
 * GET请求封装
 */
export function get(url, data = {}, options = {}) {
  return request({ url, method: 'GET', data, ...options });
}

/**
 * POST请求封装
 */
export function post(url, data = {}, options = {}) {
  return request({ url, method: 'POST', data, ...options });
}

export default request;
