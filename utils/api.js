/**
 * 网络请求封装模块
 * 基于wx.request封装通用请求函数，返回Promise对象
 * 当前阶段集成Mock数据，模拟异步请求
 */

import { 
  mockClassList, 
  mockUserInfo, 
  mockModules, 
  mockTestData,
  mockQuestionnaireData,
  mockStudentsForSeating,
  mockInteractionHistory,
  mockStudentsForLeader,
  mockSCL90Data
} from './mockData.js';

// 基础URL配置（开发阶段可为空，或配置Mock API基础路径）
const BASE_URL = '';

/**
 * 通用请求函数
 * @param {Object} options 请求配置对象
 * @param {String} options.url 请求地址
 * @param {String} options.method 请求方法，默认为GET
 * @param {Object} options.data 请求参数
 * @param {Object} options.header 请求头
 * @param {Boolean} options.showLoading 是否显示加载提示，默认为true
 * @returns {Promise} 返回Promise对象
 */
function request(options = {}) {
  return new Promise((resolve, reject) => {
    const {
      url = '',
      method = 'GET',
      data = {},
      header = {
        'content-type': 'application/json'
      },
      showLoading = true
    } = options;

    // 显示加载提示
    if (showLoading) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
    }

    // 模拟异步延迟（模拟网络请求）
    setTimeout(() => {
      // 隐藏加载提示
      if (showLoading) {
        wx.hideLoading();
      }

      // 根据不同的URL返回对应的Mock数据
      // 这里可以根据实际需求扩展更多的Mock接口
      let mockResponse = null;

      // 班级列表接口
      if (url.includes('/api/class/list') || url === '/api/class/list') {
        mockResponse = {
          code: 200,
          message: 'success',
          data: mockClassList
        };
      }
      // 用户信息接口
      else if (url.includes('/api/user/info') || url === '/api/user/info') {
        mockResponse = {
          code: 200,
          message: 'success',
          data: mockUserInfo
        };
      }
      // 功能模块列表接口
      else if (url.includes('/api/modules/list') || url === '/api/modules/list') {
        mockResponse = {
          code: 200,
          message: 'success',
          data: mockModules
        };
      }
      // 模块1测试数据接口
      else if (url.includes('/api/module1/test') || url === '/api/module1/test') {
        mockResponse = {
          code: 200,
          message: 'success',
          data: mockTestData.module1
        };
      }
      // 模块2测试数据接口
      else if (url.includes('/api/module2/test') || url === '/api/module2/test') {
        mockResponse = {
          code: 200,
          message: 'success',
          data: mockTestData.module2
        };
      }
      // 模块3测试数据接口
      else if (url.includes('/api/module3/test') || url === '/api/module3/test') {
        mockResponse = {
          code: 200,
          message: 'success',
          data: mockTestData.module3
        };
      }
      // 模块1：班级生态评估 - 问卷数据接口
      else if (url.includes('/api/module1/questionnaire') || url === '/api/module1/questionnaire') {
        mockResponse = {
          code: 200,
          message: 'success',
          data: mockQuestionnaireData
        };
      }
      // 模块1：班级生态评估 - 分析结果接口
      else if (url.includes('/api/module1/analyze') || url === '/api/module1/analyze') {
        // 这里返回分析结果（实际应该在后端计算，这里先用mock）
        mockResponse = {
          code: 200,
          message: 'success',
          data: { message: '分析结果将在后端计算' }
        };
      }
      // 模块1：SCL-90心理测评数据接口
      else if (url.includes('/api/module1/scl90') || url === '/api/module1/scl90') {
        mockResponse = {
          code: 200,
          message: 'success',
          data: mockSCL90Data
        };
      }
      // 模块2：智能排座 - 学生数据接口
      else if (url.includes('/api/module2/students') || url === '/api/module2/students') {
        mockResponse = {
          code: 200,
          message: 'success',
          data: mockStudentsForSeating
        };
      }
      // 模块2：智能排座 - 互动历史接口
      else if (url.includes('/api/module2/interactions') || url === '/api/module2/interactions') {
        mockResponse = {
          code: 200,
          message: 'success',
          data: mockInteractionHistory
        };
      }
      // 模块2：智能排座 - 生成座位表接口
      else if (url.includes('/api/module2/arrange') || url === '/api/module2/arrange') {
        mockResponse = {
          code: 200,
          message: 'success',
          data: { message: '座位表将在前端计算' }
        };
      }
      // 模块3：班委推荐 - 学生数据接口
      else if (url.includes('/api/module3/students') || url === '/api/module3/students') {
        mockResponse = {
          code: 200,
          message: 'success',
          data: mockStudentsForLeader
        };
      }
      // 模块3：班委推荐 - 推荐结果接口
      else if (url.includes('/api/module3/recommend') || url === '/api/module3/recommend') {
        mockResponse = {
          code: 200,
          message: 'success',
          data: { message: '推荐结果将在前端计算' }
        };
      }
      // 默认Mock响应
      else {
        mockResponse = {
          code: 200,
          message: 'success',
          data: {}
        };
      }

      // 模拟业务逻辑判断
      if (mockResponse.code === 200) {
        // 成功提示（可选，根据实际需求决定是否显示）
        // wx.showToast({
        //   title: '请求成功',
        //   icon: 'success',
        //   duration: 2000
        // });
        resolve(mockResponse);
      } else {
        // 失败提示
        wx.showToast({
          title: mockResponse.message || '请求失败',
          icon: 'none',
          duration: 2000
        });
        reject(mockResponse);
      }
    }, 500); // 模拟500ms的网络延迟

    // 真实网络请求代码（当前阶段注释，后续可启用）
    /*
    wx.request({
      url: BASE_URL + url,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        if (showLoading) {
          wx.hideLoading();
        }
        
        // 业务逻辑判断
        if (res.statusCode === 200 && res.data.code === 200) {
          resolve(res.data);
        } else {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none',
            duration: 2000
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        if (showLoading) {
          wx.hideLoading();
        }
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
        reject(err);
      }
    });
    */
  });
}

/**
 * GET请求封装
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他配置选项
 */
export function get(url, data = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
}

/**
 * POST请求封装
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他配置选项
 */
export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
}

// 导出默认request函数
export default request;

