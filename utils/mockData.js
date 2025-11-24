/**
 * Mock数据集中管理模块
 * 用于项目前期开发，所有数据均为模拟数据
 */

// Mock班级列表数据
export const mockClassList = [
  "五年级一班",
  "五年级二班",
  "五年级三班"
];

// Mock用户信息数据
export const mockUserInfo = {
  avatarUrl: '/images/teacher.png', // 默认头像URL
  nickName: '张老师'
};

// Mock功能模块数据
export const mockModules = [
  {
    id: 1,
    name: '班级生态评估',
    icon: '🌳',
    description: '分析班级社交网络，识别关键节点',
    path: '/pages/module1/index'
  },
  {
    id: 2,
    name: '智能排座引擎',
    icon: '🪑',
    description: '基于多参数优化自动生成座位表',
    path: '/pages/module2/index'
  },
  {
    id: 3,
    name: '班委胜任力模型',
    icon: '👑',
    description: '基于数据分析推荐最适合的班委人选',
    path: '/pages/module3/index'
  }
];

// ========== 模块1：班级生态评估 Mock数据 ==========
// 问卷数据：学生及其朋友关系
export const mockQuestionnaireData = [
  { studentId: 's001', studentName: '张小明', friends: ['s002', 's003', 's004', 's005'] },
  { studentId: 's002', studentName: '李小红', friends: ['s001', 's003', 's006'] },
  { studentId: 's003', studentName: '王小强', friends: ['s001', 's002', 's004', 's007', 's008'] },
  { studentId: 's004', studentName: '赵小美', friends: ['s001', 's003', 's005'] },
  { studentId: 's005', studentName: '孙小亮', friends: ['s001', 's004', 's006'] },
  { studentId: 's006', studentName: '周小静', friends: ['s002', 's005', 's007'] },
  { studentId: 's007', studentName: '吴小刚', friends: ['s003', 's006', 's008'] },
  { studentId: 's008', studentName: '郑小芳', friends: ['s003', 's007', 's009'] },
  { studentId: 's009', studentName: '钱小华', friends: ['s008', 's010'] },
  { studentId: 's010', studentName: '陈小丽', friends: ['s009'] },
  { studentId: 's011', studentName: '林小军', friends: ['s012'] },
  { studentId: 's012', studentName: '黄小燕', friends: ['s011', 's013'] },
  { studentId: 's013', studentName: '刘小波', friends: ['s012'] },
  { studentId: 's014', studentName: '徐小婷', friends: [] }, // 孤立学生
  { studentId: 's015', studentName: '马小飞', friends: ['s001', 's003'] }
];

// ========== 模块2：智能排座引擎 Mock数据 ==========
// 学生数据：包含学科成绩、性格类型、互动记录
export const mockStudentsForSeating = [
  {
    id: 's001', name: '张小明', gender: 'male',
    scores: { math: 95, chinese: 88, english: 92, science: 90 },
    personality: { type: '外向', traits: ['活泼', '开朗', '积极'] },
    roles: ['班长'],
    socialScore: 92
  },
  {
    id: 's002', name: '李小红', gender: 'female',
    scores: { math: 75, chinese: 92, english: 88, science: 80 },
    personality: { type: '内向', traits: ['安静', '细心', '专注'] },
    roles: ['学习委员'],
    socialScore: 65
  },
  {
    id: 's003', name: '王小强', gender: 'male',
    scores: { math: 88, chinese: 75, english: 85, science: 90 },
    personality: { type: '外向', traits: ['活跃', '好动', '热情'] },
    roles: ['体育委员'],
    socialScore: 88
  },
  {
    id: 's004', name: '赵小美', gender: 'female',
    scores: { math: 82, chinese: 95, english: 90, science: 85 },
    personality: { type: '中性', traits: ['温和', '友善', '合作'] },
    roles: ['文艺委员'],
    socialScore: 75
  },
  {
    id: 's005', name: '孙小亮', gender: 'male',
    scores: { math: 55, chinese: 60, english: 50, science: 70 },
    personality: { type: '内向', traits: ['安静', '谨慎', '认真'] },
    roles: [],
    socialScore: 40
  },
  {
    id: 's006', name: '周小静', gender: 'female',
    scores: { math: 92, chinese: 85, english: 88, science: 90 },
    personality: { type: '中性', traits: ['稳重', '负责', '可靠'] },
    roles: ['英语课代表'],
    socialScore: 70
  },
  {
    id: 's007', name: '吴小刚', gender: 'male',
    scores: { math: 85, chinese: 80, english: 75, science: 88 },
    personality: { type: '外向', traits: ['活跃', '自信', '领导'] },
    roles: ['劳动委员'],
    socialScore: 85
  },
  {
    id: 's008', name: '郑小芳', gender: 'female',
    scores: { math: 78, chinese: 90, english: 85, science: 82 },
    personality: { type: '内向', traits: ['文静', '细心', '耐心'] },
    roles: [],
    socialScore: 55
  },
  {
    id: 's009', name: '钱小华', gender: 'male',
    scores: { math: 90, chinese: 88, english: 92, science: 95 },
    personality: { type: '中性', traits: ['平衡', '友善', '合作'] },
    roles: ['心理委员'],
    socialScore: 60
  },
  {
    id: 's010', name: '陈小丽', gender: 'female',
    scores: { math: 55, chinese: 70, english: 58, science: 62 },
    personality: { type: '内向', traits: ['安静', '害羞', '谨慎'] },
    roles: [],
    socialScore: 30
  },
  {
    id: 's011', name: '林小军', gender: 'male',
    scores: { math: 88, chinese: 82, english: 40, science: 90 },
    personality: { type: '外向', traits: ['活跃', '积极', '乐观'] },
    roles: [],
    socialScore: 80
  },
  {
    id: 's012', name: '黄小燕', gender: 'female',
    scores: { math: 80, chinese: 88, english: 90, science: 85 },
    personality: { type: '中性', traits: ['温和', '友善', '细心'] },
    roles: ['数学课代表'],
    socialScore: 68
  },
  {
    id: 's013', name: '刘小波', gender: 'male',
    scores: { math: 72, chinese: 75, english: 70, science: 78 },
    personality: { type: '内向', traits: ['安静', '认真', '专注'] },
    roles: [],
    socialScore: 45
  },
  {
    id: 's014', name: '徐小婷', gender: 'female',
    scores: { math: 85, chinese: 90, english: 88, science: 87 },
    personality: { type: '中性', traits: ['独立', '自主', '冷静'] },
    roles: ['语文课代表'],
    socialScore: 72
  },
  {
    id: 's015', name: '马小飞', gender: 'male',
    scores: { math: 95, chinese: 88, english: 90, science: 92 },
    personality: { type: '外向', traits: ['活跃', '自信', '创新'] },
    roles: ['宣传委员'],
    socialScore: 90
  }
];

