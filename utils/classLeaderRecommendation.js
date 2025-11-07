/**
 * 班委胜任力模型 - 决策推荐模块
 * 功能：基于学生行为数据和心理测评结果，推荐最适合的班委岗位
 */

/**
 * 班委岗位定义及其所需核心能力
 */
export const LEADER_POSITIONS = {
  '班长': {
    name: '班长',
    requiredAbilities: {
      leadership: 0.9,      // 领导力
      responsibility: 0.9,  // 责任心
      communication: 0.8,   // 沟通能力
      organization: 0.8     // 组织能力
    },
    description: '负责班级整体管理和协调'
  },
  '学习委员': {
    name: '学习委员',
    requiredAbilities: {
      academic: 0.9,        // 学业成绩
      responsibility: 0.8,  // 责任心
      patience: 0.7,        // 耐心
      communication: 0.7    // 沟通能力
    },
    description: '负责学习相关事务，帮助同学提高成绩'
  },
  '心理委员': {
    name: '心理委员',
    requiredAbilities: {
      empathy: 0.9,         // 同理心
      communication: 0.8,   // 沟通能力
      patience: 0.8,        // 耐心
      observation: 0.7      // 观察力
    },
    description: '关注同学心理健康，提供情感支持'
  },
  '纪律委员': {
    name: '纪律委员',
    requiredAbilities: {
      responsibility: 0.9,  // 责任心
      fairness: 0.8,        // 公正性
      courage: 0.7,         // 勇气
      communication: 0.7    // 沟通能力
    },
    description: '维护班级纪律，营造良好学习环境'
  },
  '文体委员': {
    name: '文体委员',
    requiredAbilities: {
      creativity: 0.8,      // 创造力
      organization: 0.7,    // 组织能力
      enthusiasm: 0.8,      // 热情
      communication: 0.7    // 沟通能力
    },
    description: '组织文体活动，丰富班级生活'
  }
};

/**
 * 评估学生能力（基于行为数据和心理测评）
 * @param {Object} student 学生对象 {id, name, behaviorData, psychologicalData}
 * @returns {Object} 能力评估结果
 */
export function evaluateStudentAbilities(student) {
  const behaviorData = student.behaviorData || {};
  const psychologicalData = student.psychologicalData || {};
  
  // 从行为数据中提取能力指标
  const abilities = {
    // 领导力：基于课堂表现、组织活动次数等
    leadership: Math.min(1, (behaviorData.classPerformance || 0) / 100 * 0.6 + 
                            (behaviorData.organizeActivities || 0) / 10 * 0.4),
    
    // 责任心：基于作业完成率、任务完成情况等
    responsibility: Math.min(1, (behaviorData.homeworkCompletion || 0) / 100 * 0.7 +
                                (behaviorData.taskCompletion || 0) / 100 * 0.3),
    
    // 沟通能力：基于互动频率、表达能力等
    communication: Math.min(1, (behaviorData.interactionFrequency || 0) / 100 * 0.5 +
                               (psychologicalData.expressiveness || 0) / 100 * 0.5),
    
    // 组织能力：基于活动组织次数、协调能力等
    organization: Math.min(1, (behaviorData.organizeActivities || 0) / 10 * 0.6 +
                              (behaviorData.coordinationAbility || 0) / 100 * 0.4),
    
    // 学业成绩：基于各科平均分
    academic: Math.min(1, (behaviorData.averageScore || 0) / 100),
    
    // 同理心：基于心理测评
    empathy: Math.min(1, (psychologicalData.empathy || 0) / 100),
    
    // 耐心：基于心理测评和行为观察
    patience: Math.min(1, (psychologicalData.patience || 0) / 100 * 0.7 +
                          (behaviorData.patienceObservation || 0) / 100 * 0.3),
    
    // 观察力：基于心理测评
    observation: Math.min(1, (psychologicalData.observation || 0) / 100),
    
    // 公正性：基于行为观察
    fairness: Math.min(1, (behaviorData.fairnessObservation || 0) / 100),
    
    // 勇气：基于心理测评
    courage: Math.min(1, (psychologicalData.courage || 0) / 100),
    
    // 创造力：基于活动参与和作品
    creativity: Math.min(1, (behaviorData.creativeWorks || 0) / 10 * 0.6 +
                            (psychologicalData.creativity || 0) / 100 * 0.4),
    
    // 热情：基于活动参与度
    enthusiasm: Math.min(1, (behaviorData.activityParticipation || 0) / 100)
  };
  
  return abilities;
}

/**
 * 计算学生对某个岗位的适配度
 * @param {Object} studentAbilities 学生能力评估结果
 * @param {Object} position 岗位定义
 * @returns {Number} 适配度分数 (0-1)
 */
export function calculatePositionFitness(studentAbilities, position) {
  const requiredAbilities = position.requiredAbilities;
  const abilityKeys = Object.keys(requiredAbilities);
  
  if (abilityKeys.length === 0) return 0;
  
  // 计算加权适配度
  let totalWeight = 0;
  let totalScore = 0;
  
  abilityKeys.forEach(ability => {
    const required = requiredAbilities[ability];
    const student = studentAbilities[ability] || 0;
    
    // 适配度 = 学生能力 / 要求能力（如果学生能力超过要求，按1计算）
    const fitness = Math.min(1, student / required);
    const weight = required; // 使用要求的重要性作为权重
    
    totalScore += fitness * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * 为所有学生推荐班委岗位
 * @param {Array} students 学生列表
 * @returns {Array} 推荐结果，每个学生包含各岗位的适配度
 */
export function recommendClassLeaders(students) {
  const recommendations = students.map(student => {
    // 评估学生能力
    const abilities = evaluateStudentAbilities(student);
    
    // 计算每个岗位的适配度
    const positionFitness = {};
    Object.keys(LEADER_POSITIONS).forEach(positionName => {
      const position = LEADER_POSITIONS[positionName];
      const fitness = calculatePositionFitness(abilities, position);
      positionFitness[positionName] = {
        fitness: fitness,
        percentage: Math.round(fitness * 100),
        position: position
      };
    });
    
    // 按适配度排序
    const sortedPositions = Object.keys(positionFitness)
      .map(name => ({
        name,
        ...positionFitness[name]
      }))
      .sort((a, b) => b.fitness - a.fitness);
    
    // 推荐最佳岗位（适配度>0.6）
    const recommendedPosition = sortedPositions[0].fitness >= 0.6 
      ? sortedPositions[0] 
      : null;
    
    return {
      student: {
        id: student.id,
        name: student.name
      },
      abilities: abilities,
      positionFitness: positionFitness,
      sortedPositions: sortedPositions,
      recommendedPosition: recommendedPosition,
      bestMatch: sortedPositions[0] // 最佳匹配（即使适配度不够也显示）
    };
  });
  
  return recommendations;
}

/**
 * 为每个岗位推荐最佳候选人
 * @param {Array} recommendations 所有学生的推荐结果
 * @returns {Object} 每个岗位的最佳候选人列表
 */
export function getBestCandidatesForEachPosition(recommendations) {
  const positionCandidates = {};
  
  Object.keys(LEADER_POSITIONS).forEach(positionName => {
    // 获取所有学生对该岗位的适配度
    const candidates = recommendations
      .map(rec => ({
        student: rec.student,
        fitness: rec.positionFitness[positionName].fitness,
        percentage: rec.positionFitness[positionName].percentage
      }))
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, 3); // 取前3名
    
    positionCandidates[positionName] = {
      position: LEADER_POSITIONS[positionName],
      candidates: candidates
    };
  });
  
  return positionCandidates;
}

