// components/ai-assistant/index.js

// 【重要】请在这里填入你的百度 API Key 和 Secret Key
const BAIDU_API_KEY = '45ysWlMpIMT4YVSDDAy1NaUB'; // 替换为你的 API Key
const BAIDU_SECRET_KEY = 'xQv5PwVNqVcz7UQslD1aQmanyqepZWQa'; // 替换为你的 Secret Key

let manager = null;

Component({
  data: {
    expanded: false,
    isRecording: false,
    chatHistory: [],
    scrollIntoView: '',
    accessToken: '', // 缓存 AccessToken
    tokenExpiresTime: 0 // Token 过期时间
  },

  lifetimes: {
    attached() {
      manager = wx.getRecorderManager();
      this.initRecorder();
      
      // 初始化时尝试获取 Token，并处理缓存问题
      this.initToken();
    }
  },

  methods: {
    async initToken() {
      // 尝试从本地存储恢复 Token
      const storedToken = wx.getStorageSync('baidu_access_token');
      const storedExpire = wx.getStorageSync('baidu_token_expire');
      
      if (storedToken && storedExpire && Date.now() < storedExpire) {
        this.setData({
          accessToken: storedToken,
          tokenExpiresTime: storedExpire
        });
      } else {
        await this.getBaiduAccessToken(true); // 强制刷新
      }
    },

    // --- 鉴权与 Token 管理 ---
    async getBaiduAccessToken(forceRefresh = false) {
      const now = Date.now();
      // 如果有 Token 且没过期 (提前 1 分钟刷新) 且不强制刷新
      if (!forceRefresh && this.data.accessToken && now < this.data.tokenExpiresTime - 60000) {
        return this.data.accessToken;
      }

      if (!BAIDU_API_KEY || BAIDU_API_KEY === 'YOUR_API_KEY') {
        console.warn('未配置百度 API Key，无法获取 Token');
        return null;
      }

      return new Promise((resolve, reject) => {
        wx.request({
          url: 'https://aip.baidubce.com/oauth/2.0/token',
          method: 'POST',
          data: {
            grant_type: 'client_credentials',
            client_id: BAIDU_API_KEY,
            client_secret: BAIDU_SECRET_KEY
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: (res) => {
            if (res.data.access_token) {
              const expireTime = now + (res.data.expires_in * 1000);
              
              // 更新内存
              this.setData({
                accessToken: res.data.access_token,
                tokenExpiresTime: expireTime
              });
              
              // 更新本地存储
              wx.setStorageSync('baidu_access_token', res.data.access_token);
              wx.setStorageSync('baidu_token_expire', expireTime);
              
              console.log('AccessToken 获取成功');
              resolve(res.data.access_token);
            } else {
              console.error('获取 AccessToken 失败', res.data);
              reject(res.data);
            }
          },
          fail: (err) => {
            console.error('鉴权网络请求失败', err);
            reject(err);
          }
        });
      });
    },

    // --- 录音逻辑 ---
    initRecorder() {
      manager.onStop(async (res) => {
        console.log("录音结束", res);
        const { tempFilePath, duration, fileSize } = res;
        
        if (duration < 1000) {
          wx.showToast({ title: '说话时间太短', icon: 'none' });
          return;
        }
        
        // 调用真实识别逻辑
        this.recognizeVoice(tempFilePath, fileSize);
      });

      manager.onError((res) => {
        console.error("录音错误", res);
        this.setData({ isRecording: false });
        wx.showToast({ title: '录音出错', icon: 'none' });
      });
    },

    startRecord() {
      wx.vibrateShort();
      this.setData({ isRecording: true });
      
      try {
        // 百度 REST API 支持 m4a (aac)
        // 微信小程序 format: 'aac' 生成 .m4a 文件
        manager.start({
          duration: 60000,
          format: 'aac', 
          sampleRate: 16000, // 采样率推荐 16k
          encodeBitRate: 48000, // 码率
          numberOfChannels: 1 // 单声道
        });
      } catch (error) {
        console.error("Start record failed", error);
        this.setData({ isRecording: false });
      }
    },

    stopRecord() {
      if (this.data.isRecording) {
        this.setData({ isRecording: false });
        if (manager) manager.stop();
      }
    },

    // --- 核心：语音识别逻辑 ---
    async recognizeVoice(filePath, fileSize, retryCount = 0) {
      if (BAIDU_API_KEY === 'YOUR_API_KEY') {
        this.simulateRecognition(); // 没配 Key 就回退到模拟模式
        return;
      }

      if (retryCount === 0) wx.showLoading({ title: '识别中...' });

      try {
        // 1. 确保有 Token (如果重试，强制刷新)
        const token = await this.getBaiduAccessToken(retryCount > 0);
        if (!token) throw new Error('无法获取 Access Token');

        // 2. 读取音频文件为 Base64
        const fs = wx.getFileSystemManager();
        // 读取 Base64，但不自动拼接前缀
        let fileData = fs.readFileSync(filePath, 'base64');
        
        // 【修复 3300 错误】确保没有 data URI scheme 前缀
        // 某些平台/版本 readFileSync 可能返回 'data:audio/mp3;base64,xxxxx'
        // 百度 API 只接受纯 Base64 字符串
        if (fileData.includes(',')) {
          fileData = fileData.split(',')[1];
        }

        // 3. 发送请求给百度 (支持自动降级：极速版 -> 标准版)
        // 默认先尝试极速版
        let api_url = 'https://vop.baidu.com/pro_api';
        let dev_pid = 80001; // 极速版默认普通话模型
        
        // 如果是第一次重试 (retryCount === 1)，尝试切换到标准版接口
        if (retryCount === 1) {
          console.log('切换到标准版接口重试...');
          api_url = 'https://vop.baidu.com/server_api';
          dev_pid = 1537; // 标准版普通话模型
        }

        wx.request({
          url: api_url,
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          data: {
            format: 'm4a', // 对应微信的 aac
            rate: 16000,
            channel: 1,
            cuid: 'smart_grade_system_user', // 用户唯一标识，随便填
            token: token,
            dev_pid: dev_pid,
            speech: fileData,
            len: fileSize
          },
          success: (res) => {
            // 处理 Token 失效 (3302)
            // 无论是极速版还是标准版，Token 失效都应该刷新 Token
            if (res.data.err_no === 3302) {
               if (retryCount < 2) {
                  console.warn('Token失效或接口无权限，尝试刷新Token/切换接口重试...');
                  // 清除本地缓存
                  wx.removeStorageSync('baidu_access_token');
                  wx.removeStorageSync('baidu_token_expire');
                  this.setData({ accessToken: '' });
                  
                  // 递归重试：第一次是刷新Token+原接口；第二次是刷新Token+切接口
                  this.recognizeVoice(filePath, fileSize, retryCount + 1);
                  return;
               } else {
                  // 重试两次都不行，提示用户去开权限
                  wx.hideLoading();
                  wx.showModal({
                    title: '权限未开通',
                    content: '您的百度语音识别服务可能未领取免费额度。请登录百度AI控制台，在"语音技术"->"概览"中领取"短语音识别-极速版"和"标准版"的免费额度。',
                    showCancel: false
                  });
                  return;
               }
            }

            wx.hideLoading();
            console.log('百度识别结果:', res.data);
            
            if (res.data.err_no === 0) {
              // 成功
              const resultText = res.data.result[0];
              this.handleUserInput(resultText);
            } else {
              // 失败
              wx.showToast({ title: '识别失败: ' + res.data.err_msg, icon: 'none' });
              console.error('识别错误码:', res.data.err_no);
            }
          },
          fail: (err) => {
            wx.hideLoading();
            wx.showToast({ title: '网络请求失败', icon: 'none' });
            console.error('Network error:', err);
          }
        });

      } catch (error) {
        wx.hideLoading();
        console.error('Recognition process failed', error);
        wx.showToast({ title: '处理出错', icon: 'none' });
      }
    },

    // 保留模拟逻辑作为后备
    simulateRecognition() {
      wx.showLoading({ title: '识别中(模拟)...' });
      setTimeout(() => {
        wx.hideLoading();
        const mockInputs = ["帮我排一下座位", "我想看看班委推荐", "打开班级生态分析"];
        const randomInput = mockInputs[Math.floor(Math.random() * mockInputs.length)];
        this.handleUserInput(randomInput);
      }, 1000);
    },

    toggleExpand() {
      this.setData({ expanded: !this.data.expanded });
    },

    handleUserInput(text) {
      text = text.replace(/[。\.]$/, '');
      if (!text.trim()) return;

      const userMsg = { role: 'user', content: text };
      this.setData({ 
        chatHistory: [...this.data.chatHistory, userMsg],
        scrollIntoView: 'bottom-anchor'
      });

      this.processAIResponse(text);
    },

    processAIResponse(query) {
      wx.showLoading({ title: '思考中...' });
      
      // 暂时还是本地逻辑，后续这里接 LLM API
      setTimeout(() => {
        wx.hideLoading();
        let aiContent = `我听到了：${query}。\n(目前还是本地逻辑处理)`;
        
        if (query.includes('排座') || query.includes('座位')) {
          aiContent = '好的，正在为您打开排座引擎...';
          wx.navigateTo({ url: '/pages/module2/index', fail: () => wx.switchTab({ url: '/pages/module2/index' }) });
        } else if (query.includes('班委')) {
          aiContent = '好的，正在前往班委胜任力模型...';
          wx.navigateTo({ url: '/pages/module3/index', fail: () => wx.switchTab({ url: '/pages/module3/index' }) });
        } else if (query.includes('生态') || query.includes('关系')) {
          aiContent = '已为您展示班级生态分析。';
          wx.navigateTo({ url: '/pages/module1/index', fail: () => wx.switchTab({ url: '/pages/module1/index' }) });
        }

        const aiMsg = { role: 'ai', content: aiContent };
        this.setData({
          chatHistory: [...this.data.chatHistory, aiMsg],
          scrollIntoView: 'bottom-anchor'
        });
      }, 800);
    }
  }
})
