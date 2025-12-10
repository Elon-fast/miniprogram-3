/**
 * 心理评估模块
 * 功能：基于“人格性格测试”与“情绪风险筛查”进行评估
 */

/**
 * 人格性格测试维度定义 (共8个)
 */
export const PERSONALITY_DIMENSIONS = {
  conscientiousness: { name: '责任心', max: 100, min: 0 },
  extraversion: { name: '外向性', max: 100, min: 0 },
  agreeableness: { name: '宜人性', max: 100, min: 0 },
  emotionalStability: { name: '情绪稳定性', max: 100, min: 0 },
  openness: { name: '开放性', max: 100, min: 0 },
  leadership: { name: '领导力潜质', max: 100, min: 0 },
  learningAttitude: { name: '学习态度', max: 100, min: 0 },
  complementarity: { name: '性格互补', max: 100, min: 0 } // 改名 seatCompatibility -> complementarity
};

/**
 * 风险筛查维度定义 (共4个)
 * 满分：每题4分 x 5题 = 20分
 */
export const RISK_DIMENSIONS = {
  studyPressure: { name: '学习压力', threshold: 10 }, // 单项满分20，设定10为关注线
  anxiety: { name: '焦虑倾向', threshold: 10 },
  depression: { name: '情绪低落', threshold: 10 },
  socialPressure: { name: '社交压力', threshold: 10 }
};

/**
 * 评估单个学生的心理状态
 * @param {Object} rawData 原始测评数据 (psychologicalData)
 * @returns {Object} 评估结果
 */
export function assessStudentPsychology(rawData) {
  // 1. 人格性格维度处理
  // rawData.personality 应包含 8 个维度的分数
  const personalityScores = rawData.personality || {};
  
  // 2. 风险筛查处理
  // rawData.risk 应包含 4 个维度 + totalScore
  const riskScores = rawData.risk || { studyPressure: 0, anxiety: 0, depression: 0, socialPressure: 0, totalScore: 0 };
  const totalRiskScore = riskScores.totalScore || 0;
  
  // 判定风险等级
  let riskLevel = '低风险';
  let riskLabel = '正常';
  let suggestion = '';
  
  if (totalRiskScore <= 20) {
    riskLevel = '低风险';
    riskLabel = '正常';
    suggestion = '学生目前整体情绪与压力状态良好。建议保持现有学习习惯，适当参与运动与社交活动。老师可继续给予正向反馈，维持良好关系。';
  } else if (totalRiskScore <= 40) {
    riskLevel = '轻度风险';
    riskLabel = '需关注';
    suggestion = '学生近期可能感受到学习或社交压力，建议老师多给予关心，适当减少负性评价，鼓励学生表达感受。若情况持续，可建议学生参与学校心理课程或与心理老师进行简短沟通。';
  } else if (totalRiskScore <= 60) {
    riskLevel = '中度风险';
    riskLabel = '需干预';
    suggestion = '学生可能存在较明显的压力或焦虑表现，如长期紧张、睡眠不佳、兴趣下降等。建议班主任与心理老师共同关注，适当安排个别谈话，了解学生压力来源。家长也应被温和告知学生的基本状况。';
  } else {
    riskLevel = '高度风险';
    riskLabel = '高危';
    suggestion = '系统检测到学生存在明显情绪困扰。强烈建议心理老师立即进行专业面谈。必要时联系家长共同协助学生。注意避免贴标签，强调支持与安全性。';
  }

  // 3. 识别主要风险维度
  const highRiskDimensions = Object.keys(RISK_DIMENSIONS)
    .filter(key => (riskScores[key] || 0) >= RISK_DIMENSIONS[key].threshold)
    .map(key => ({
      key,
      name: RISK_DIMENSIONS[key].name,
      score: riskScores[key]
    }));

  return {
    personalityScores,
    riskScores,
    totalRiskScore,
    riskLevel,
    riskLabel,
    suggestion,
    highRiskDimensions
  };
}

/**
 * 评估班级整体心理状态
 * @param {Array} studentsPsychologyData 所有学生的心理数据 [{studentId, studentName, psychologicalData}]
 * @returns {Object} 班级整体评估结果
 */
