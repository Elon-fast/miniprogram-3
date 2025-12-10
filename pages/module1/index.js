// module1/index.js - 班级生态评估模块
import { get } from '../../utils/api.js';
import { analyzeClassEcology } from '../../utils/socialNetworkAnalysis.js';
import { buildGraphFromQuestionnaire } from '../../utils/networkGraphRenderer.js';
import { assessClassPsychology, findConnectedComponents, analyzeAllGroups, assessStudentPsychology, PERSONALITY_DIMENSIONS } from '../../utils/psychologicalAssessment.js';
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
    classPsychology: null, // 班级整体心理状态
    groupAnalysis: null, // 小团体分析结果
    concernGroups: [], // 需要关注的小团体
    studentsPsychologyData: null, // 学生心理数据（用于显示详情）
    selectedStudent: null, // 选中的学生
    showStudentDetail: false, // 显示学生详情弹窗
    ec: {
      onInit: null // ECharts初始化函数（关系图）
    },
    ecPsychology: {
      onInit: null // ECharts初始化函数（心理状态图）
    },
    ecClassDimensions: {
      onInit: null // ECharts初始化函数（班级维度图）
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
        
        // 5. 加载心理测评数据并分析
        await this.loadAndAnalyzePsychology(graphData, analysisResult);
        
        // 6. 设置ECharts初始化函数
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
            // ECharts在小程序端不支持HTML tooltip，改为纯文本换行
            return `${nodeData.name}\n连接数: ${nodeData.degree || 0}\n度中心性: ${((nodeData.degreeCentrality || 0) * 100).toFixed(1)}%\n中介中心性: ${((nodeData.betweennessCentrality || 0) * 100).toFixed(1)}%`;
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
          repulsion: 400, // 大幅增加斥力 (原120 -> 400)，让节点分得更开
          gravity: 0.05, // 进一步减小重力 (原0.1 -> 0.05)，允许节点利用更多空间
          edgeLength: [100, 250], // 显著拉长边的长度 (原[60, 150] -> [100, 250])
          layoutAnimation: true,
          friction: 0.6
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
   * 加载心理测评数据并分析
   */
  async loadAndAnalyzePsychology(graphData, analysisResult) {
    try {
      // 1. 获取心理测评数据 (更新为新接口)
      const psychologyRes = await get('/api/module1/psychology');
      if (psychologyRes.code === 200 && psychologyRes.data) {
        // 2. 评估班级整体心理状态
        const classPsychology = assessClassPsychology(psychologyRes.data);
        
        // 3. 查找小团体（连通分量）
        const components = findConnectedComponents(graphData.nodes, graphData.edges);
        
        // 4. 分析每个小团体的心理状态
        const groupAnalysis = analyzeAllGroups(components, psychologyRes.data);
        
        // 5. 筛选需要关注的小团体
        const concernGroups = groupAnalysis.filter(group => group.needsAttention).map((group, index) => ({
          ...group,
          name: `小团体 ${index + 1}`, // 添加名称
          members: group.studentNames // WXML使用的是item.members
        }));
        
        // 6. 格式化数据
        // 使用 PERSONALITY_DIMENSIONS 生成列表
        const dimensionList = Object.keys(PERSONALITY_DIMENSIONS).map(key => {
          const dim = PERSONALITY_DIMENSIONS[key];
          const avgScore = classPsychology.personalityAverages[key] || 0;
          
          // 逻辑调整：只分“正常”和“需关注”
          // 正面维度：低分(<60)需关注，高分(>=60)正常
          let statusLabel = '正常';
          if (avgScore < 60) statusLabel = '需关注';

          return {
            key: key,
            name: dim.name,
            threshold: dim.max,
            average: avgScore,
            averageFormatted: statusLabel, 
            thresholdFormatted: String(dim.max),
            status: avgScore < 60 ? '需关注' : '正常'
          };
        });

        const formattedStudentsData = psychologyRes.data.map(student => {
          // 传入新的 assessStudentPsychology
          const assessment = assessStudentPsychology(student.psychologicalData || {});
          
          return {
            ...student,
            assessment: assessment,
            // 维度分数用于详情展示
            dimensionScores: Object.keys(assessment.personalityScores).map(k => {
              const score = assessment.personalityScores[k];
              // 逻辑调整：只分“正常”和“需关注”
              let level = '正常';
              if (score < 60) level = '需关注';
              
              return {
                key: k,
                score: score,
                level: level, 
                name: PERSONALITY_DIMENSIONS[k] ? PERSONALITY_DIMENSIONS[k].name : k
              };
            })
          };
        });

        // 生成班级维度图表
        const classDimensionsChartOption = this.createClassDimensionsChartOption(dimensionList);
        
        // 生成心理状态图表（针对小团体）
        let psychologyChartOption = null;
        if (concernGroups.length > 0) {
          psychologyChartOption = this.createPsychologyChartOption(concernGroups);
        }

        this.setData({
          classPsychology: {
             ...classPsychology,
             dimensionList: dimensionList
          },
          groupAnalysis: groupAnalysis,
          concernGroups: concernGroups,
          studentsPsychologyData: formattedStudentsData,
          ecPsychology: {
            onInit: psychologyChartOption ? (canvas, width, height, dpr) => {
              return this.initChart(canvas, width, height, dpr, psychologyChartOption);
            } : null
          },
          ecClassDimensions: {
            onInit: classDimensionsChartOption ? (canvas, width, height, dpr) => {
              return this.initChart(canvas, width, height, dpr, classDimensionsChartOption);
            } : null
          }
        });
        
        console.log('班级心理状态评估完成:', classPsychology);
      }
    } catch (error) {
      console.error('心理测评数据加载失败:', error);
    }
  },

  /**
   * 创建班级维度图表配置
   */
  createClassDimensionsChartOption(dimensionList) {
    const dimensions = dimensionList.map(d => d.name);
    const averages = dimensionList.map(d => d.average);
    const thresholds = dimensionList.map(d => d.threshold);
    
    return {
      backgroundColor: '#fafafa',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          const param = params[0];
          const dim = dimensionList[param.dataIndex];
          let html = `<div style="padding: 8px;"><div style="font-weight: bold; margin-bottom: 6px;">${dim.name}</div>`;
          html += `<div style="margin-bottom: 4px;">班级均值: ${dim.averageFormatted}</div>`;
          html += `<div style="margin-bottom: 4px;">合理区间: 0 - ${dim.thresholdFormatted}</div>`;
          html += `<div style="margin-bottom: 4px;">状态: <span style="color: ${dim.status === '正常' ? '#52c41a' : dim.status === '关注' ? '#faad14' : '#ff4d4f'}">${dim.status}</span></div>`;
          html += `</div>`;
          return html;
        }
      },
      title: {
        text: '各维度班级均值',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16
        }
      },
      legend: {
        data: ['班级均值', '合理区间上限'],
        top: 40
      },
      xAxis: {
        type: 'category',
        data: dimensions,
        axisLabel: {
          fontSize: 11,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '得分',
        min: 0,
        max: 100, // 调整为100分制
        axisLabel: {
          fontSize: 12
        }
      },
      series: [
        {
          name: '班级均值',
          type: 'bar',
          data: averages.map((avg, index) => ({
            value: avg,
            itemStyle: {
              color: dimensionList[index].status === '正常' ? '#52c41a' : 
                     dimensionList[index].status === '关注' ? '#faad14' : '#ff4d4f'
            }
          })),
          label: {
            show: true,
            position: 'top',
            formatter: (params) => params.data.value.toFixed(1)
          }
        },
        {
          name: '合理区间上限',
          type: 'line',
          data: thresholds,
          lineStyle: {
            color: '#1890ff',
            type: 'dashed',
            width: 2
          },
          symbol: 'none',
          label: {
            show: true,
            position: 'top',
            formatter: (params) => params.data.toFixed(0)
          }
        }
      ]
    };
  },

  /**
   * 创建心理状态图表配置
   */
  createPsychologyChartOption(concernGroups) {
    // 准备数据：每个小团体的主要问题维度
    const seriesData = [];
    
    concernGroups.forEach((group, index) => {
      // 由于没有具体的 problemDimensions，这里使用 concernLevel
      seriesData.push({
        value: group.concernLevel,
        name: `小团体${index + 1}`,
        groupIndex: index,
        groupInfo: group
      });
    });
    
    return {
      backgroundColor: '#fafafa',
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const group = params.data.groupInfo;
          if (!group) return '';
          
          let html = `<div style="padding: 8px;"><div style="font-weight: bold; margin-bottom: 6px;">小团体${params.data.groupIndex + 1}</div>`;
          html += `<div style="margin-bottom: 4px;">成员: ${group.studentNames.join('、')}</div>`;
          html += `<div style="margin-bottom: 4px;">状态: ${group.groupStatus}</div>`;
          html += `<div style="margin-bottom: 4px;">平均风险分: ${group.avgRisk.toFixed(2)}</div>`;
          html += `</div>`;
          return html;
        }
      },
      title: {
        text: '需要关注的小团体',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16
        }
      },
      series: [{
        type: 'bar',
        data: seriesData.map((item, index) => ({
          value: item.value,
          name: `小团体${index + 1}`,
          itemStyle: {
            color: item.value >= 40 ? '#ff4d4f' : item.value >= 20 ? '#faad14' : '#1890ff'
          }
        })),
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.data.value.toFixed(1);
          }
        }
      }],
      xAxis: {
        type: 'category',
        data: seriesData.map((item, index) => `小团体${index + 1}`),
        axisLabel: {
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        name: '风险分',
        min: 0,
        max: 80, // 总分80
        axisLabel: {
          fontSize: 12
        }
      }
    };
  },

  /**
   * 显示学生详情
   */
  showStudentDetail(e) {
    const student = e.currentTarget.dataset.student;
    if (!student) return;
    
    // 尝试从心理数据中找到更详细的信息
    let detailedInfo = null;
    if (this.data.studentsPsychologyData) {
      detailedInfo = this.data.studentsPsychologyData.find(s => s.studentId === student.id || s.name === student.name);
    }
    
    // 如果没有心理数据，使用基本信息构建一个临时对象
    if (!detailedInfo) {
      detailedInfo = {
        ...student,
        dimensionScores: [] // 如果没有心理数据，则为空数组
      };
    }

    // 查找该学生在网络分析结果中的数据，添加社交指标
    let socialData = null;
    if (this.data.analysisResult && this.data.analysisResult.studentList) {
      socialData = this.data.analysisResult.studentList.find(s => s.id === student.id || s.name === student.name);
    }
    
    if (socialData) {
      detailedInfo.socialStats = [
        { label: '朋友圈大小', value: socialData.degree || 0, desc: '互动人数' },
        { label: '人缘指数', value: socialData.degreeCentralityFormatted + '%', desc: '受欢迎程度' },
        { label: '桥梁指数', value: socialData.betweennessCentralityFormatted + '%', desc: '沟通协调力' }
      ];
    }
    
    console.log('查看学生详情:', detailedInfo);
    
    this.setData({
      selectedStudent: detailedInfo,
      showStudentDetail: true
    });
  },

  /**
   * 关闭学生详情
   */
  closeStudentDetail() {
    this.setData({
      showStudentDetail: false,
      selectedStudent: null
    });
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止事件冒泡，防止点击内容区域关闭弹窗
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
   * 显示节点详情（复用学生详情弹窗）
   */
  showNodeDetail(nodeData) {
    console.log('显示节点详情:', nodeData);
    const studentId = nodeData.id;
    const studentName = nodeData.name;

    // 尝试从心理数据中找到更详细的信息
    let detailedInfo = null;
    if (this.data.studentsPsychologyData) {
      detailedInfo = this.data.studentsPsychologyData.find(s => s.studentId === studentId || s.name === studentName);
    }

    // 如果没有心理数据，使用节点的基本信息构建一个临时对象
    if (!detailedInfo) {
      detailedInfo = {
        id: studentId,
        name: studentName,
        dimensionScores: [] // 如果没有心理数据，则为空数组
      };
    }

    // 添加通俗化的社交指标
    detailedInfo.socialStats = [
      { label: '朋友圈大小', value: nodeData.degree || 0, desc: '互动人数' },
      { label: '人缘指数', value: ((nodeData.degreeCentrality || 0) * 100).toFixed(1) + '%', desc: '受欢迎程度' },
      { label: '桥梁指数', value: ((nodeData.betweennessCentrality || 0) * 100).toFixed(1) + '%', desc: '沟通协调力' }
    ];

    this.setData({
      selectedStudent: detailedInfo,
      showStudentDetail: true
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
