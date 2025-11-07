/**
 * 班级生态评估 - 社交网络分析模块
 * 功能：分析班级学生的社交网络，识别关键节点（意见领袖、孤立学生等）
 */

/**
 * 将问卷结果转换为邻接矩阵
 * @param {Array} questionnaireData 问卷数据，格式：[{studentId, studentName, friends: [studentId1, studentId2, ...]}]
 * @returns {Object} {adjacencyMatrix, studentList} 邻接矩阵和学生列表
 */
export function buildAdjacencyMatrix(questionnaireData) {
  // 获取所有学生ID列表
  const studentList = questionnaireData.map(item => ({
    id: item.studentId,
    name: item.studentName
  }));
  const studentIds = studentList.map(s => s.id);
  const n = studentIds.length;
  
  // 初始化邻接矩阵（无向图）
  const adjacencyMatrix = Array(n).fill(0).map(() => Array(n).fill(0));
  
  // 构建邻接矩阵
  questionnaireData.forEach((item, index) => {
    const studentIndex = studentIds.indexOf(item.studentId);
    if (item.friends && Array.isArray(item.friends)) {
      item.friends.forEach(friendId => {
        const friendIndex = studentIds.indexOf(friendId);
        if (friendIndex !== -1) {
          // 无向图，双向连接
          adjacencyMatrix[studentIndex][friendIndex] = 1;
          adjacencyMatrix[friendIndex][studentIndex] = 1;
        }
      });
    }
  });
  
  return {
    adjacencyMatrix,
    studentList
  };
}

/**
 * 计算度中心性（Degree Centrality）
 * 度中心性 = 节点的连接数 / (总节点数 - 1)
 * @param {Array} adjacencyMatrix 邻接矩阵
 * @returns {Array} 每个节点的度中心性值
 */
export function calculateDegreeCentrality(adjacencyMatrix) {
  const n = adjacencyMatrix.length;
  const degreeCentrality = [];
  
  for (let i = 0; i < n; i++) {
    // 计算节点i的连接数（度）
    const degree = adjacencyMatrix[i].reduce((sum, val) => sum + val, 0);
    // 度中心性 = 度 / (n - 1)
    const centrality = n > 1 ? degree / (n - 1) : 0;
    degreeCentrality.push({
      index: i,
      degree: degree,
      centrality: centrality
    });
  }
  
  return degreeCentrality;
}

/**
 * 计算中介中心性（Betweenness Centrality）- 简化版本
 * 中介中心性衡量一个节点作为"桥梁"的重要性
 * 由于完整算法较复杂，这里使用简化版本（基于最短路径数量）
 * @param {Array} adjacencyMatrix 邻接矩阵
 * @returns {Array} 每个节点的中介中心性值
 */
export function calculateBetweennessCentrality(adjacencyMatrix) {
  const n = adjacencyMatrix.length;
  const betweenness = Array(n).fill(0);
  
  // 简化算法：使用BFS计算每个节点作为中间节点的次数
  // 对于每对节点，计算最短路径，统计经过每个节点的路径数
  for (let source = 0; source < n; source++) {
    for (let target = source + 1; target < n; target++) {
      // 使用BFS找最短路径
      const paths = findAllShortestPaths(adjacencyMatrix, source, target);
      
      // 统计每个节点在路径中出现的次数
      paths.forEach(path => {
        // 排除起点和终点
        for (let i = 1; i < path.length - 1; i++) {
          betweenness[path[i]] += 1 / paths.length;
        }
      });
    }
  }
  
  // 归一化（可选）
  const maxBetweenness = Math.max(...betweenness);
  const normalizedBetweenness = betweenness.map(val => ({
    index: 0,
    centrality: maxBetweenness > 0 ? val / maxBetweenness : 0
  }));
  
  return betweenness.map((val, index) => ({
    index: index,
    centrality: val
  }));
}

/**
 * 使用BFS查找所有最短路径（简化版本）
 * @param {Array} adjacencyMatrix 邻接矩阵
 * @param {Number} source 起点索引
 * @param {Number} target 终点索引
 * @returns {Array} 所有最短路径
 */
