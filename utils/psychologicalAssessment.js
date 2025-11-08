/**
 * 心理评估模块 - 基于SCL-90量表
 * 功能：评估班级整体心理状态和小团体的心理状况
 */

/**
 * SCL-90量表维度定义
 */
export const SCL90_DIMENSIONS = {
  somatization: { name: '躯体化', threshold: 1.5 },
  obsessive: { name: '强迫症状', threshold: 1.5 },
  interpersonal: { name: '人际关系敏感', threshold: 1.5 },
  depression: { name: '抑郁', threshold: 1.5 },
  anxiety: { name: '焦虑', threshold: 1.5 },
  hostility: { name: '敌对', threshold: 1.5 },
  phobic: { name: '恐怖', threshold: 1.5 },
  paranoid: { name: '偏执', threshold: 1.5 },
  psychotic: { name: '精神病性', threshold: 1.5 }
};

/**
 * 评估单个学生的心理状态
 * @param {Object} scl90Data SCL-90量表数据
 * @returns {Object} 评估结果
 */
export function assessStudentPsychology(scl90Data) {
  const scores = {};
  const status = {};
  
  // 计算各维度得分
  Object.keys(SCL90_DIMENSIONS).forEach(dimension => {
    const dimensionData = scl90Data[dimension] || {};
    const items = dimensionData.items || [];
    
    if (items.length > 0) {
      // 计算平均分（SCL-90每题1-5分）
      const avgScore = items.reduce((sum, score) => sum + score, 0) / items.length;
      scores[dimension] = avgScore;
      
      // 判断状态（1.5分为临界值）
      const threshold = SCL90_DIMENSIONS[dimension].threshold;
      if (avgScore >= threshold) {
        status[dimension] = '异常';
      } else if (avgScore >= threshold * 0.8) {
        status[dimension] = '关注';
      } else {
        status[dimension] = '正常';
      }
    } else {
      scores[dimension] = 0;
      status[dimension] = '正常';
    }
  });
  
  // 计算总分和总均分
  const totalScore = Object.values(scl90Data).reduce((sum, dim) => {
    const items = dim.items || [];
    return sum + items.reduce((s, score) => s + score, 0);
  }, 0);
  const totalAverage = totalScore / 90; // SCL-90共90题
  
  // 判断整体状态
  let overallStatus = '正常';
  if (totalAverage >= 2.0) {
    overallStatus = '严重';
  } else if (totalAverage >= 1.5) {
    overallStatus = '异常';
  } else if (totalAverage >= 1.2) {
    overallStatus = '关注';
  }
  
  // 识别主要问题维度
  const problemDimensions = Object.keys(scores)
    .filter(dim => scores[dim] >= SCL90_DIMENSIONS[dim].threshold)
    .map(dim => ({
      dimension: dim,
      name: SCL90_DIMENSIONS[dim].name,
      score: scores[dim]
    }))
    .sort((a, b) => b.score - a.score);
  
  return {
    scores,
    status,
    totalScore,
    totalAverage,
    overallStatus,
    problemDimensions
  };
}

/**
 * 评估班级整体心理状态
 * @param {Array} studentsPsychologyData 所有学生的心理数据
 * @returns {Object} 班级整体评估结果
 */
