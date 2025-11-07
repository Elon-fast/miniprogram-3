// module1/index.js - 班级生态评估模块
import { get } from '../../utils/api.js';
import { analyzeClassEcology } from '../../utils/socialNetworkAnalysis.js';
import { buildGraphFromQuestionnaire } from '../../utils/networkGraphRenderer.js';
import * as echarts from '../../components/ec-canvas/echarts';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '班级生态评估',
    loading: false,
    analysisResult: null,
    showDetails: false,
    showHelpModal: false, // 显示帮助说明弹窗
    selectedNodeInfo: null, // 选中的节点信息
    showNodeModal: false, // 显示节点详情弹窗
    ec: {
      onInit: null // ECharts初始化函数
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadAndAnalyze();
  },

  /**
   * 加载问卷数据并进行分析
   */
  async loadAndAnalyze() {
    this.setData({ loading: true });
    
    try {
      // 1. 获取问卷数据
      const res = await get('/api/module1/questionnaire');
      if (res.code === 200 && res.data) {
        // 2. 使用工具模块进行分析
        const analysisResult = analyzeClassEcology(res.data);
        
        // 3. 格式化数据（WXML不支持直接调用.toFixed()等方法）
        // 格式化网络统计
        analysisResult.networkStats.averageDegreeFormatted = analysisResult.networkStats.averageDegree.toFixed(1);
        
        // 格式化学生列表数据
        analysisResult.studentList = analysisResult.studentList.map(student => ({
          ...student,
          degreeCentralityFormatted: (student.degreeCentrality * 100).toFixed(1),
          betweennessCentralityFormatted: (student.betweennessCentrality * 100).toFixed(1)
        }));
        
        // 格式化意见领袖数据
        analysisResult.leaders = analysisResult.leaders.map(leader => ({
          ...leader,
          degreeCentralityFormatted: (leader.degreeCentrality * 100).toFixed(1),
          betweennessCentralityFormatted: (leader.betweennessCentrality * 100).toFixed(1)
        }));
        
        // 格式化孤立学生数据
        analysisResult.isolated = analysisResult.isolated.map(isolated => ({
          ...isolated,
          degreeCentralityFormatted: (isolated.degreeCentrality * 100).toFixed(1)
        }));
        
        // 4. 构建关系图数据并转换为ECharts格式
        const graphData = buildGraphFromQuestionnaire(res.data, analysisResult);
        const echartsOption = this.convertToEChartsOption(graphData, analysisResult);
        
        console.log('班级生态分析完成:', analysisResult);
        console.log('关系图数据:', graphData);
        console.log('ECharts配置:', echartsOption);
        
        // 5. 设置ECharts初始化函数
        // 注意：需要将echartsOption保存到this上，因为onInit函数会在组件ready时调用
        this.echartsOption = echartsOption;
        
        this.setData({
          analysisResult: analysisResult,
          ec: {
            onInit: (canvas, width, height, dpr) => {
              console.log('ECharts初始化开始', { width, height, dpr });
              try {
                const chart = this.initChart(canvas, width, height, dpr, this.echartsOption);
                console.log('ECharts初始化成功');
                return chart;
              } catch (error) {
                console.error('ECharts初始化失败:', error);
                return null;
              }
            }
          },
          loading: false
        });
      }
    } catch (error) {
      console.error('数据加载或分析失败:', error);
      wx.showToast({
        title: '分析失败，请重试',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 将图数据转换为ECharts配置
   */
  convertToEChartsOption(graphData, analysisResult) {
    const { nodes, edges } = graphData;
    
    // 定义节点类别
    const categories = [
      { name: '意见领袖' },
      { name: '普通学生' },
      { name: '需要关注' }
    ];
    
    // 转换节点数据
    const echartsNodes = nodes.map(node => {
      let category = 1; // 默认普通学生
      if (analysisResult.leaders.find(l => l.id === node.id)) {
        category = 0; // 意见领袖
      } else if (analysisResult.isolated.find(i => i.id === node.id)) {
        category = 2; // 需要关注
      }
      
      return {
        id: node.id,
        name: node.name,
        category: category,
        symbolSize: 40 + node.degree * 5, // 节点大小根据连接数调整（调大）
        value: node.degree, // 用于显示连接数
        degree: node.degree, // 保存连接数
        degreeCentrality: node.degreeCentrality, // 保存度中心性
        betweennessCentrality: node.betweennessCentrality, // 保存中介中心性
        label: {
          show: true,
          fontSize: 13,
          fontWeight: 'bold'
        },
        itemStyle: {
          // 颜色会根据category自动设置
        }
      };
    });
    
    // 转换边数据
    // 确保边的source和target是节点id（字符串），而不是节点对象
    const echartsLinks = edges.map(edge => {
      // 如果source/target是对象，提取id
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id || edge.source;
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id || edge.target;
      
      return {
        source: sourceId,
        target: targetId,
        lineStyle: {
          color: '#d9d9d9',
          width: 1,
          curveness: 0.1 // 边的弯曲度
        }
      };
    });
    
    console.log('转换后的节点:', echartsNodes);
    console.log('转换后的边:', echartsLinks);
    
    return {
      backgroundColor: '#fafafa',
      tooltip: {
        show: true,
        trigger: 'item',
        formatter: (params) => {
          if (params.dataType === 'node') {
            const nodeData = params.data;
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 6px; font-size: 14px;">${nodeData.name}</div>
                <div style="margin-bottom: 4px;">连接数: ${nodeData.degree || 0}</div>
                <div style="margin-bottom: 4px;">度中心性: ${((nodeData.degreeCentrality || 0) * 100).toFixed(1)}%</div>
                <div>中介中心性: ${((nodeData.betweennessCentrality || 0) * 100).toFixed(1)}%</div>
              </div>
            `;
          }
          return '';
        }
      },
      legend: {
        show: true,
        data: categories.map(c => c.name),
        top: 10,
        left: 'center',
        textStyle: {
          fontSize: 12
        }
      },
      color: ['#52c41a', '#1890ff', '#faad14'], // 自定义颜色：绿色(意见领袖)、蓝色(普通)、橙色(需要关注)
      series: [{
        type: 'graph',
        layout: 'force', // 力导向布局
        data: echartsNodes,
        links: echartsLinks,
        categories: categories,
        roam: true, // 开启缩放和平移
        draggable: true, // 节点可拖动
        focusNodeAdjacency: true, // 鼠标悬停时高亮相邻节点
        selectedMode: 'single', // 允许选中节点
        force: {
          repulsion: 300, // 节点之间的斥力（增大使节点分散）
          gravity: 0.2, // 重力，防止节点飞出去
          edgeLength: [50, 150], // 边的理想长度范围
          layoutAnimation: true, // 布局动画
          friction: 0.6 // 摩擦系数
        },
        label: {
          show: true,
          position: 'inside',
          fontSize: 12,
          color: '#fff',
          fontWeight: 'bold'
        },
        lineStyle: {
          color: '#d9d9d9',
          width: 1,
          curveness: 0.1
        },
        emphasis: {
          focus: 'adjacency', // 高亮相邻节点和边
          lineStyle: {
            width: 2,
            color: '#1890ff'
          },
          label: {
            fontSize: 13
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2
        }
      }]
    };
  },

  /**
   * 初始化ECharts图表
   */
  initChart(canvas, width, height, dpr, option) {
    console.log('initChart调用', { width, height, dpr, hasOption: !!option });
    
    if (!canvas) {
      console.error('Canvas对象为空');
      return null;
    }
    
    if (!option) {
      console.error('ECharts配置为空');
      return null;
    }
    
    try {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      
      if (canvas.setChart) {
        canvas.setChart(chart);
      }
      
      chart.setOption(option, true); // true表示不合并，完全替换
      
      // 监听节点点击事件
      chart.on('click', (params) => {
        if (params.dataType === 'node') {
          console.log('节点被点击:', params.data);
          this.showNodeDetail(params.data);
        }
      });
      
      console.log('ECharts图表创建成功', chart);
      
      // 保存chart实例，用于后续操作
      this.chart = chart;
      
      return chart;
    } catch (error) {
      console.error('ECharts初始化错误:', error);
      return null;
    }
  },

  /**
   * 切换详情显示
   */
  toggleDetails() {
    this.setData({
      showDetails: !this.data.showDetails
    });
  },

  /**
   * 重新分析
   */
  reAnalyze() {
    this.loadAndAnalyze();
  },

  /**
   * 重置视图
   */
  resetView() {
    if (this.chart) {
      // 重新设置选项以重置视图
      const currentOption = this.chart.getOption();
      this.chart.setOption(currentOption, true); // true表示不合并，完全替换
      
      // 或者使用dispatchAction重置
      this.chart.dispatchAction({
        type: 'restore'
      });
    }
  },

  /**
   * 显示节点详情
   */
  showNodeDetail(nodeData) {
    this.setData({
      selectedNodeInfo: {
        name: nodeData.name,
        degree: nodeData.degree || 0,
        degreeCentrality: ((nodeData.degreeCentrality || 0) * 100).toFixed(1),
        betweennessCentrality: ((nodeData.betweennessCentrality || 0) * 100).toFixed(1)
      },
      showNodeModal: true
    });
  },

  /**
   * 关闭节点详情弹窗
   */
  closeNodeModal() {
    this.setData({
      showNodeModal: false,
      selectedNodeInfo: null
    });
  },

  /**
   * 显示帮助说明
   */
  showHelp() {
    this.setData({
      showHelpModal: true
    });
  },

  /**
   * 关闭帮助说明
   */
  closeHelpModal() {
    this.setData({
      showHelpModal: false
    });
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
});
