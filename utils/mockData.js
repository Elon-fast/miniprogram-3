/**
 * Mock数据集中管理模块
 * 统一数据源版本
 */

// Mock班级列表数据
export const mockClassList = [
  "九年级一班",
  "九年级二班",
  "九年级三班"
];

// Mock用户信息数据
export const mockUserInfo = {
  avatarUrl: '/images/teacher.png', 
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
  },
  {
    id: 4,
    name: '学情概览',
    icon: '📈',
    description: '全方位分析学生成绩波动与趋势',
    path: '/pages/module4/index'
  }
];

// 真实姓名列表
const realNames = [
  "唐梓俊", "陈艾希", "邹政杰", "易芯羽", "罗琪华", "刘思妍", "高知", "夏乐轩",
  "林煜琪", "张筱睿", "彭思远", "朱妙稀", "李泽民", "谷泽铭", "袁婕", "陈奕菲",
  "欧阳皓骏", "陈灵盈", "张诗涵", "余光程", "何文锋", "廖梓睿", "邓州淏", "袁航",
  "姚义乐", "陈子薇", "蔡俊熙", "胡远泽", "钟胤烜", "陈𠓾磊", "程思华", "黄静怡",
  "曾德鹏", "林钰涵", "彭丞宇", "吴宇轩", "申伟霖"
];

