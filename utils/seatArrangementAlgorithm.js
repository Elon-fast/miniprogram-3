/**
 * 智能排座引擎算法模块
 * 功能：基于多参数优化自动生成座位表
 */

/**
 * 计算两个学生的学科成绩互补性分数
 * @param {Object} student1 学生1对象 {id, name, scores: {math, chinese, english, ...}}
 * @param {Object} student2 学生2对象
 * @returns {Number} 互补性分数 (0-1)，越高越互补
 */
export function calculateSubjectComplementarity(student1, student2) {
  const subjects = Object.keys(student1.scores || {});
  if (subjects.length === 0) return 0.5; // 默认中等互补
  
  let complementarityScore = 0;
  let count = 0;
  
  subjects.forEach(subject => {
    const score1 = student1.scores[subject] || 0;
    const score2 = student2.scores[subject] || 0;
    
    // 互补性：一个高一个低，或者两个都中等
    const diff = Math.abs(score1 - score2);
    const avg = (score1 + score2) / 2;
    
    // 如果差异适中（互补），得分高
    // 如果差异太大（都很好或都很差），得分低
    if (diff > 20 && diff < 40 && avg > 60) {
      complementarityScore += 0.8; // 强互补
    } else if (diff > 10 && diff < 30) {
      complementarityScore += 0.6; // 中等互补
    } else if (Math.abs(avg - 70) < 10) {
      complementarityScore += 0.5; // 都中等，也可以
    } else {
      complementarityScore += 0.3; // 弱互补
    }
    count++;
  });
  
  return count > 0 ? complementarityScore / count : 0.5;
}

/**
 * 计算两个学生的性格相容性分数
 * @param {Object} student1 学生1对象 {id, name, personality: {type, traits: [...]}}
 * @param {Object} student2 学生2对象
 * @returns {Number} 相容性分数 (0-1)，越高越相容
 */
export function calculatePersonalityCompatibility(student1, student2) {
  // 简化的性格相容性判断
  const type1 = student1.personality?.type || '';
  const type2 = student2.personality?.type || '';
  
  // 性格类型相容性规则（简化版）
  const compatibilityRules = {
    '外向': { '内向': 0.7, '外向': 0.9, '中性': 0.8 },
    '内向': { '外向': 0.7, '内向': 0.8, '中性': 0.75 },
    '中性': { '外向': 0.8, '内向': 0.75, '中性': 0.85 }
  };
  
  if (compatibilityRules[type1] && compatibilityRules[type1][type2]) {
    return compatibilityRules[type1][type2];
  }
  
  // 如果没有类型，检查特征相似度
  const traits1 = student1.personality?.traits || [];
  const traits2 = student2.personality?.traits || [];
  
  if (traits1.length === 0 || traits2.length === 0) {
    return 0.7; // 默认中等相容
  }
  
  // 计算特征重叠度
  const commonTraits = traits1.filter(t => traits2.includes(t)).length;
  const totalTraits = new Set([...traits1, ...traits2]).size;
  const similarity = totalTraits > 0 ? commonTraits / totalTraits : 0.5;
  
  // 相似度适中最好（太相似可能冲突，太不同可能不合）
  if (similarity > 0.3 && similarity < 0.7) {
    return 0.8;
  } else if (similarity >= 0.7) {
    return 0.6; // 太相似
  } else {
    return 0.5; // 太不同
  }
}

/**
 * 检查两个学生是否应该避免坐在一起（基于历史互动记录）
 * @param {Object} student1 学生1对象
 * @param {Object} student2 学生2对象
 * @param {Array} interactionHistory 互动历史记录
 * @returns {Number} 干扰分数 (0-1)，越高越应该避免
 */
export function calculateInterferenceScore(student1, student2, interactionHistory = []) {
  // 查找两个学生的互动记录
  const interactions = interactionHistory.filter(record => 
    (record.studentId1 === student1.id && record.studentId2 === student2.id) ||
    (record.studentId1 === student2.id && record.studentId2 === student1.id)
  );
  
  if (interactions.length === 0) {
    return 0.1; // 没有记录，默认低干扰
  }
  
  // 计算负面互动比例
  const negativeCount = interactions.filter(i => i.type === 'negative' || i.conflict).length;
  const negativeRatio = negativeCount / interactions.length;
  
  // 如果负面互动比例高，干扰分数高
  return Math.min(negativeRatio * 1.5, 1.0);
}

/**
 * 计算两个学生的综合适配度
 * @param {Object} student1 学生1对象
 * @param {Object} student2 学生2对象
 * @param {Object} options 配置选项 {weights: {complementarity, compatibility, interference}}
 * @returns {Number} 综合适配度分数 (0-1)，越高越适合坐在一起
 */