export function assessClassPsychology(studentsPsychologyData) {
  const dimensionAverages = {};
  const dimensionCounts = {};
  
  // 初始化
  Object.keys(SCL90_DIMENSIONS).forEach(dim => {
    dimensionAverages[dim] = 0;
    dimensionCounts[dim] = 0;
  });
  
  // 汇总所有学生的数据
  studentsPsychologyData.forEach(student => {
    const assessment = assessStudentPsychology(student.scl90Data || {});
    Object.keys(SCL90_DIMENSIONS).forEach(dim => {
      if (assessment.scores[dim] > 0) {
        dimensionAverages[dim] += assessment.scores[dim];
        dimensionCounts[dim]++;
      }
    });
  });
  
  // 计算平均值
  Object.keys(SCL90_DIMENSIONS).forEach(dim => {
    if (dimensionCounts[dim] > 0) {
      dimensionAverages[dim] = dimensionAverages[dim] / dimensionCounts[dim];
    }
  });
  
  // 判断班级整体氛围
  let classAtmosphere = '正常';
  const atmosphereScore = {
    normal: 0,
    anxiety: dimensionAverages.anxiety || 0,
    depression: dimensionAverages.depression || 0,
    positive: 0
  };
  
  // 计算积极指标（低分表示积极）
  const positiveIndicators = ['anxiety', 'depression', 'hostility', 'interpersonal'];
  const positiveScore = positiveIndicators.reduce((sum, dim) => {
    return sum + (dimensionAverages[dim] || 0);
  }, 0) / positiveIndicators.length;
  
  atmosphereScore.positive = Math.max(0, 2 - positiveScore); // 转换为积极分数
  
  // 判断主要氛围
  if (atmosphereScore.anxiety >= 1.5) {
    classAtmosphere = '焦虑倾向';
  } else if (atmosphereScore.depression >= 1.5) {
    classAtmosphere = '抑郁倾向';
  } else if (positiveScore < 1.0) {
    classAtmosphere = '阳光积极';
  } else {
    classAtmosphere = '正常';
  }
  
  // 识别需要关注的维度
  const concernDimensions = Object.keys(dimensionAverages)
    .filter(dim => dimensionAverages[dim] >= SCL90_DIMENSIONS[dim].threshold)
    .map(dim => ({
      dimension: dim,
      name: SCL90_DIMENSIONS[dim].name,
      score: dimensionAverages[dim],
      threshold: SCL90_DIMENSIONS[dim].threshold
    }))
    .sort((a, b) => b.score - a.score);
  
  return {
    dimensionAverages,
    classAtmosphere,
    atmosphereScore,
    concernDimensions,
    totalStudents: studentsPsychologyData.length
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
  
  if (groupStudents.length === 0) {
    return null;
  }
  
  // 评估每个学生的心理状态
  const studentAssessments = groupStudents.map(student => ({
    studentId: student.studentId,
    studentName: student.studentName,
    assessment: assessStudentPsychology(student.scl90Data || {})
  }));
  
  // 计算小团体平均分
  const groupDimensionAverages = {};
  Object.keys(SCL90_DIMENSIONS).forEach(dim => {
    const scores = studentAssessments
      .map(s => s.assessment.scores[dim] || 0)
      .filter(score => score > 0);
    if (scores.length > 0) {
      groupDimensionAverages[dim] = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    } else {
      groupDimensionAverages[dim] = 0;
    }
  });
  
  // 识别问题维度
  const problemDimensions = Object.keys(groupDimensionAverages)
    .filter(dim => groupDimensionAverages[dim] >= SCL90_DIMENSIONS[dim].threshold)
    .map(dim => ({
      dimension: dim,
      name: SCL90_DIMENSIONS[dim].name,
      score: groupDimensionAverages[dim],
      threshold: SCL90_DIMENSIONS[dim].threshold
    }))
    .sort((a, b) => b.score - a.score);
  
  // 判断小团体整体状态
  let groupStatus = '正常';
  const avgAnxiety = groupDimensionAverages.anxiety || 0;
  const avgDepression = groupDimensionAverages.depression || 0;
  const avgInterpersonal = groupDimensionAverages.interpersonal || 0;
  
  if (avgAnxiety >= 1.5) {
    groupStatus = '焦虑偏高';
  } else if (avgDepression >= 1.5) {
    groupStatus = '抑郁倾向';
  } else if (avgInterpersonal >= 1.5) {
    groupStatus = '人际关系敏感';
  } else if (problemDimensions.length > 0) {
    groupStatus = '需要关注';
  }
  
  // 计算关注度（问题维度数量和严重程度）
  const concernLevel = problemDimensions.length > 0 ? 
    Math.min(100, problemDimensions.length * 20 + problemDimensions[0].score * 20) : 0;
  
  return {
    nodeIds: componentNodeIds,
    studentCount: groupStudents.length,
    studentNames: groupStudents.map(s => s.studentName),
    studentAssessments,
    dimensionAverages: groupDimensionAverages,
    problemDimensions,
    groupStatus,
    concernLevel,
    needsAttention: problemDimensions.length > 0 || concernLevel > 30
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