// 原始模板数据 (去除id和name，作为生成基础)
const templates = [
  {
    gender: 'male', roles: ['班长'],
    friends: ['s002', 's003', 's004', 's005'],
    personality: { type: '外向', traits: ['活泼', '开朗', '积极'] },
    exams: [
      { name: '第一次月考', total: 725, scores: { chinese: 85, math: 90, english: 88, physics: 82, chemistry: 85, biology: 88, history: 75, geography: 68, politics: 64 } },
      { name: '期中考试', total: 760, scores: { chinese: 88, math: 95, english: 92, physics: 88, chemistry: 90, biology: 92, history: 78, geography: 72, politics: 65 } },
      { name: '期末考试', total: 795, scores: { chinese: 90, math: 98, english: 95, physics: 92, chemistry: 95, biology: 95, history: 82, geography: 78, politics: 70 } }
    ],
    behaviorData: { classPerformance: 95, homeworkCompletion: 98, taskCompletion: 95, interactionFrequency: 90, organizeActivities: 8, coordinationAbility: 92, averageScore: 91, activityParticipation: 95, creativeWorks: 6, fairnessObservation: 85, patienceObservation: 80 }
  },
  {
    gender: 'female', roles: ['学习委员'],
    friends: ['s001', 's003', 's006'],
    personality: { type: '内向', traits: ['安静', '细心', '专注'] },
    exams: [
      { name: '第一次月考', total: 710, scores: { chinese: 92, math: 75, english: 88, physics: 80, chemistry: 85, biology: 82, history: 75, geography: 70, politics: 63 } },
      { name: '期中考试', total: 735, scores: { chinese: 94, math: 80, english: 90, physics: 82, chemistry: 88, biology: 85, history: 78, geography: 72, politics: 66 } },
      { name: '期末考试', total: 750, scores: { chinese: 95, math: 82, english: 92, physics: 85, chemistry: 90, biology: 88, history: 80, geography: 75, politics: 63 } }
    ],
    behaviorData: { classPerformance: 85, homeworkCompletion: 100, taskCompletion: 95, interactionFrequency: 70, organizeActivities: 3, coordinationAbility: 75, averageScore: 85, activityParticipation: 80, creativeWorks: 4, fairnessObservation: 90, patienceObservation: 95 }
  },
  {
    gender: 'male', roles: ['体育委员'],
    friends: ['s001', 's002', 's004', 's007', 's008'],
    personality: { type: '外向', traits: ['活跃', '好动', '热情'] },
    exams: [
      { name: '第一次月考', total: 680, scores: { chinese: 75, math: 88, english: 85, physics: 90, chemistry: 75, biology: 70, history: 65, geography: 68, politics: 64 } },
      { name: '期中考试', total: 710, scores: { chinese: 78, math: 92, english: 88, physics: 95, chemistry: 80, biology: 75, history: 68, geography: 70, politics: 64 } },
      { name: '期末考试', total: 740, scores: { chinese: 80, math: 95, english: 90, physics: 98, chemistry: 85, biology: 80, history: 72, geography: 75, politics: 65 } }
    ],
    behaviorData: { classPerformance: 90, homeworkCompletion: 95, taskCompletion: 90, interactionFrequency: 95, organizeActivities: 7, coordinationAbility: 88, averageScore: 85, activityParticipation: 90, creativeWorks: 5, fairnessObservation: 80, patienceObservation: 75 }
  },
  {
    gender: 'female', roles: ['文艺委员'],
    friends: ['s001', 's003', 's005'],
    personality: { type: '中性', traits: ['温和', '友善', '合作'] },
    exams: [
      { name: '第一次月考', total: 740, scores: { chinese: 95, math: 82, english: 90, physics: 85, chemistry: 88, biology: 90, history: 75, geography: 70, politics: 65 } },
      { name: '期中考试', total: 755, scores: { chinese: 96, math: 85, english: 92, physics: 88, chemistry: 90, biology: 92, history: 78, geography: 72, politics: 62 } },
      { name: '期末考试', total: 650, scores: { chinese: 88, math: 65, english: 85, physics: 75, chemistry: 80, biology: 85, history: 65, geography: 60, politics: 47 } }
    ],
    behaviorData: { classPerformance: 88, homeworkCompletion: 98, taskCompletion: 92, interactionFrequency: 85, organizeActivities: 5, coordinationAbility: 85, averageScore: 88, activityParticipation: 85, creativeWorks: 6, fairnessObservation: 88, patienceObservation: 85 }
  },
  {
    gender: 'male', roles: [],
    friends: ['s001', 's004', 's006'],
    personality: { type: '内向', traits: ['安静', '谨慎', '认真'] },
    exams: [
      { name: '第一次月考', total: 550, scores: { chinese: 60, math: 55, english: 50, physics: 70, chemistry: 65, biology: 60, history: 65, geography: 60, politics: 65 } },
      { name: '期中考试', total: 570, scores: { chinese: 62, math: 58, english: 55, physics: 72, chemistry: 68, biology: 62, history: 68, geography: 62, politics: 63 } },
      { name: '期末考试', total: 590, scores: { chinese: 65, math: 60, english: 60, physics: 75, chemistry: 70, biology: 65, history: 70, geography: 65, politics: 60 } }
    ],
    behaviorData: { classPerformance: 75, homeworkCompletion: 90, taskCompletion: 85, interactionFrequency: 60, organizeActivities: 2, coordinationAbility: 70, averageScore: 74, activityParticipation: 70, creativeWorks: 3, fairnessObservation: 85, patienceObservation: 80 }
  },
  {
    gender: 'female', roles: ['英语课代表'],
    friends: ['s002', 's005', 's007'],
    personality: { type: '中性', traits: ['稳重', '负责', '可靠'] },
    exams: [
      { name: '第一次月考', total: 760, scores: { chinese: 85, math: 92, english: 88, physics: 90, chemistry: 92, biology: 88, history: 80, geography: 75, politics: 70 } },
      { name: '期中考试', total: 775, scores: { chinese: 88, math: 94, english: 90, physics: 92, chemistry: 94, biology: 90, history: 82, geography: 78, politics: 67 } },
      { name: '期末考试', total: 790, scores: { chinese: 90, math: 96, english: 92, physics: 94, chemistry: 96, biology: 92, history: 85, geography: 80, politics: 65 } }
    ],
    behaviorData: { classPerformance: 92, homeworkCompletion: 100, taskCompletion: 98, interactionFrequency: 80, organizeActivities: 4, coordinationAbility: 85, averageScore: 89, activityParticipation: 85, creativeWorks: 4, fairnessObservation: 90, patienceObservation: 90 }
  },
  {
    gender: 'male', roles: ['劳动委员'],
    friends: ['s003', 's006', 's008'],
    personality: { type: '外向', traits: ['活跃', '自信', '领导'] },
    exams: [
      { name: '第一次月考', total: 700, scores: { chinese: 80, math: 85, english: 75, physics: 88, chemistry: 82, biology: 80, history: 75, geography: 70, politics: 65 } },
      { name: '期中考试', total: 720, scores: { chinese: 82, math: 88, english: 78, physics: 90, chemistry: 85, biology: 82, history: 78, geography: 72, politics: 65 } },
      { name: '期末考试', total: 740, scores: { chinese: 85, math: 90, english: 80, physics: 92, chemistry: 88, biology: 85, history: 80, geography: 75, politics: 65 } }
    ],
    behaviorData: { classPerformance: 88, homeworkCompletion: 95, taskCompletion: 90, interactionFrequency: 92, organizeActivities: 6, coordinationAbility: 90, averageScore: 82, activityParticipation: 95, creativeWorks: 7, fairnessObservation: 85, patienceObservation: 75 }
  },
  {
    gender: 'female', roles: [],
    friends: ['s003', 's007', 's009'],
    personality: { type: '内向', traits: ['文静', '细心', '耐心'] },
    exams: [
      { name: '第一次月考', total: 710, scores: { chinese: 90, math: 78, english: 85, physics: 82, chemistry: 80, biology: 85, history: 75, geography: 70, politics: 65 } },
      { name: '期中考试', total: 730, scores: { chinese: 92, math: 80, english: 88, physics: 85, chemistry: 82, biology: 88, history: 78, geography: 72, politics: 65 } },
      { name: '期末考试', total: 750, scores: { chinese: 95, math: 82, english: 90, physics: 88, chemistry: 85, biology: 90, history: 80, geography: 75, politics: 65 } }
    ],
    behaviorData: { classPerformance: 85, homeworkCompletion: 98, taskCompletion: 92, interactionFrequency: 75, organizeActivities: 3, coordinationAbility: 80, averageScore: 84, activityParticipation: 80, creativeWorks: 5, fairnessObservation: 88, patienceObservation: 95 }
  },
  {
    gender: 'male', roles: ['心理委员'],
    friends: ['s008', 's010'],
    personality: { type: '中性', traits: ['平衡', '友善', '合作'] },
    exams: [
      { name: '第一次月考', total: 780, scores: { chinese: 88, math: 90, english: 92, physics: 95, chemistry: 90, biology: 92, history: 80, geography: 82, politics: 71 } },
      { name: '期中考试', total: 795, scores: { chinese: 90, math: 92, english: 94, physics: 96, chemistry: 92, biology: 94, history: 82, geography: 85, politics: 70 } },
      { name: '期末考试', total: 810, scores: { chinese: 92, math: 95, english: 96, physics: 98, chemistry: 95, biology: 96, history: 85, geography: 88, politics: 65 } }
    ],
    behaviorData: { classPerformance: 88, homeworkCompletion: 98, taskCompletion: 92, interactionFrequency: 85, organizeActivities: 5, coordinationAbility: 85, averageScore: 88, activityParticipation: 85, creativeWorks: 6, fairnessObservation: 88, patienceObservation: 85 }
  },
  {
    gender: 'female', roles: [],
    friends: ['s009'],
    personality: { type: '内向', traits: ['安静', '害羞', '谨慎'] },
    exams: [
      { name: '第一次月考', total: 520, scores: { chinese: 70, math: 55, english: 58, physics: 62, chemistry: 60, biology: 65, history: 55, geography: 50, politics: 45 } },
      { name: '期中考试', total: 540, scores: { chinese: 72, math: 58, english: 60, physics: 65, chemistry: 62, biology: 68, history: 58, geography: 52, politics: 45 } },
      { name: '期末考试', total: 680, scores: { chinese: 85, math: 75, english: 78, physics: 78, chemistry: 75, biology: 80, history: 75, geography: 70, politics: 64 } }
    ],
    behaviorData: { classPerformance: 75, homeworkCompletion: 90, taskCompletion: 85, interactionFrequency: 60, organizeActivities: 2, coordinationAbility: 70, averageScore: 74, activityParticipation: 70, creativeWorks: 3, fairnessObservation: 85, patienceObservation: 80 }
  },
  {
    gender: 'male', roles: [],
    friends: ['s012'],
    personality: { type: '外向', traits: ['活跃', '积极', '乐观'] },
    exams: [
      { name: '第一次月考', total: 650, scores: { chinese: 82, math: 88, english: 40, physics: 90, chemistry: 85, biology: 80, history: 75, geography: 65, politics: 45 } },
      { name: '期中考试', total: 670, scores: { chinese: 84, math: 90, english: 45, physics: 92, chemistry: 88, biology: 82, history: 78, geography: 68, politics: 43 } },
      { name: '期末考试', total: 690, scores: { chinese: 86, math: 92, english: 50, physics: 95, chemistry: 90, biology: 85, history: 80, geography: 70, politics: 42 } }
    ],
    behaviorData: { classPerformance: 90, homeworkCompletion: 95, taskCompletion: 90, interactionFrequency: 95, organizeActivities: 7, coordinationAbility: 88, averageScore: 85, activityParticipation: 90, creativeWorks: 5, fairnessObservation: 80, patienceObservation: 75 }
  },
  {
    gender: 'female', roles: ['数学课代表'],
    friends: ['s011', 's013'],
    personality: { type: '中性', traits: ['温和', '友善', '细心'] },
    exams: [
      { name: '第一次月考', total: 720, scores: { chinese: 88, math: 80, english: 90, physics: 85, chemistry: 82, biology: 85, history: 75, geography: 70, politics: 65 } },
      { name: '期中考试', total: 740, scores: { chinese: 90, math: 82, english: 92, physics: 88, chemistry: 85, biology: 88, history: 78, geography: 72, politics: 65 } },
      { name: '期末考试', total: 760, scores: { chinese: 92, math: 85, english: 95, physics: 90, chemistry: 88, biology: 90, history: 80, geography: 75, politics: 65 } }
    ],
    behaviorData: { classPerformance: 88, homeworkCompletion: 98, taskCompletion: 92, interactionFrequency: 85, organizeActivities: 5, coordinationAbility: 85, averageScore: 88, activityParticipation: 85, creativeWorks: 6, fairnessObservation: 88, patienceObservation: 85 }
  },
  {
    gender: 'male', roles: [],
    friends: ['s012'],
    personality: { type: '内向', traits: ['安静', '认真', '专注'] },
    exams: [
      { name: '第一次月考', total: 600, scores: { chinese: 75, math: 72, english: 70, physics: 78, chemistry: 75, biology: 72, history: 65, geography: 50, politics: 43 } },
      { name: '期中考试', total: 620, scores: { chinese: 78, math: 75, english: 72, physics: 80, chemistry: 78, biology: 75, history: 68, geography: 52, politics: 42 } },
      { name: '期末考试', total: 640, scores: { chinese: 80, math: 78, english: 75, physics: 82, chemistry: 80, biology: 78, history: 70, geography: 55, politics: 42 } }
    ],
    behaviorData: { classPerformance: 75, homeworkCompletion: 90, taskCompletion: 85, interactionFrequency: 60, organizeActivities: 2, coordinationAbility: 70, averageScore: 74, activityParticipation: 70, creativeWorks: 3, fairnessObservation: 85, patienceObservation: 80 }
  },
  {
    gender: 'female', roles: ['语文课代表'],
    friends: [],
    personality: { type: '中性', traits: ['独立', '自主', '冷静'] },
    exams: [
      { name: '第一次月考', total: 720, scores: { chinese: 90, math: 85, english: 88, physics: 87, chemistry: 85, biology: 88, history: 75, geography: 70, politics: 52 } },
      { name: '期中考试', total: 740, scores: { chinese: 92, math: 88, english: 90, physics: 90, chemistry: 88, biology: 90, history: 78, geography: 72, politics: 52 } },
      { name: '期末考试', total: 760, scores: { chinese: 95, math: 90, english: 92, physics: 92, chemistry: 90, biology: 92, history: 80, geography: 75, politics: 54 } }
    ],
    behaviorData: { classPerformance: 92, homeworkCompletion: 100, taskCompletion: 98, interactionFrequency: 80, organizeActivities: 4, coordinationAbility: 85, averageScore: 89, activityParticipation: 85, creativeWorks: 4, fairnessObservation: 90, patienceObservation: 90 }
  },
  {
    gender: 'male', roles: ['宣传委员'],
    friends: ['s001', 's003'],
    personality: { type: '外向', traits: ['活跃', '自信', '创新'] },
    exams: [
      { name: '第一次月考', total: 750, scores: { chinese: 88, math: 95, english: 90, physics: 92, chemistry: 90, biology: 92, history: 75, geography: 70, politics: 58 } },
      { name: '期中考试', total: 770, scores: { chinese: 90, math: 98, english: 92, physics: 95, chemistry: 92, biology: 95, history: 78, geography: 72, politics: 58 } },
      { name: '期末考试', total: 790, scores: { chinese: 92, math: 100, english: 95, physics: 98, chemistry: 95, biology: 98, history: 80, geography: 75, politics: 57 } }
    ],
    behaviorData: { classPerformance: 88, homeworkCompletion: 95, taskCompletion: 90, interactionFrequency: 92, organizeActivities: 6, coordinationAbility: 90, averageScore: 82, activityParticipation: 95, creativeWorks: 7, fairnessObservation: 85, patienceObservation: 75 }
  }
];

