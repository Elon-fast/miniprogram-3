/**
 * 班干部推荐算法模块
 */

// 定义班干部岗位及其所需的核心能力权重 (不同岗位权重差异化)
// 核心维度：leadership(领导力), responsibility(责任心), communication(外向性), agreeableness(宜人性)
export const LEADER_POSITIONS = {
  monitor: {
    name: '班长',
    description: '协助班主任管理班级日常事务',
    requiredAbilities: { leadership: 40, responsibility: 40, communication: 10, agreeableness: 10 } 
  },
  study: {
    name: '学习委员',
    description: '负责收发作业，营造学习氛围',
    requiredAbilities: { leadership: 20, responsibility: 50, communication: 10, agreeableness: 20 }
  },
  discipline: {
    name: '纪律委员',
    description: '维护课堂和自习纪律',
    requiredAbilities: { leadership: 30, responsibility: 50, communication: 10, agreeableness: 10 }
  },
  sports: {
    name: '体育委员',
    description: '组织体育活动和两操',
    requiredAbilities: { leadership: 30, responsibility: 20, communication: 40, agreeableness: 10 }
  },
  arts: {
    name: '文艺委员',
    description: '组织班级文艺活动',
    requiredAbilities: { leadership: 20, responsibility: 20, communication: 40, agreeableness: 20 }
  },
  life: {
    name: '生活委员',
    description: '管理班费和班级卫生',
    requiredAbilities: { leadership: 10, responsibility: 50, communication: 10, agreeableness: 30 }
  },
  psychology: {
    name: '心理委员',
    description: '关注同学心理健康，协助沟通',
    requiredAbilities: { leadership: 10, responsibility: 30, communication: 20, agreeableness: 40 }
  }
};

/**
 * 提取学生的能力维度分数 (基于心理测评数据)
 * @param {Object} student 学生对象
 * @returns {Object} 包含各维度分数的对象 (0-100)
 */
function extractStudentDimensions(student) {
  const personality = (student.psychologicalData && student.psychologicalData.personality) || {};
  
  return {
    conscientiousness: personality.conscientiousness || 50, // 责任心
    leadership: personality.leadership || 50,             // 领导力潜质
    extraversion: personality.extraversion || 50,         // 外向性
    agreeableness: personality.agreeableness || 50,       // 宜人性/合作性
  };
}

/**
 * 计算“干部适合度” (Cadre Suitability)
 * 支持自定义权重
 * 
 * @param {Object} student 学生对象
 * @param {Object} weights 权重对象 { leadership: 35, responsibility: 35, communication: 15, agreeableness: 15 }
 * @returns {Number} 适合度分数 (0-100)
 */
export function calculateCadreSuitability(student, weights) {
  const dims = extractStudentDimensions(student);
  
  // 如果没有传入权重，使用默认均等权重
  const w = weights || { leadership: 25, responsibility: 25, communication: 25, agreeableness: 25 };
  
  // 计算总权重以归一化
  const totalWeight = (w.leadership || 0) + (w.responsibility || 0) + (w.communication || 0) + (w.agreeableness || 0);
  
  if (totalWeight === 0) return 0;

  const score = 
    (dims.conscientiousness * (w.responsibility || 0) +
     dims.leadership * (w.leadership || 0) +
     dims.extraversion * (w.communication || 0) +
     dims.agreeableness * (w.agreeableness || 0)) / totalWeight;
    
  return Math.min(100, Math.max(0, score));
}

// 导出旧接口以保持兼容性
export function evaluateStudentAbilities(student) {
  const dims = extractStudentDimensions(student);
  return {
    leadership: dims.leadership,
    responsibility: dims.conscientiousness,
    communication: dims.extraversion, 
    empathy: dims.agreeableness,
    academic: 80, 
    organization: dims.leadership
  };
}
