// components/ai-assistant/index.js
let manager = null;

Component({
  /**
   * 组件的初始数据
   */
  data: {
    expanded: false,
    isRecording: false,
    chatHistory: [],
    scrollIntoView: ''
  },

  lifetimes: {
    attached() {
      // 使用原生 RecorderManager
      manager = wx.getRecorderManager();
      this.initRecorder();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initRecorder() {
      // 录音停止时的回调
      manager.onStop((res) => {
        console.log("录音结束", res);
        const { tempFilePath, duration } = res;
        
        if (duration < 1000) {
          wx.showToast({ title: '说话时间太短', icon: 'none' });
          return;
        }

        // 这里是“真录音 + 假识别”的混合模式
        // 实际上我们没有把 tempFilePath 发给后端，而是直接模拟了一个识别结果
        // 如果你有百度/阿里的 Key，可以在这里调用 uploadFile
        this.simulateRecognition();
      });

      // 错误回调
      manager.onError((res) => {
        console.error("录音错误", res);
        this.setData({ isRecording: false });
        wx.showToast({ title: '录音出错', icon: 'none' });
      });
    },

    // 模拟语音识别过程
    simulateRecognition() {
      wx.showLoading({ title: '识别中...' });
      
      setTimeout(() => {
        wx.hideLoading();
        
        // 为了演示效果，我们随机从几个预设指令中选一个
        const mockInputs = [
          "帮我排一下座位",
          "我想看看班委推荐",
          "打开班级生态分析",
          "这里的学生数据怎么看"
        ];
        const randomInput = mockInputs[Math.floor(Math.random() * mockInputs.length)];
        
        this.handleUserInput(randomInput);
      }, 1000);
    },

    toggleExpand() {
      this.setData({ expanded: !this.data.expanded });
    },

    startRecord() {
      // 震动反馈
      wx.vibrateShort();
      
      this.setData({ isRecording: true });
      
      try {
        manager.start({
          duration: 30000,
          format: 'mp3' // 百度语音通常支持 pcm/m4a/wav/amr，这里用 mp3 通用性较好
        });
      } catch (error) {
        console.error("Start record failed", error);
        this.setData({ isRecording: false });
      }
    },

    stopRecord() {
      if (this.data.isRecording) {
        this.setData({ isRecording: false });
        if (manager) {
          try {
            manager.stop();
          } catch (error) {
            console.error("Stop record failed", error);
          }
        }
      }
    },

    handleUserInput(text) {
      // 去除末尾句号
      text = text.replace(/[。\.]$/, '');
      
      if (!text.trim()) return;

      // 添加用户消息
      const userMsg = { role: 'user', content: text };
      const currentHistory = this.data.chatHistory;
      const newHistory = [...currentHistory, userMsg];
      
      this.setData({ 
        chatHistory: newHistory,
        scrollIntoView: 'bottom-anchor'
      });

      // 模拟 AI 思考和回复
      this.processAIResponse(text);
    },

    processAIResponse(query) {
      wx.showLoading({ title: '思考中...' });
      
      setTimeout(() => {
        wx.hideLoading();
        
        let aiContent = `我听到了：${query}。\n(演示模式：本地规则匹配)`;
        
        // 简单的本地规则演示
        if (query.includes('排座') || query.includes('座位')) {
          aiContent = '好的，正在为您打开排座引擎...';
          wx.navigateTo({
            url: '/pages/module2/index',
            fail: () => wx.switchTab({ url: '/pages/module2/index' })
          });
        } else if (query.includes('班委')) {
          aiContent = '好的，正在前往班委胜任力模型...';
          wx.navigateTo({
            url: '/pages/module3/index',
            fail: () => wx.switchTab({ url: '/pages/module3/index' })
          });
        } else if (query.includes('生态') || query.includes('关系')) {
          aiContent = '已为您展示班级生态分析。';
          wx.navigateTo({
            url: '/pages/module1/index',
            fail: () => wx.switchTab({ url: '/pages/module1/index' })
          });
        }

        const aiMsg = { role: 'ai', content: aiContent };
        
        this.setData({
          chatHistory: [...this.data.chatHistory, aiMsg],
          scrollIntoView: 'bottom-anchor'
        });
        
        // 这里无法使用 WechatSI 的 TTS，如果需要发声，
        // 需要调用其他 TTS API 并播放返回的音频文件。
        // 暂时只做文本回复。
        
      }, 800);
    }
  }
})