// ==========================================
// 核心统一数据库：学生全量信息
// ==========================================
export const mockAllStudents = realNames.map((name, index) => {
  const idStr = (index + 1).toString().padStart(3, '0');
  const id = `s${idStr}`;
  
  // 循环使用模板
  const templateIndex = index % templates.length;
  // 深拷贝模板
  const student = JSON.parse(JSON.stringify(templates[templateIndex]));
  
  student.id = id;
  student.name = name;
  
  // 对于超出原始15人的学生，稍微随机化分数，避免完全雷同
  if (index >= 15) {
      if (Math.random() > 0.2) student.roles = [];

      student.exams.forEach(exam => {
          const fluctuate = () => Math.floor(Math.random() * 11 - 5);
          Object.keys(exam.scores).forEach(subject => {
              exam.scores[subject] = Math.min(100, Math.max(0, exam.scores[subject] + fluctuate()));
          });
          exam.total = Object.values(exam.scores).reduce((a, b) => a + b, 0);
      });
  }

  // 添加新的心理测评数据
  // 8维度人格 (0-100)
  const randScore = () => Math.floor(Math.random() * 40 + 60); // 60-100
  // 风险筛查 (0-20, 总分0-80)
  const randRisk = () => Math.floor(Math.random() * 5); // 0-4 per dimension
  
  student.psychologicalData = {
    personality: {
      conscientiousness: randScore(),
      extraversion: randScore(),
      agreeableness: randScore(),
      emotionalStability: randScore(),
      openness: randScore(),
      leadership: randScore(),
      attitude: randScore(),
      complementarity: randScore()
    },
    risk: {
      studyPressure: randRisk() * 4, // Scale to approximate
      anxiety: randRisk() * 4,
      depression: randRisk() * 4,
      socialPressure: randRisk() * 4,
      totalScore: 0 // Will be calc dynamically
    }
  };
  // Calc total risk
  const r = student.psychologicalData.risk;
  r.totalScore = r.studyPressure + r.anxiety + r.depression + r.socialPressure;

  // 随机制造几个高风险样本
  if (Math.random() < 0.1) {
    student.psychologicalData.risk = {
        studyPressure: 15, anxiety: 18, depression: 12, socialPressure: 16, totalScore: 61
    };
  }

  return student;
});