function findAllShortestPaths(adjacencyMatrix, source, target) {
  if (source === target) return [[source]];
  
  const paths = [];
  const queue = [[source]];
  const visited = new Set([source]);
  let foundLength = null;
  
  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];
    
    // 如果已经找到最短路径，只处理相同长度的路径
    if (foundLength !== null && path.length > foundLength) {
      break;
    }
    
    // 检查是否到达目标
    if (current === target) {
      foundLength = path.length;
      paths.push([...path]);
      continue;
    }
    
    // 遍历邻居
    for (let i = 0; i < adjacencyMatrix[current].length; i++) {
      if (adjacencyMatrix[current][i] === 1 && !path.includes(i)) {
        const newPath = [...path, i];
        if (foundLength === null || newPath.length <= foundLength) {
          queue.push(newPath);
        }
      }
    }
  }
  
  return paths.length > 0 ? paths : [[source, target]]; // 如果没有路径，返回直接连接
}

/**
 * 识别关键节点
 * @param {Array} degreeCentrality 度中心性数组
 * @param {Array} betweennessCentrality 中介中心性数组
 * @param {Number} threshold 阈值（0-1），默认0.6
 * @returns {Object} {leaders, isolated} 意见领袖和孤立学生
 */
export function identifyKeyNodes(degreeCentrality, betweennessCentrality, threshold = 0.6) {
  const leaders = [];
  const isolated = [];
  
  degreeCentrality.forEach((deg, index) => {
    const bet = betweennessCentrality[index];
    const avgScore = (deg.centrality + bet.centrality) / 2;
    
    // 意见领袖：度中心性和中介中心性都较高
    if (deg.centrality >= threshold && bet.centrality >= threshold * 0.5) {
      leaders.push({
        index: index,
        degreeCentrality: deg.centrality,
        betweennessCentrality: bet.centrality,
        score: avgScore
      });
    }
    
    // 孤立学生：度中心性很低
    if (deg.centrality < 0.2) {
      isolated.push({
        index: index,
        degreeCentrality: deg.centrality,
        betweennessCentrality: bet.centrality,
        score: avgScore
      });
    }
  });
  
  // 按分数排序
  leaders.sort((a, b) => b.score - a.score);
  isolated.sort((a, b) => a.score - b.score);
  
  return { leaders, isolated };
}

/**
 * 分析班级生态（主函数）
 * @param {Array} questionnaireData 问卷数据
 * @returns {Object} 分析结果
 */
export function analyzeClassEcology(questionnaireData) {
  // 1. 构建邻接矩阵
  const { adjacencyMatrix, studentList } = buildAdjacencyMatrix(questionnaireData);
  
  // 2. 计算度中心性
  const degreeCentrality = calculateDegreeCentrality(adjacencyMatrix);
  
  // 3. 计算中介中心性（简化版本）
  const betweennessCentrality = calculateBetweennessCentrality(adjacencyMatrix);
  
  // 4. 识别关键节点
  const { leaders, isolated } = identifyKeyNodes(degreeCentrality, betweennessCentrality);
  
  // 5. 构建结果
  const result = {
    studentList: studentList.map((student, index) => ({
      ...student,
      degreeCentrality: degreeCentrality[index].centrality,
      betweennessCentrality: betweennessCentrality[index].centrality,
      degree: degreeCentrality[index].degree
    })),
    leaders: leaders.map(leader => ({
      ...studentList[leader.index],
      ...leader
    })),
    isolated: isolated.map(iso => ({
      ...studentList[iso.index],
      ...iso
    })),
    networkStats: {
      totalStudents: studentList.length,
      totalConnections: adjacencyMatrix.reduce((sum, row) => 
        sum + row.reduce((rowSum, val) => rowSum + val, 0), 0
      ) / 2, // 无向图，除以2
      averageDegree: degreeCentrality.reduce((sum, d) => sum + d.degree, 0) / studentList.length,
      leadersCount: leaders.length,
      isolatedCount: isolated.length
    }
  };
  
  return result;
}

