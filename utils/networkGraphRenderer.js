/**
 * 网络关系图渲染器 - 基于Canvas
 * 支持拖动、缩放、节点高亮等功能
 */

/**
 * 计算力导向布局的节点位置（简化版）
 * @param {Array} nodes 节点列表
 * @param {Array} edges 边列表
 * @param {Number} width 画布宽度
 * @param {Number} height 画布高度
 * @param {Number} iterations 迭代次数
 */
export function calculateForceLayout(nodes, edges, width, height, iterations = 50) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;
  
  // 初始化节点位置（圆形布局）
  nodes.forEach((node, index) => {
    if (!node.x && !node.y) {
      const angle = (2 * Math.PI * index) / nodes.length;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    }
    // 初始化速度
    node.vx = 0;
    node.vy = 0;
  });
  
  // 力导向算法迭代
  for (let iter = 0; iter < iterations; iter++) {
    // 斥力：所有节点之间相互排斥
    for (let i = 0; i < nodes.length; i++) {
      let fx = 0, fy = 0;
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 1000 / (dist * dist); // 斥力与距离平方成反比
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      }
      nodes[i].vx = (nodes[i].vx + fx) * 0.9; // 阻尼
      nodes[i].vy = (nodes[i].vy + fy) * 0.9;
    }
    
    // 引力：连接的节点相互吸引
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return;
      
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 80) * 0.1; // 理想距离80
      
      source.vx += (dx / dist) * force;
      source.vy += (dy / dist) * force;
      target.vx -= (dx / dist) * force;
      target.vy -= (dy / dist) * force;
    });
    
    // 更新位置
    nodes.forEach(node => {
      node.x += node.vx * 0.1;
      node.y += node.vy * 0.1;
      
      // 边界约束
      node.x = Math.max(30, Math.min(width - 30, node.x));
      node.y = Math.max(30, Math.min(height - 30, node.y));
    });
  }
  
  return nodes;
}

/**
 * 将分析结果转换为关系图数据
 * @param {Object} analysisResult 分析结果
 * @returns {Object} {nodes, edges} 节点和边数据
 */
export function convertToGraphData(analysisResult) {
  const nodes = analysisResult.studentList.map(student => ({
    id: student.id,
    name: student.name,
    degree: student.degree,
    degreeCentrality: student.degreeCentrality,
    betweennessCentrality: student.betweennessCentrality,
    // 判断节点类型
    category: analysisResult.leaders.find(l => l.id === student.id) ? 'leader' :
              analysisResult.isolated.find(i => i.id === student.id) ? 'isolated' : 'normal'
  }));
  
  // 构建边：基于邻接关系
  const edges = [];
  const studentMap = new Map(nodes.map(n => [n.id, n]));
  
  // 从问卷数据重建边（需要传入原始问卷数据）
  // 这里我们基于度中心性推断连接关系（简化版）
  // 实际应该从原始问卷数据中获取
  
  return { nodes, edges };
}

/**
 * 从问卷数据构建完整的图数据
 * @param {Array} questionnaireData 问卷数据
 * @param {Object} analysisResult 分析结果
 * @returns {Object} {nodes, edges} 节点和边数据
 */
export function buildGraphFromQuestionnaire(questionnaireData, analysisResult) {
  const studentMap = new Map();
  
  // 创建节点
  questionnaireData.forEach(item => {
    const student = analysisResult.studentList.find(s => s.id === item.studentId);
    if (student) {
      studentMap.set(item.studentId, {
        id: item.studentId,
        name: item.studentName || student.name,
        degree: student.degree,
        degreeCentrality: student.degreeCentrality,
        betweennessCentrality: student.betweennessCentrality,
        category: analysisResult.leaders.find(l => l.id === item.studentId) ? 'leader' :
                  analysisResult.isolated.find(i => i.id === item.studentId) ? 'isolated' : 'normal'
      });
    }
  });
  
  const nodes = Array.from(studentMap.values());
  const edges = [];
  const edgeSet = new Set(); // 避免重复边
  
  // 构建边
  questionnaireData.forEach(item => {
    if (item.friends && Array.isArray(item.friends)) {
      item.friends.forEach(friendId => {
        const edgeKey = [item.studentId, friendId].sort().join('-');
        if (!edgeSet.has(edgeKey) && studentMap.has(friendId)) {
          edgeSet.add(edgeKey);
          edges.push({
            source: item.studentId,
            target: friendId
          });
        }
      });
    }
  });
  
  return { nodes, edges };
}