// ==========================================
// 派生数据 (保持向下兼容)
// ==========================================

// 模块1：问卷数据
export const mockQuestionnaireData = mockAllStudents.map(s => ({
  studentId: s.id,
  studentName: s.name,
  friends: s.friends
}));

// 模块2：排座数据 (取最新一次期末考试成绩作为参考)
export const mockStudentsForSeating = mockAllStudents.map(s => ({
  id: s.id,
  name: s.name,
  gender: s.gender,
  roles: s.roles,
  personality: s.personality,
  scores: s.exams[s.exams.length - 1].scores, // 取最新成绩
  socialScore: s.behaviorData.interactionFrequency // 简化映射
}));

// 模块2：互动历史 (保持独立，也可后续合并)
export const mockInteractionHistory = [
  { studentId1: 's001', studentId2: 's003', type: 'positive', conflict: false },
  { studentId1: 's002', studentId2: 's005', type: 'negative', conflict: true },
  { studentId1: 's007', studentId2: 's011', type: 'positive', conflict: false }
];

// 模块3：班委数据
export const mockStudentsForLeader = mockAllStudents.map(s => ({
  id: s.id,
  name: s.name,
  behaviorData: s.behaviorData,
  psychologicalData: s.psychologicalData.personality // 使用新人格数据
}));

// 模块1：心理测评数据 (更新为新结构)
export const mockPsychologyData = mockAllStudents.map(s => ({
  studentId: s.id,
  studentName: s.name,
  psychologicalData: s.psychologicalData
}));

// Mock测试数据
export const mockTestData = {
  module1: { title: '班级生态评估', data: 'Mock Data Ready' },
  module2: { title: '智能排座引擎', data: 'Mock Data Ready' },
  module3: { title: '班委胜任力模型', data: 'Mock Data Ready' }
};
