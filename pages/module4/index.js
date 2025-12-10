// pages/module4/index.js
import * as echarts from '../../components/ec-canvas/echarts';
import { studentManager } from '../../utils/studentManager';

Page({
  data: {
    studentList: [],
    suggestions: [],
    showDetail: false,
    currentStudent: null,
    ecTotal: { lazyLoad: true },
    ecRadar: { lazyLoad: true },
    ecMain: { lazyLoad: true }
  },

  onLoad() {
    // 页面加载
  },

  onShow() {
    this.initData();
  },

  initData() {
    // 1. 加载学生列表
    const allStudents = studentManager.getAll();
    // 格式化列表数据
    const list = allStudents.map(s => ({
        id: s.id,
        name: s.name,
        roles: s.roles,
      // 取最新一次总分
      lastTotal: s.exams && s.exams.length > 0 ? s.exams[s.exams.length - 1].total : '-'
    }));

    // 2. 生成建议
    const suggestions = studentManager.analyzeTrends();

    this.setData({
      studentList: list,
      suggestions: suggestions
    });
  },

  showStudentDetail(e) {
    const id = e.currentTarget.dataset.id;
    const student = studentManager.getById(id);
    if (!student) return;

    // 获取最新成绩并格式化为列表
    const lastExam = student.exams && student.exams.length > 0 
      ? student.exams[student.exams.length - 1] 
      : { scores: {} };
    
    const subjectMap = {
      chinese: '语文', math: '数学', english: '英语',
      physics: '物理', chemistry: '化学', biology: '生物',
      history: '历史', geography: '地理', politics: '政治'
    };

    const subjectScores = Object.entries(lastExam.scores).map(([key, score]) => ({
      key,
      name: subjectMap[key] || key,
      score
    }));

      this.setData({
      showDetail: true,
        currentStudent: student,
      subjectScores: subjectScores
      });

    // 延迟初始化图表，确保DOM已渲染
      setTimeout(() => {
      this.initCharts(student);
    }, 300);
  },

  closeDetail() {
    this.setData({ showDetail: false, currentStudent: null });
  },

  catchTap() {
    // 阻止冒泡
  },

  // --- 图表初始化逻辑 ---
  initCharts(student) {
    if (!student.exams || student.exams.length === 0) return;

    // 1. 总分趋势图
    this.initTotalScoreChart(student);
    
    // 2. 雷达图
    this.initRadarChart(student);

    // 3. 主科趋势图
    this.initMainSubjectChart(student);
  },

  initTotalScoreChart(student) {
    const component = this.selectComponent('#total-score-chart');
    if (!component) return;

    const xData = student.exams.map(e => e.name);
    const yData = student.exams.map(e => e.total);

    component.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, { width, height, devicePixelRatio: dpr });
      const option = {
        grid: { top: 30, bottom: 30, left: 40, right: 20 },
        xAxis: { type: 'category', data: xData },
        yAxis: { type: 'value', min: 'dataMin' },
        series: [{
          data: yData,
          type: 'line',
          smooth: true,
          label: { show: true },
          lineStyle: { color: '#1890ff' },
          itemStyle: { color: '#1890ff' }
        }]
      };
      chart.setOption(option);
      return chart;
    });
  },

  initRadarChart(student) {
    const component = this.selectComponent('#subject-radar-chart');
    if (!component) return;

    const lastExam = student.exams[student.exams.length - 1];
    const scores = lastExam.scores;
    // 定义雷达图维度 (9门)
    const indicator = [
      { name: '语文', max: 100 }, { name: '数学', max: 100 }, { name: '英语', max: 100 },
      { name: '物理', max: 100 }, { name: '化学', max: 100 }, { name: '生物', max: 100 },
      { name: '历史', max: 100 }, { name: '地理', max: 100 }, { name: '政治', max: 100 }
    ];
    const data = [
      scores.chinese, scores.math, scores.english,
      scores.physics, scores.chemistry, scores.biology,
      scores.history, scores.geography, scores.politics
    ];

    component.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, { width, height, devicePixelRatio: dpr });
    const option = {
        radar: {
          indicator: indicator,
          radius: '65%',
          center: ['50%', '50%']
        },
      series: [{
          type: 'radar',
          data: [{
            value: data,
            name: '最新成绩',
            areaStyle: { color: 'rgba(24,144,255, 0.3)' },
            lineStyle: { color: '#1890ff' }
          }]
        }]
      };
      chart.setOption(option);
      return chart;
    });
  },

  initMainSubjectChart(student) {
    const component = this.selectComponent('#main-subject-chart');
    if (!component) return;

    const xData = student.exams.map(e => e.name);
    // 语数英
    const chineseData = student.exams.map(e => e.scores.chinese);
    const mathData = student.exams.map(e => e.scores.math);
    const englishData = student.exams.map(e => e.scores.english);

    component.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, { width, height, devicePixelRatio: dpr });
      const option = {
        grid: { top: 40, bottom: 30, left: 40, right: 20 },
        tooltip: { trigger: 'axis' },
        legend: { data: ['语文', '数学', '英语'], top: 0 },
        xAxis: { type: 'category', data: xData },
        yAxis: { type: 'value', min: 50 },
        series: [
          { name: '语文', type: 'line', data: chineseData, smooth: true },
          { name: '数学', type: 'line', data: mathData, smooth: true },
          { name: '英语', type: 'line', data: englishData, smooth: true }
        ]
    };
      chart.setOption(option);
      return chart;
    });
  }
})
