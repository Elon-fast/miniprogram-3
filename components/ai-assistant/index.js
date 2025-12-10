// components/ai-assistant/index.js

// 【重要】请在这里填入你的百度 API Key 和 Secret Key
const BAIDU_API_KEY = '45ysWlMpIMT4YVSDDAy1NaUB'; // 替换为你的 API Key
const BAIDU_SECRET_KEY = 'xQv5PwVNqVcz7UQslD1aQmanyqepZWQa'; // 替换为你的 Secret Key

// 【重要】请在这里填入你的 Kimi API Key
const MOONSHOT_API_KEY = 'sk-0re8aUjcCm3qEz1yfdtAT1Ghv0Y4KdjKIv4jOhegw9XfAfNK'; // 替换为你的 Kimi API Key

// 默认的操作树配置（Default Action Tree）
// 采用“页面即节点”的设计思路
const DEFAULT_ACTION_TREE = [
  {
    id: 'root',
    name: '首页',
    path: '/pages/index/index',
    description: '小程序启动页，包含数据概览和模块入口',
    actions: [
      { name: 'open_module_1', description: '打开班级生态评估', handler: 'navigateToClassEcology' },
      { name: 'open_module_2', description: '打开智能排座引擎', handler: 'navigateToSeatArrangement' },
      { name: 'open_module_3', description: '打开班委胜任力模型', handler: 'navigateToClassLeader' },
      { name: 'open_module_4', description: '打开学情概览', handler: 'navigateToModule4' }
    ],
    children: [
      {
        id: 'module1',
        name: '班级生态评估',
        path: '/pages/module1/index',
        description: '展示班级社交网络图谱和心理健康状态',
        actions: [
          { name: 'refresh_analysis', description: '重新刷新分析数据', handler: 'refreshAnalysis' },
          { name: 'show_help', description: '查看帮助说明', handler: 'showHelp' }
        ]
      },
      {
        id: 'module2',
        name: '智能排座引擎',
        path: '/pages/module2/index',
        description: '进行座位编排和调整',
        actions: [
          { name: 'auto_arrange', description: '执行自动排座算法', handler: 'executeAutoArrange' },
          { name: 'clear_seats', description: '清空当前座位表', handler: 'clearSeats' },
          { name: 'save_seats', description: '保存当前座位方案', handler: 'saveSeats' }
        ]
      },
      {
        id: 'module3',
        name: '班委胜任力模型',
        path: '/pages/module3/index',
        description: '推荐班委候选人',
        actions: [
          { name: 'view_candidate_detail', description: '查看候选人详细信息', handler: 'viewCandidateDetail' }
        ]
      }
    ]
  }
];

let manager = null;