export function assessClassPsychology(studentsPsychologyData) {
  // 1. 统计风险等级分布
  const riskDistribution = {
    low: 0,
    mild: 0,
    moderate: 0,
    high: 0
  };
  
  // 2. 计算人格维度班级平均分
  const personalityAverages = {};
  Object.keys(PERSONALITY_DIMENSIONS).forEach(key => personalityAverages[key] = 0);
  
  const studentCount = studentsPsychologyData.length;
  
  studentsPsychologyData.forEach(student => {
    // 注意：这里 student.psychologicalData 是我们在 api.js 里封装的
    const assessment = assessStudentPsychology(student.psychologicalData || {});
    
    // 统计风险
    if (assessment.totalRiskScore <= 20) riskDistribution.low++;
    else if (assessment.totalRiskScore <= 40) riskDistribution.mild++;
    else if (assessment.totalRiskScore <= 60) riskDistribution.moderate++;
    else riskDistribution.high++;
    
    // 累加人格分
    Object.keys(PERSONALITY_DIMENSIONS).forEach(key => {
      personalityAverages[key] += (assessment.personalityScores[key] || 0);
    });
  });
  
  // 计算平均
  if (studentCount > 0) {
    Object.keys(personalityAverages).forEach(key => {
      personalityAverages[key] = Number((personalityAverages[key] / studentCount).toFixed(1));
    });
  }
  
  return {
    riskDistribution,
    personalityAverages,
    totalStudents: studentCount,
    highRiskCount: riskDistribution.high + riskDistribution.moderate,
    dimensionAverages: personalityAverages, // 兼容旧命名
    concernDimensions: [] // 暂不计算关注维度
  };
}

/**
 * 使用DFS查找连通分量（小团体）
 * @param {Array} nodes 节点列表
 * @param {Array} edges 边列表
 * @returns {Array} 小团体列表，每个小团体包含节点ID数组
 */
export function findConnectedComponents(nodes, edges) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const adjacencyList = new Map();
  
  // 初始化邻接表
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
  });
  
  // 构建邻接表
  edges.forEach(edge => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
    
    if (adjacencyList.has(sourceId) && adjacencyList.has(targetId)) {
      adjacencyList.get(sourceId).push(targetId);
      adjacencyList.get(targetId).push(sourceId);
    }
  });
  
  const visited = new Set();
  const components = [];
  
  // DFS遍历
  function dfs(nodeId, component) {
    visited.add(nodeId);
    component.push(nodeId);
    
    const neighbors = adjacencyList.get(nodeId) || [];
    neighbors.forEach(neighborId => {
      if (!visited.has(neighborId)) {
        dfs(neighborId, component);
      }
    });
  }
  
  // 遍历所有节点
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const component = [];
      dfs(node.id, component);
      if (component.length > 0) {
        components.push(component);
      }
    }
  });
  
  return components;
}

/**
 * 评估小团体的心理状态
 * @param {Array} componentNodeIds 小团体的节点ID列表
 * @param {Array} studentsPsychologyData 所有学生的心理数据
 * @returns {Object} 小团体评估结果
 */
export function assessGroupPsychology(componentNodeIds, studentsPsychologyData) {
  // 获取小团体中学生的心理数据
  const groupStudents = studentsPsychologyData.filter(student => 
    componentNodeIds.includes(student.studentId)
  );
  
  // 过滤规则：剔除人数少于2人或多于4人的团体 (误判/非典型小团体)
  if (groupStudents.length < 2 || groupStudents.length > 4) {
    return null;
  }
  
  // 计算小团体的平均风险分
  let totalGroupRisk = 0;
  
  const studentAssessments = groupStudents.map(student => {
    const assessment = assessStudentPsychology(student.psychologicalData || {});
    totalGroupRisk += assessment.totalRiskScore;
    return {
      studentId: student.studentId,
      studentName: student.studentName,
      assessment
    };
  });
  
  const avgRisk = totalGroupRisk / groupStudents.length;
  
  // 判断小团体整体状态
  let groupStatus = '正常';
  let needsAttention = false;
  
  // 小团体如果有2人以上高风险，或者平均分高，则预警
  const highRiskCount = studentAssessments.filter(s => s.assessment.totalRiskScore > 40).length;
  
  if (avgRisk > 40 || highRiskCount >= 2) {
    groupStatus = '高风险群体';
    needsAttention = true;
  } else if (avgRisk > 20) {
    groupStatus = '轻度风险';
  }
  
  return {
    nodeIds: componentNodeIds,
    studentCount: groupStudents.length,
    studentNames: groupStudents.map(s => s.studentName),
    avgRisk,
    groupStatus,
    needsAttention,
    concernLevel: avgRisk,
    problemDimensions: [] // 暂不详细分析小团体具体维度
  };
}

/**
 * 分析所有小团体的心理状态
 * @param {Array} components 小团体列表（节点ID数组的数组）
 * @param {Array} studentsPsychologyData 所有学生的心理数据
 * @returns {Array} 小团体评估结果列表
 */
export function analyzeAllGroups(components, studentsPsychologyData) {
  return components
    .map(component => assessGroupPsychology(component, studentsPsychologyData))
    .filter(result => result !== null)
    .sort((a, b) => b.concernLevel - a.concernLevel); // 按关注度排序
}