export function calculatePairScore(student1, student2, options = {}) {
  const weights = options.weights || {
    complementarity: 0.4,  // 学科互补权重
    compatibility: 0.4,    // 性格相容权重
    interference: 0.2      // 干扰避免权重
  };
  
  const complementarity = calculateSubjectComplementarity(student1, student2);
  const compatibility = calculatePersonalityCompatibility(student1, student2);
  const interference = calculateInterferenceScore(student1, student2, options.interactionHistory || []);
  
  // 综合分数 = 互补性 * 权重 + 相容性 * 权重 - 干扰 * 权重
  const score = 
    complementarity * weights.complementarity +
    compatibility * weights.compatibility -
    interference * weights.interference;
  
  return Math.max(0, Math.min(1, score)); // 限制在0-1之间
}

/**
 * 使用贪心算法生成座位表
 * @param {Array} students 学生列表
 * @param {Number} rows 行数
 * @param {Number} cols 列数
 * @param {Object} options 配置选项
 * @returns {Array} 二维数组，表示座位表 [[studentId, studentId, ...], ...]
 */
export function generateSeatArrangement(students, rows, cols, options = {}) {
  const totalSeats = rows * cols;
  const studentCount = students.length;
  
  if (studentCount > totalSeats) {
    console.warn(`学生数量(${studentCount})超过座位数(${totalSeats})`);
  }
  
  // 初始化座位表
  const seatTable = Array(rows).fill(null).map(() => Array(cols).fill(null));
  const usedStudents = new Set();
  
  // 如果学生数量少于座位数，随机放置空位
  const emptySeats = totalSeats - studentCount;
  const emptyPositions = [];
  for (let i = 0; i < emptySeats; i++) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    emptyPositions.push([row, col]);
  }
  emptyPositions.forEach(([r, c]) => {
    seatTable[r][c] = null; // 空座位
  });
  
  // 贪心算法：每次选择适配度最高的配对
  const availableStudents = [...students];
  const placedStudents = [];
  
  // 放置第一个学生（随机选择或选择中心位置）
  const firstStudent = availableStudents[0];
  const centerRow = Math.floor(rows / 2);
  const centerCol = Math.floor(cols / 2);
  seatTable[centerRow][centerCol] = firstStudent.id;
  usedStudents.add(firstStudent.id);
  placedStudents.push({ student: firstStudent, row: centerRow, col: centerCol });
  availableStudents.splice(0, 1);
  
  // 依次放置剩余学生
  while (availableStudents.length > 0) {
    let bestStudent = null;
    let bestPosition = null;
    let bestScore = -1;
    
    // 为每个未放置的学生找到最佳位置
    for (const student of availableStudents) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (seatTable[r][c] !== null) continue; // 座位已被占用
          
          // 计算与相邻已放置学生的适配度
          let totalScore = 0;
          let neighborCount = 0;
          
          // 检查上下左右四个方向的邻居
          const neighbors = [
            [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
          ];
          
          neighbors.forEach(([nr, nc]) => {
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && seatTable[nr][nc] !== null) {
              const neighborStudent = students.find(s => s.id === seatTable[nr][nc]);
              if (neighborStudent) {
                const score = calculatePairScore(student, neighborStudent, options);
                totalScore += score;
                neighborCount++;
              }
            }
          });
          
          // 如果没有邻居，给一个基础分数
          const avgScore = neighborCount > 0 ? totalScore / neighborCount : 0.5;
          
          if (avgScore > bestScore) {
            bestScore = avgScore;
            bestStudent = student;
            bestPosition = [r, c];
          }
        }
      }
    }
    
    // 放置最佳学生
    if (bestStudent && bestPosition) {
      const [r, c] = bestPosition;
      seatTable[r][c] = bestStudent.id;
      usedStudents.add(bestStudent.id);
      placedStudents.push({ student: bestStudent, row: r, col: c });
      
      // 从可用列表中移除
      const index = availableStudents.findIndex(s => s.id === bestStudent.id);
      if (index !== -1) {
        availableStudents.splice(index, 1);
      }
    } else {
      // 如果没有找到合适位置，随机放置
      const student = availableStudents.shift();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (seatTable[r][c] === null) {
            seatTable[r][c] = student.id;
            usedStudents.add(student.id);
            placedStudents.push({ student, row: r, col: c });
            break;
          }
        }
        if (usedStudents.has(student.id)) break;
      }
    }
  }
  
  return {
    seatTable,
    placedStudents,
    stats: {
      totalSeats: totalSeats,
      usedSeats: studentCount,
      emptySeats: emptySeats
    }
  };
}

