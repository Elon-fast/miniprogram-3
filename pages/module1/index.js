// module1/index.js - 班级生态评估模块
import { get } from '../../utils/api.js';
import { analyzeClassEcology } from '../../utils/socialNetworkAnalysis.js';
import { buildGraphFromQuestionnaire } from '../../utils/networkGraphRenderer.js';
import { assessClassPsychology, findConnectedComponents, analyzeAllGroups, assessStudentPsychology, SCL90_DIMENSIONS } from '../../utils/psychologicalAssessment.js';
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
   * 加载心理测评数据并分析
   */
  async loadAndAnalyzePsychology(graphData, analysisResult) {
    try {
      // 1. 获取SCL-90心理测评数据
      const scl90Res = await get('/api/module1/scl90');
      if (scl90Res.code === 200 && scl90Res.data) {
        // 2. 评估班级整体心理状态
        const classPsychology = assessClassPsychology(scl90Res.data);
        
        // 3. 查找小团体（连通分量）
        const components = findConnectedComponents(graphData.nodes, graphData.edges);
        
        // 4. 分析每个小团体的心理状态
        const groupAnalysis = analyzeAllGroups(components, scl90Res.data);
        
        // 5. 筛选需要关注的小团体
        const concernGroups = groupAnalysis.filter(group => group.needsAttention);
        
        // 6. 格式化数据（WXML不支持.toFixed()）
        // 格式化班级整体心理状态，添加所有维度的均值
        const dimensionList = Object.keys(SCL90_DIMENSIONS).map(key => ({
          key: key,
          name: SCL90_DIMENSIONS[key].name,
          threshold: SCL90_DIMENSIONS[key].threshold,
          average: classPsychology.dimensionAverages[key] || 0,
          averageFormatted: (classPsychology.dimensionAverages[key] || 0).toFixed(2),
          thresholdFormatted: SCL90_DIMENSIONS[key].threshold.toFixed(1),
          status: (classPsychology.dimensionAverages[key] || 0) >= SCL90_DIMENSIONS[key].threshold ? '异常' : 
                  (classPsychology.dimensionAverages[key] || 0) >= SCL90_DIMENSIONS[key].threshold * 0.8 ? '关注' : '正常'
        }));
        
        const formattedClassPsychology = {
          ...classPsychology,
          concernDimensions: classPsychology.concernDimensions.map(dim => ({
            ...dim,
            scoreFormatted: dim.score.toFixed(2)
          })),
          dimensionList: dimensionList // 添加所有维度列表
        };
        
        // 生成班级维度图表
        const classDimensionsChartOption = this.createClassDimensionsChartOption(dimensionList);
        
        // 格式化学生心理数据，为每个学生添加详细的维度得分
        const formattedStudentsData = scl90Res.data.map(student => {
          const assessment = assessStudentPsychology(student.scl90Data || {});
          const dimensionScores = Object.keys(SCL90_DIMENSIONS).map(key => {
            const score = assessment.scores[key] || 0;
            const threshold = SCL90_DIMENSIONS[key].threshold;
            return {
              key: key,
              name: SCL90_DIMENSIONS[key].name,
              score: score,
              scoreFormatted: score.toFixed(2),
              threshold: threshold,
              thresholdFormatted: threshold.toFixed(1),
              status: score >= threshold ? '异常' : score >= threshold * 0.8 ? '关注' : '正常'
            };
          });
          
          return {
            ...student,
            assessment: assessment,
            dimensionScores: dimensionScores
          };
        });
        
        const formattedGroupAnalysis = groupAnalysis.map((group, index) => {
          // 为每个小团体添加学生详细信息
          const groupStudents = formattedStudentsData.filter(s => group.nodeIds.includes(s.studentId));
          
          return {
            ...group,
            index: index + 1, // 添加索引
            students: groupStudents, // 添加学生详细信息
            problemDimensions: group.problemDimensions.map(prob => ({
              ...prob,
              scoreFormatted: prob.score.toFixed(2),
              thresholdFormatted: prob.threshold.toFixed(1)
            })),
            reasonText: group.problemDimensions.length > 0 
              ? `${group.problemDimensions[0].name}得分偏高，平均分${group.problemDimensions[0].score.toFixed(2)}，超过临界值${group.problemDimensions[0].threshold.toFixed(1)}`
              : '整体心理状态需要关注'
          };
        });
        
        const formattedConcernGroups = concernGroups.map((group, index) => {
          const groupStudents = formattedStudentsData.filter(s => group.nodeIds.includes(s.studentId));
          
          return {
            ...group,
            index: index + 1,
            students: groupStudents, // 添加学生详细信息
            problemDimensions: group.problemDimensions.map(prob => ({
              ...prob,
              scoreFormatted: prob.score.toFixed(2),
              thresholdFormatted: prob.threshold.toFixed(1)
            })),
            reasonText: group.problemDimensions.length > 0 
              ? `${group.problemDimensions[0].name}得分偏高，平均分${group.problemDimensions[0].score.toFixed(2)}，超过临界值${group.problemDimensions[0].threshold.toFixed(1)}`
              : '整体心理状态需要关注'
          };
        });
        
        // 7. 为需要关注的小团体生成ECharts图表
        let psychologyChartOption = null;
        if (formattedConcernGroups.length > 0) {
          psychologyChartOption = this.createPsychologyChartOption(formattedConcernGroups);
        }
        
        this.setData({
          classPsychology: formattedClassPsychology,
          groupAnalysis: formattedGroupAnalysis,
          concernGroups: formattedConcernGroups,
          studentsPsychologyData: formattedStudentsData, // 保存学生数据
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
        console.log('小团体分析完成:', groupAnalysis);
        console.log('需要关注的小团体:', concernGroups);
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
        max: 3,
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
            formatter: (params) => params.data.value.toFixed(2)
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
            formatter: (params) => params.data.toFixed(1)
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
    const dimensions = [];
    
    concernGroups.forEach((group, index) => {
      if (group.problemDimensions && group.problemDimensions.length > 0) {
        const mainProblem = group.problemDimensions[0];
        seriesData.push({
          value: mainProblem.score,
          name: `小团体${index + 1}`,
          groupIndex: index,
          groupInfo: group
        });
        dimensions.push(mainProblem.name);
      }
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
          if (group.problemDimensions && group.problemDimensions.length > 0) {
            html += `<div style="margin-top: 8px; font-weight: bold;">问题维度:</div>`;
            group.problemDimensions.forEach(prob => {
              html += `<div style="margin-left: 8px;">• ${prob.name}: ${prob.score.toFixed(2)}</div>`;
            });
          }
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
            color: item.value >= 2.0 ? '#ff4d4f' : item.value >= 1.5 ? '#faad14' : '#1890ff'
          }
        })),
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.data.value.toFixed(2);
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
        name: '得分',
        min: 0,
        max: 3,
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