// 互动历史记录（用于判断干扰）
export const mockInteractionHistory = [
  { studentId1: 's001', studentId2: 's003', type: 'positive', conflict: false },
  { studentId1: 's002', studentId2: 's005', type: 'negative', conflict: true },
  { studentId1: 's007', studentId2: 's011', type: 'positive', conflict: false }
];

// ========== 模块3：班委胜任力模型 Mock数据 ==========
// 学生行为数据和心理测评数据
export const mockStudentsForLeader = [
  {
    id: 's001', name: '张小明',
    behaviorData: {
      classPerformance: 95,      // 课堂表现
      homeworkCompletion: 98,    // 作业完成率
      taskCompletion: 95,        // 任务完成情况
      interactionFrequency: 90,  // 互动频率
      organizeActivities: 8,     // 组织活动次数
      coordinationAbility: 92,   // 协调能力
      averageScore: 91,          // 平均分
      activityParticipation: 95,  // 活动参与度
      creativeWorks: 6,          // 创意作品数
      fairnessObservation: 85,   // 公正性观察
      patienceObservation: 80    // 耐心观察
    },
    psychologicalData: {
      empathy: 75,              // 同理心
      expressiveness: 90,        // 表达能力
      patience: 80,             // 耐心
      observation: 85,          // 观察力
      courage: 88,              // 勇气
      creativity: 85            // 创造力
    }
  },
  {
    id: 's002', name: '李小红',
    behaviorData: {
      classPerformance: 85,
      homeworkCompletion: 100,
      taskCompletion: 95,
      interactionFrequency: 70,
      organizeActivities: 3,
      coordinationAbility: 75,
      averageScore: 85,
      activityParticipation: 80,
      creativeWorks: 4,
      fairnessObservation: 90,
      patienceObservation: 95
    },
    psychologicalData: {
      empathy: 95,
      expressiveness: 75,
      patience: 95,
      observation: 90,
      courage: 70,
      creativity: 70
    }
  },
  {
    id: 's003', name: '王小强',
    behaviorData: {
      classPerformance: 90,
      homeworkCompletion: 95,
      taskCompletion: 90,
      interactionFrequency: 95,
      organizeActivities: 7,
      coordinationAbility: 88,
      averageScore: 85,
      activityParticipation: 90,
      creativeWorks: 5,
      fairnessObservation: 80,
      patienceObservation: 75
    },
    psychologicalData: {
      empathy: 70,
      expressiveness: 90,
      patience: 70,
      observation: 75,
      courage: 85,
      creativity: 80
    }
  },
  {
    id: 's004', name: '赵小美',
    behaviorData: {
      classPerformance: 88,
      homeworkCompletion: 98,
      taskCompletion: 92,
      interactionFrequency: 85,
      organizeActivities: 5,
      coordinationAbility: 85,
      averageScore: 88,
      activityParticipation: 85,
      creativeWorks: 6,
      fairnessObservation: 88,
      patienceObservation: 85
    },
    psychologicalData: {
      empathy: 85,
      expressiveness: 85,
      patience: 85,
      observation: 80,
      courage: 80,
      creativity: 85
    }
  },
  {
    id: 's005', name: '孙小亮',
    behaviorData: {
      classPerformance: 75,
      homeworkCompletion: 90,
      taskCompletion: 85,
      interactionFrequency: 60,
      organizeActivities: 2,
      coordinationAbility: 70,
      averageScore: 74,
      activityParticipation: 70,
      creativeWorks: 3,
      fairnessObservation: 85,
      patienceObservation: 80
    },
    psychologicalData: {
      empathy: 80,
      expressiveness: 65,
      patience: 85,
      observation: 75,
      courage: 70,
      creativity: 70
    }
  },
  {
    id: 's006', name: '周小静',
    behaviorData: {
      classPerformance: 92,
      homeworkCompletion: 100,
      taskCompletion: 98,
      interactionFrequency: 80,
      organizeActivities: 4,
      coordinationAbility: 85,
      averageScore: 89,
      activityParticipation: 85,
      creativeWorks: 4,
      fairnessObservation: 90,
      patienceObservation: 90
    },
    psychologicalData: {
      empathy: 85,
      expressiveness: 80,
      patience: 90,
      observation: 85,
      courage: 75,
      creativity: 75
    }
  },
  {
    id: 's007', name: '吴小刚',
    behaviorData: {
      classPerformance: 88,
      homeworkCompletion: 95,
      taskCompletion: 90,
      interactionFrequency: 92,
      organizeActivities: 6,
      coordinationAbility: 90,
      averageScore: 82,
      activityParticipation: 95,
      creativeWorks: 7,
      fairnessObservation: 85,
      patienceObservation: 75
    },
    psychologicalData: {
      empathy: 75,
      expressiveness: 88,
      patience: 75,
      observation: 80,
      courage: 90,
      creativity: 90
    }
  },
  {
    id: 's008', name: '郑小芳',
    behaviorData: {
      classPerformance: 85,
      homeworkCompletion: 98,
      taskCompletion: 92,
      interactionFrequency: 75,
      organizeActivities: 3,
      coordinationAbility: 80,
      averageScore: 84,
      activityParticipation: 80,
      creativeWorks: 5,
      fairnessObservation: 88,
      patienceObservation: 95
    },
    psychologicalData: {
      empathy: 92,
      expressiveness: 80,
      patience: 95,
      observation: 90,
      courage: 75,
      creativity: 80
    }
  }
];