Component({
  properties: {
    // 允许外部传入自定义 Action Tree
    actionTree: {
      type: Array,
      value: [] 
    },                                                               
    // 允许外部传入全局上下文提示
    globalContext: {
      type: String,
      value: ''
    }
  },

  data: {
    expanded: false,
    isRecording: false,
    chatHistory: [],
    scrollIntoView: '',
    accessToken: '', 
    tokenExpiresTime: 0,
    mergedActionTree: [] // 合并后的操作树
  },

  lifetimes: {
    attached() {
      manager = wx.getRecorderManager();
      this.initRecorder();
      this.initToken();
      
      // 合并默认和用户传入的 Action Tree
      this.setData({
        mergedActionTree: [...DEFAULT_ACTION_TREE, ...this.properties.actionTree]
      });

      // 初始化加载数据
      this.syncChatHistory();
    }
  },

  // 监听页面显示，确保 Tab 切换时数据同步
  pageLifetimes: {
    show() {
      this.syncChatHistory();
    }
  },

  methods: {
    // 同步全局聊天记录
    syncChatHistory() {
      const app = getApp();
      let history = [];
      
      if (app && app.globalData && app.globalData.chatHistory && app.globalData.chatHistory.length > 0) {
        history = app.globalData.chatHistory;
      } else {
        // 尝试从本地缓存读取
        history = wx.getStorageSync('chat_history_cache') || [];
        // 如果本地有，反向同步给全局
        if (history.length > 0 && app && app.globalData) {
          app.globalData.chatHistory = history;
        }
      }

      // 对比当前数据，避免不必要更新（使用长度简单判断，或者深比较）
      if (this.data.chatHistory.length !== history.length || 
          (history.length > 0 && history[history.length-1].content !== this.data.chatHistory[this.data.chatHistory.length-1]?.content)) {
        this.setData({
          chatHistory: history,
          scrollIntoView: 'bottom-anchor'
        });
      }
    },

    // ... (鉴权、录音相关代码保持不变) ...
    async initToken() {
      const storedToken = wx.getStorageSync('baidu_access_token');
      const storedExpire = wx.getStorageSync('baidu_token_expire');
      if (storedToken && storedExpire && Date.now() < storedExpire) {
        this.setData({ accessToken: storedToken, tokenExpiresTime: storedExpire });
      } else { await this.getBaiduAccessToken(true); }
    },

    async getBaiduAccessToken(forceRefresh = false) {
      const now = Date.now();
      if (!forceRefresh && this.data.accessToken && now < this.data.tokenExpiresTime - 60000) {
        return this.data.accessToken;
      }
      if (!BAIDU_API_KEY || BAIDU_API_KEY === 'YOUR_API_KEY') {
        console.warn('未配置百度 API Key');
        return null;
      }
      return new Promise((resolve, reject) => {
        wx.request({
          url: 'https://aip.baidubce.com/oauth/2.0/token',
          method: 'POST',
          data: { grant_type: 'client_credentials', client_id: BAIDU_API_KEY, client_secret: BAIDU_SECRET_KEY },
          header: { 'Content-Type': 'application/x-www-form-urlencoded' },
          success: (res) => {
            if (res.data.access_token) {
              const expireTime = now + (res.data.expires_in * 1000);
              this.setData({ accessToken: res.data.access_token, tokenExpiresTime: expireTime });
              wx.setStorageSync('baidu_access_token', res.data.access_token);
              wx.setStorageSync('baidu_token_expire', expireTime);
              resolve(res.data.access_token);
            } else { reject(res.data); }
          },
          fail: reject
        });
      });
    },

    initRecorder() {
      manager.onStop(async (res) => {
        console.log("录音结束", res);
        const { tempFilePath, duration, fileSize } = res;
        if (duration < 1000) {
          wx.showToast({ title: '说话时间太短', icon: 'none' });
          return;
        }
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
        manager.start({ duration: 60000, format: 'aac', sampleRate: 16000, encodeBitRate: 48000, numberOfChannels: 1 });
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

    async recognizeVoice(filePath, fileSize, retryCount = 0) {
      if (BAIDU_API_KEY === 'YOUR_API_KEY') {
        this.simulateRecognition();
        return;
      }
      if (retryCount === 0) wx.showLoading({ title: '识别中...' });

      try {
        const token = await this.getBaiduAccessToken(retryCount > 0);
        if (!token) throw new Error('无法获取 Access Token');

        const fs = wx.getFileSystemManager();
        let fileData = fs.readFileSync(filePath, 'base64');
        if (fileData.includes(',')) fileData = fileData.split(',')[1];

        let api_url = 'https://vop.baidu.com/pro_api';
        let dev_pid = 80001;
        if (retryCount === 1) {
          console.log('切换到标准版接口重试...');
          api_url = 'https://vop.baidu.com/server_api';
          dev_pid = 1537;
        }

        wx.request({
          url: api_url,
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          data: {
            format: 'm4a', rate: 16000, channel: 1,
            cuid: 'smart_grade_system_user',
            token: token, dev_pid: dev_pid, speech: fileData, len: fileSize
          },
          success: (res) => {
            if (res.data.err_no === 3302) {
               if (retryCount < 2) {
                  wx.removeStorageSync('baidu_access_token');
                  wx.removeStorageSync('baidu_token_expire');
                  this.setData({ accessToken: '' });
                  this.recognizeVoice(filePath, fileSize, retryCount + 1);
                  return;
               } else {
                  console.warn('百度语音鉴权失败，转入模拟输入测试 Kimi');
                  wx.hideLoading();
                  this.handleUserInput("打开班级生态评估模块");
                  return;
               }
            }
            wx.hideLoading();
            if (res.data.err_no === 0) {
              this.handleUserInput(res.data.result[0]);
            } else {
              console.warn('百度语音识别失败，转入模拟输入测试 Kimi', res.data);
              wx.showToast({ title: '识别异常，使用测试文本', icon: 'none' });
              this.handleUserInput("打开班级生态评估模块");
            }
          },
          fail: (err) => {
            wx.hideLoading();
            console.error('百度 API 网络错误', err);
            this.handleUserInput("打开班级生态评估模块");
          }
        });
      } catch (error) {
        wx.hideLoading();
        console.error('Recognition process failed', error);
        this.handleUserInput("打开班级生态评估模块");
      }
    },

    simulateRecognition() {
      wx.showLoading({ title: '识别中(模拟)...' });
      setTimeout(() => {
        wx.hideLoading();
        const mockInputs = ["帮我排一下座位", "我想看看班委推荐", "打开班级生态分析"];
        this.handleUserInput(mockInputs[Math.floor(Math.random() * mockInputs.length)]);
      }, 1000);
    },

    toggleExpand() {
      this.setData({ expanded: !this.data.expanded });
    },

    handleUserInput(text) {
      text = text.replace(/[。\.]$/, '');
      if (!text.trim()) return;

      // 构建消息对象
      const userMsg = { role: 'user', content: text };
      
      // 1. 更新本地数据
      const newHistory = [...this.data.chatHistory, userMsg];
      this.setData({ 
        chatHistory: newHistory,
        scrollIntoView: 'bottom-anchor'
      });

      // 2. 同步到全局数据
      this.saveChatHistory(newHistory);

      this.callKimiAPI(text);
    },

    // 保存聊天记录到全局
    saveChatHistory(history) {
      const app = getApp();
      if (app && app.globalData) {
        app.globalData.chatHistory = history;
      }
      // 双重保险：写入本地缓存
      wx.setStorageSync('chat_history_cache', history);
    },

    async callKimiAPI(userQuery) {
      // ... (保持原样) ...
      if (MOONSHOT_API_KEY === 'YOUR_MOONSHOT_KEY') {
        this.processAIResponse(userQuery); 
        return;
      }

      wx.showLoading({ title: 'AI 思考中...' });

      const contextData = this.capturePageContext();
      const actionTreeDesc = JSON.stringify(this.data.mergedActionTree);
      
      const systemPrompt = `你是一个智能班级管理助手。
【当前环境】
当前页面数据：${JSON.stringify(contextData)}
全局上下文：${this.properties.globalContext}

【能力清单 (Action Tree)】
你可以执行以下操作。如果用户意图匹配其中某个操作，请务必返回对应的 JSON 指令。
操作定义：${actionTreeDesc}

【回复规则】
1. 如果用户想执行某个操作（如“打开排座页面”），请返回且仅返回如下 JSON 格式：
   {"action": "HANDLER_NAME", "params": {}, "reply": "好的，正在为您..."}
   其中 HANDLER_NAME 必须是 Action Tree 中定义的 handler 字段。
2. 如果是普通问答，直接返回文本回复即可，不需要 JSON。
3. 回答请简洁自然。`;

      console.log('Sending to Kimi:', { userQuery, actionTree: this.data.mergedActionTree },systemPrompt);

      wx.request({
        url: 'https://api.moonshot.cn/v1/chat/completions',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOONSHOT_API_KEY}`
        },
        data: {
          model: 'moonshot-v1-8k',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuery }
          ],
          temperature: 0.3
        },
        success: (res) => {
          wx.hideLoading();
          if (res.data && res.data.choices && res.data.choices.length > 0) {
            const content = res.data.choices[0].message.content;
            console.log('Kimi Response:', content);
            this.handleAIResponse(content);
          } else {
            console.error('Kimi API Error:', res.data);
            this.addAIMessage('抱歉，AI 响应异常。');
          }
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('Kimi Network Error:', err);
          this.addAIMessage(`网络错误: ${err.errMsg}`);
        }
      });
    },

    handleAIResponse(content) {
      // ... (保持原样) ...
      try {
        let jsonStr = content;
        if (content.includes('```json')) {
          jsonStr = content.match(/```json([\s\S]*?)```/)[1];
        } else if (content.includes('{') && content.includes('}')) {
          const start = content.indexOf('{');
          const end = content.lastIndexOf('}') + 1;
          jsonStr = content.substring(start, end);
        }

        const command = JSON.parse(jsonStr);
        
        if (command.action && command.reply) {
          this.addAIMessage(command.reply);
          this.executeAction(command.action, command.params);
          return;
        }
      } catch (e) { }

      this.addAIMessage(content);
    },

    executeAction(handlerName, params) {
      // ... (保持原样) ...
      console.log('Executing Action:', handlerName, params);
      if (this[handlerName]) {
        this[handlerName](params);
        return;
      }
      this.triggerEvent('action', { handler: handlerName, params });
    },

    navigateToSeatArrangement() {
      wx.navigateTo({ url: '/pages/module2/index', fail: () => wx.switchTab({ url: '/pages/module2/index' }) });
    },
    navigateToClassEcology() {
      wx.navigateTo({ url: '/pages/module1/index', fail: () => wx.switchTab({ url: '/pages/module1/index' }) });
    },
    navigateToClassLeader() {
      wx.navigateTo({ url: '/pages/module3/index', fail: () => wx.switchTab({ url: '/pages/module3/index' }) });
    },
    navigateToModule4() {
      wx.navigateTo({ url: '/pages/module4/index', fail: () => wx.switchTab({ url: '/pages/module4/index' }) });
    },

    capturePageContext() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (!currentPage) return {};

      const route = currentPage.route;
      const pageData = currentPage.data;
      let context = { page: route };

      if (currentPage.getAIContext) {
        return { ...context, ...currentPage.getAIContext() };
      }

      if (route.includes('module2')) {
        context.stats = pageData.seatStats;
        if (pageData.seatTable) {
          context.seatTable = pageData.seatTable.map(row => row.map(cell => cell ? cell.name : '空'));
        }
      } else if (route.includes('module3')) {
        context.positions = pageData.positions.map(p => ({
          position: p.name,
          current: p.currentHolder ? p.currentHolder.name : '空缺',
          candidates: p.candidates.map(c => `${c.student.name}(${c.percentage}%)`).slice(0, 3)
        }));
      } else if (route.includes('module1')) {
        context.summary = "班级生态分析页面";
        if (pageData.analysisResult) {
           context.isolatedStudents = pageData.analysisResult.isolated.map(s => s.name);
           context.networkStats = pageData.analysisResult.networkStats;
        }
      }
      return context;
    },

    addAIMessage(content) {
      const aiMsg = { role: 'ai', content: content };
      const newHistory = [...this.data.chatHistory, aiMsg];
      
      // 1. 更新本地数据
      this.setData({
        chatHistory: newHistory,
        scrollIntoView: 'bottom-anchor'
      });
      
      // 2. 同步到全局数据
      this.saveChatHistory(newHistory);
    },

    // 保留本地规则处理作为后备
    processAIResponse(query) {
      // ... (保持原样) ...
      wx.showLoading({ title: '思考中...' });
      setTimeout(() => {
        wx.hideLoading();
        let aiContent = `我听到了：${query}。\n(未配置 Kimi Key，使用本地规则)`;
        
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

        this.addAIMessage(aiContent);
      }, 800);
    }
  }
})