// ========== 模块1：SCL-90心理测评数据 ==========
// SCL-90量表包含9个维度，每个维度10个题目，每题1-5分
export const mockSCL90Data = [
  {
    studentId: 's001', studentName: '张小明',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 2, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      depression: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      anxiety: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  },
  {
    studentId: 's002', studentName: '李小红',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      depression: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      anxiety: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  },
  {
    studentId: 's003', studentName: '王小强',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      depression: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      anxiety: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  },
  {
    studentId: 's004', studentName: '赵小美',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      depression: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      anxiety: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  },
  {
    studentId: 's005', studentName: '孙小亮',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [2, 2, 2, 2, 1, 1, 1, 1, 1, 1] }, // 人际关系敏感：关注
      depression: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      anxiety: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  },
  {
    studentId: 's006', studentName: '周小静',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      depression: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      anxiety: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  },
  {
    studentId: 's007', studentName: '吴小刚',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      depression: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      anxiety: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  },
  {
    studentId: 's008', studentName: '郑小芳',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      depression: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      anxiety: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  },
  {
    studentId: 's009', studentName: '钱小华',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      depression: { items: [2, 2, 2, 2, 2, 1, 1, 1, 1, 1] }, // 抑郁：关注
      anxiety: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  },
  {
    studentId: 's010', studentName: '陈小丽',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      depression: { items: [2, 2, 2, 2, 2, 1, 1, 1, 1, 1] }, // 抑郁：关注
      anxiety: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  },
  {
    studentId: 's011', studentName: '林小军',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      depression: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      anxiety: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  },
  {
    studentId: 's012', studentName: '黄小燕',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      depression: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      anxiety: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  },
  {
    studentId: 's013', studentName: '刘小波',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      depression: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      anxiety: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  },
  {
    studentId: 's014', studentName: '徐小婷',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      depression: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      anxiety: { items: [2, 2, 2, 2, 2, 2, 2, 1, 1, 1] }, // 焦虑：异常
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  },
  {
    studentId: 's015', studentName: '马小飞',
    scl90Data: {
      somatization: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      obsessive: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      interpersonal: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      depression: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      anxiety: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      hostility: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      phobic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      paranoid: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      psychotic: { items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
    }
  }
];

// Mock测试数据（用于子页面，保持向后兼容）
export const mockTestData = {
  module1: {
    title: '班级生态评估',
    data: '功能开发中...'
  },
  module2: {
    title: '智能排座引擎',
    data: '功能开发中...'
  },
  module3: {
    title: '班委胜任力模型',
    data: '功能开发中...'
  }
};

