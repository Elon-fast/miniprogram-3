// module2/index.js - 智能排座引擎模块
import { get } from '../../utils/api.js';
import { generateSeatArrangement } from '../../utils/seatArrangementAlgorithm.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '智能排座引擎',
    loading: false,
    students: [],
    interactionHistory: [],
    seatTable: null,
    rows: 4,  // 默认4行
    cols: 4,  // 默认4列
    showSeatTable: false,
    // 自定义布局相关
    isCustomMode: false, // 是否处于自定义模式
    showLayoutModal: false, // 显示布局设置弹窗
    customRows: 4, // 自定义行数
    customCols: 4, // 自定义列数
    groupCols: '2', // 每个大组的列数配置（字符串，如"242"表示三个大组分别为2、4、2列）
    groupColsArray: [2], // 解析后的大组列数数组
    groupData: [{ cols: 2, startIndex: 0 }], // 大组数据数组，每个元素包含{cols: 列数, startIndex: 起始索引}
    unassignedStudents: [], // 待排列的学生列表
    // 拖拽相关
    draggingStudent: null, // 正在拖拽的学生
    dragStartSeat: null, // 拖拽起始座位位置 {row, col}
    dragOffset: { x: 0, y: 0 }, // 拖拽偏移量
    isDragging: false, // 是否正在拖拽
    dragStartPos: { x: 0, y: 0 }, // 拖拽起始位置
    dragTimer: null, // 长按定时器
    selectedSeat: null // 当前选中的座位位置 {row, col}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadData();
  },

  /**
   * 加载学生数据和互动历史
   */
  async loadData() {
    this.setData({ loading: true });
    
    try {
      const [studentsRes, interactionsRes] = await Promise.all([
        get('/api/module2/students'),
        get('/api/module2/interactions')
      ]);
      
      if (studentsRes.code === 200 && studentsRes.data) {
      this.setData({
        students: studentsRes.data,
        interactionHistory: interactionsRes.code === 200 ? interactionsRes.data : []
      });
      
      // 自动生成座位表（默认模式）
      this.generateSeats();
      }
    } catch (error) {
      console.error('数据加载失败:', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 生成座位表
   */
  generateSeats() {
    if (this.data.students.length === 0) {
      wx.showToast({
        title: '暂无学生数据',
        icon: 'none'
      });
      return;
    }
    
    try {
      // 计算合适的行列数（根据学生数量）
      const studentCount = this.data.students.length;
      const cols = Math.ceil(Math.sqrt(studentCount));
      const rows = Math.ceil(studentCount / cols);
      
      const result = generateSeatArrangement(
        this.data.students,
        rows,
        cols,
        {
          interactionHistory: this.data.interactionHistory,
          weights: {
            complementarity: 0.4,
            compatibility: 0.4,
            interference: 0.2
          }
        }
      );
      
      // 将座位表中的学生ID转换为学生信息（包含姓名和性别）
      const seatTableWithNames = result.seatTable.map(row => 
        row.map(studentId => {
          if (!studentId) return null;
          const student = this.data.students.find(s => s.id === studentId);
          return student ? { 
            id: student.id, 
            name: student.name, 
            gender: student.gender || 'male' 
          } : { id: studentId, name: studentId, gender: 'male' };
        })
      );
      
      // 默认大组配置：每2列一组
      const defaultGroupCols = Math.floor(cols / 2);
      const defaultGroupColsArray = Array(defaultGroupCols).fill(2);
      const remainingCols = cols % 2;
      if (remainingCols > 0) {
        defaultGroupColsArray.push(remainingCols);
      }
      
      // 计算每个大组的起始列索引，并构建大组数据（包含起始索引）
      const defaultGroupData = [];
      let currentIndex = 0;
      defaultGroupColsArray.forEach(groupCols => {
        defaultGroupData.push({
          cols: groupCols,
          startIndex: currentIndex
        });
        currentIndex += groupCols;
      });
      
      this.setData({
        seatTable: seatTableWithNames,
        rows: rows,
        cols: cols,
        groupCols: '2', // 默认每个大组2列
        groupColsArray: defaultGroupColsArray,
        groupData: defaultGroupData, // 大组数据（包含列数和起始索引）
        showSeatTable: true,
        seatStats: result.stats,
        isCustomMode: false,
        unassignedStudents: []
      });
      
      console.log('座位表生成成功:', result);
    } catch (error) {
      console.error('座位表生成失败:', error);
      wx.showToast({
        title: '生成失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 显示自定义布局弹窗
   */
  showCustomLayout() {
    this.setData({
      showLayoutModal: true,
      customRows: this.data.rows,
      customCols: this.data.cols
    });
  },

  /**
   * 关闭自定义布局弹窗
   */
  closeLayoutModal() {
    this.setData({
      showLayoutModal: false
    });
  },

  /**
   * 输入行数
   */
  onRowInput(e) {
    const value = e.detail.value;
    // 如果输入为空，允许为空（不强制设为1）
    if (value === '') {
      this.setData({
        customRows: ''
      });
      return;
    }
    const rows = parseInt(value);
    // 如果解析失败，保持原值
    if (isNaN(rows)) {
      return;
    }
    // 限制在1-10行
    const validRows = Math.max(1, Math.min(rows, 10));
    this.setData({
      customRows: validRows
    });
  },

  /**
   * 输入列数
   */
  onColInput(e) {
    const value = e.detail.value;
    // 如果输入为空，允许为空（不强制设为1）
    if (value === '') {
      this.setData({
        customCols: ''
      });
      return;
    }
    const cols = parseInt(value);
    // 如果解析失败，保持原值
    if (isNaN(cols)) {
      return;
    }
    // 限制在1-10列
    const validCols = Math.max(1, Math.min(cols, 10));
    this.setData({
      customCols: validCols
    });
    
    // 如果大组列数配置为空，自动设置为默认值
    if (!this.data.groupCols || this.data.groupCols === '') {
      this.setData({
        groupCols: '2'
      });
    }
  },

  /**
   * 输入大组列数配置
   */
  onGroupColsInput(e) {
    const value = e.detail.value;
    // 只允许输入数字
    const numericValue = value.replace(/[^\d]/g, '');
    this.setData({
      groupCols: numericValue
    });
  },

  /**
   * 验证大组列数配置
   */
  validateGroupCols(groupColsStr, totalCols) {
    if (!groupColsStr || groupColsStr === '') {
      return { valid: false, message: '请输入大组列数配置' };
    }
    
    // 如果输入的是单个数字，表示每个大组都是这个数字
    if (groupColsStr.length === 1) {
      const groupCols = parseInt(groupColsStr);
      if (isNaN(groupCols) || groupCols <= 0) {
        return { valid: false, message: '大组列数必须为正整数' };
      }
      
      // 检查是否能整除
      if (totalCols % groupCols !== 0) {
        return { valid: false, message: `总列数${totalCols}无法被大组列数${groupCols}整除` };
      }
      
      return { valid: true, groups: Array(totalCols / groupCols).fill(groupCols) };
    }
    
    // 如果输入的是多个数字，解析每个大组的列数
    const groupColsArray = groupColsStr.split('').map(s => parseInt(s));
    
    // 检查是否都是有效数字
    if (groupColsArray.some(n => isNaN(n) || n <= 0)) {
      return { valid: false, message: '大组列数配置包含无效数字' };
    }
    
    // 计算总列数
    const sum = groupColsArray.reduce((a, b) => a + b, 0);
    
    if (sum !== totalCols) {
      return { valid: false, message: `大组列数总和(${sum})与总列数(${totalCols})不匹配` };
    }
    
    return { valid: true, groups: groupColsArray };
  },

  /**
   * 确认自定义布局
   */
  confirmCustomLayout() {
    let { customRows, customCols, groupCols, students } = this.data;
    
    // 验证输入值
    customRows = parseInt(customRows) || 4;
    customCols = parseInt(customCols) || 4;
    
    // 限制范围
    customRows = Math.max(1, Math.min(customRows, 10));
    customCols = Math.max(1, Math.min(customCols, 10));
    
    // 验证大组列数配置
    const validation = this.validateGroupCols(groupCols, customCols);
    if (!validation.valid) {
      wx.showModal({
        title: '输入错误',
        content: validation.message,
        showCancel: false
      });
      return;
    }
    
    // 创建空的座位表
    const emptySeatTable = Array(customRows).fill(null).map(() => 
      Array(customCols).fill(null)
    );
    
    // 计算每个大组的起始列索引，并构建大组数据（包含起始索引）
    const groupData = [];
    let currentIndex = 0;
    validation.groups.forEach(groupCols => {
      groupData.push({
        cols: groupCols,
        startIndex: currentIndex
      });
      currentIndex += groupCols;
    });
    
    // 将所有学生放入待排列区域（包含性别信息）
    const unassignedStudents = students.map(s => ({
      id: s.id,
      name: s.name,
      gender: s.gender || 'male'
    }));
    
    this.setData({
      seatTable: emptySeatTable,
      rows: customRows,
      cols: customCols,
      groupCols: groupCols, // 保存大组配置字符串
      groupColsArray: validation.groups, // 保存解析后的大组数组
      groupData: groupData, // 大组数据（包含列数和起始索引）
      showSeatTable: true,
      isCustomMode: true,
      unassignedStudents: unassignedStudents,
      showLayoutModal: false,
      customRows: customRows, // 更新为有效值
      customCols: customCols, // 更新为有效值
      seatStats: {
        totalSeats: customRows * customCols,
        usedSeats: 0,
        emptySeats: customRows * customCols
      }
    });
  },

  /**
   * 自动排列（仅排列待排列区域的学生到剩余座位）
   */
  autoArrange() {
    const { seatTable, unassignedStudents, students, interactionHistory } = this.data;
    
    if (unassignedStudents.length === 0) {
      wx.showToast({
        title: '没有待排列的学生',
        icon: 'none'
      });
      return;
    }
    
    // 找出所有空座位位置
    const emptySeats = [];
    seatTable.forEach((row, rowIndex) => {
      row.forEach((seat, colIndex) => {
        if (!seat) {
          emptySeats.push({ row: rowIndex, col: colIndex });
        }
      });
    });
    
    if (emptySeats.length === 0) {
      wx.showToast({
        title: '没有空座位',
        icon: 'none'
      });
      return;
    }
    
    // 获取待排列学生的完整信息
    const studentsToArrange = unassignedStudents.map(student => 
      students.find(s => s.id === student.id)
    ).filter(s => s);
    
    // 如果待排列学生数量大于空座位数量，只取前N个
    const studentsToAssign = studentsToArrange.slice(0, emptySeats.length);
    
    // 使用算法生成排列（只针对待排列的学生）
    if (studentsToAssign.length > 0) {
      try {
        // 创建一个新的座位表，只包含待排列的学生
        const result = generateSeatArrangement(
          studentsToAssign,
          this.data.rows,
          this.data.cols,
          {
            interactionHistory: interactionHistory,
            weights: {
              complementarity: 0.4,
              compatibility: 0.4,
              interference: 0.2
            }
          }
        );
        
        // 更新座位表：保留已有座位，只更新空座位位置
        const newSeatTable = seatTable.map((row, rowIndex) => 
          row.map((seat, colIndex) => {
            // 如果这个位置已经有学生，保持不变
            if (seat) {
              return seat;
            }
            // 如果是空座位，尝试从算法结果中获取
            const studentId = result.seatTable[rowIndex]?.[colIndex];
            if (studentId) {
              const student = students.find(s => s.id === studentId);
              return student ? { 
                id: student.id, 
                name: student.name,
                gender: student.gender || 'male'
              } : null;
            }
            return null;
          })
        );
        
        // 从待排列列表中移除已分配的学生
        const assignedIds = new Set();
        newSeatTable.forEach(row => {
          row.forEach(seat => {
            if (seat) assignedIds.add(seat.id);
          });
        });
        
        // 找出原来已分配的学生ID（在调用算法前）
        const originalAssignedIds = new Set();
        seatTable.forEach(row => {
          row.forEach(seat => {
            if (seat) originalAssignedIds.add(seat.id);
          });
        });
        
        // 只有新分配的学生才从待排列列表中移除
        const remainingUnassigned = unassignedStudents.filter(s => {
          // 如果这个学生不在原来的已分配列表中，但在新的已分配列表中，说明是新分配的
          if (!originalAssignedIds.has(s.id) && assignedIds.has(s.id)) {
            return false; // 从待排列列表中移除
          }
          return true; // 保留在待排列列表中
        });
        
        this.setData({
          seatTable: newSeatTable,
          unassignedStudents: remainingUnassigned,
          seatStats: {
            totalSeats: this.data.rows * this.data.cols,
            usedSeats: assignedIds.size,
            emptySeats: this.data.rows * this.data.cols - assignedIds.size
          }
        });
        
        wx.showToast({
          title: `已自动排列${studentsToAssign.length}名学生`,
          icon: 'success'
        });
      } catch (error) {
        console.error('自动排列失败:', error);
        wx.showToast({
          title: '自动排列失败',
          icon: 'none'
        });
      }
    }
  },

  /**
   * 清空排列
   */
  clearArrangement() {
    const { seatTable, unassignedStudents, students } = this.data;
    
    // 收集所有已分配的学生（保留性别信息）
    const assignedStudents = [];
    seatTable.forEach(row => {
      row.forEach(seat => {
        if (seat) {
          assignedStudents.push({ 
            id: seat.id, 
            name: seat.name,
            gender: seat.gender || 'male'
          });
        }
      });
    });
    
    // 创建空的座位表
    const emptySeatTable = seatTable.map(row => 
      row.map(() => null)
    );
    
    // 合并已分配的学生和当前待排列区域的学生，去重
    const assignedIds = new Set(assignedStudents.map(s => s.id));
    const existingUnassignedIds = new Set(unassignedStudents.map(s => s.id));
    
    // 合并：已分配的学生 + 当前待排列区域的学生（去重）
    const allUnassignedStudents = [
      ...assignedStudents,
      ...unassignedStudents.filter(s => !assignedIds.has(s.id))
    ];
    
    // 将所有学生放回待排列区域
    this.setData({
      seatTable: emptySeatTable,
      unassignedStudents: allUnassignedStudents,
      seatStats: {
        totalSeats: this.data.rows * this.data.cols,
        usedSeats: 0,
        emptySeats: this.data.rows * this.data.cols
      }
    });
    
    wx.showToast({
      title: '已清空排列',
      icon: 'success'
    });
  },

  /**
   * 点击待排列学生（选中准备放置）
   */
  onStudentClick(e) {
    const studentId = e.currentTarget.dataset.studentId;
    const student = this.data.unassignedStudents.find(s => s.id === studentId);
    
    if (student) {
      this.setData({
        draggingStudent: student,
        isDragging: true,
        dragStartSeat: null, // 标记是从待排列区域
        selectedSeat: null // 清除座位选中状态
      });
      wx.showToast({
        title: `已选中${student.name}，请点击目标座位`,
        icon: 'none',
        duration: 1500
      });
      console.log('选中学生:', student.name);
    }
  },

  /**
   * 点击座位（放置或选中）
   */
  onSeatClick(e) {
    const { row, col } = e.currentTarget.dataset;
    const seat = this.data.seatTable[row][col];
    const targetRow = parseInt(row);
    const targetCol = parseInt(col);
    
    // 首先检查是否是点击已选中的座位（无论是否有学生）
    if (this.data.selectedSeat && 
        this.data.selectedSeat.row === targetRow && 
        this.data.selectedSeat.col === targetCol) {
      // 点击同一位置，取消选中
      console.log('点击已选中的座位，取消选中');
      this.setData({
        isDragging: false,
        draggingStudent: null,
        dragStartSeat: null,
        selectedSeat: null
      });
      return;
    }
    
    // 如果正在拖拽，执行放置
    if (this.data.isDragging && this.data.draggingStudent) {
      // 执行放置
      this.doDropToSeat(targetRow, targetCol);
      return;
    }
    
    // 如果没有在拖拽，但有座位，选中这个座位准备拖拽
    if (seat) {
      // 确保座位包含完整的性别信息
      let seatWithGender = seat;
      if (!seat.gender) {
        const fullStudent = this.data.students.find(s => s.id === seat.id);
        if (fullStudent) {
          seatWithGender = {
            id: fullStudent.id,
            name: fullStudent.name,
            gender: fullStudent.gender || 'male'
          };
        }
      }
      // 选中新座位
      this.setData({
        draggingStudent: seatWithGender,
        dragStartSeat: { row: targetRow, col: targetCol },
        isDragging: true,
        selectedSeat: { row: targetRow, col: targetCol }
      });
      wx.showToast({
        title: `已选中${seatWithGender.name}，请点击目标座位`,
        icon: 'none',
        duration: 1500
      });
      console.log('选中座位:', seatWithGender.name, '位置', row, col);
    } else {
      // 如果点击的是空座位，清除选中状态
      this.setData({
        selectedSeat: null,
        draggingStudent: null,
        isDragging: false,
        dragStartSeat: null
      });
    }
  },

  /**
   * 拖拽移动
   */
  onDragMove(e) {
    if (!this.data.isDragging) return;
    // 拖拽移动时不需要更新UI，保持简单
  },

  /**
   * 座位表区域触摸结束（用于处理从待排列区域拖拽到座位的情况）
   */
  onSeatTableTouchEnd(e) {
    // 如果正在拖拽且是从待排列区域拖拽的，尝试找到触摸位置对应的座位
    if (this.data.isDragging && !this.data.dragStartSeat && this.data.draggingStudent) {
      // 通过触摸位置计算落在哪个座位上
      // 这里简化处理：如果触摸结束在座位表区域，取消拖拽
      // 实际应该通过触摸位置计算具体座位，但小程序中比较复杂
      // 所以改为：如果触摸结束在座位表区域但没有触发onSeatDrop，则取消拖拽
      setTimeout(() => {
        if (this.data.isDragging) {
          console.log('拖拽取消（触摸结束在座位表区域但未触发onSeatDrop）');
          this.setData({
            isDragging: false,
            draggingStudent: null,
            dragStartSeat: null,
            selectedSeat: null // 清除选中状态
          });
        }
      }, 100);
    }
  },

  /**
   * 待排列列表区域触摸结束
   */
  onUnassignedListTouchEnd(e) {
    // 如果正在拖拽，取消拖拽
    if (this.data.isDragging) {
      console.log('拖拽取消（触摸结束在待排列区域）');
      this.setData({
        isDragging: false,
        draggingStudent: null,
        dragStartSeat: null,
        selectedSeat: null // 清除选中状态
      });
    }
  },

  /**
   * 拖拽结束（放置到座位）- 保留用于触摸拖拽
   */
  onSeatDrop(e) {
    // 检查是否正在拖拽
    if (!this.data.isDragging || !this.data.draggingStudent) {
      return;
    }
    
    const { row, col } = e.currentTarget.dataset;
    this.doDropToSeat(parseInt(row), parseInt(col));
  },

  /**
   * 执行放置到座位的操作
   */
  doDropToSeat(targetRow, targetCol) {
    const { draggingStudent, dragStartSeat, seatTable, unassignedStudents } = this.data;
    
    if (!draggingStudent) {
      return;
    }
    
    const currentSeat = seatTable[targetRow][targetCol];
    
    console.log('放置到座位:', targetRow, targetCol, '当前座位:', currentSeat, '拖拽学生:', draggingStudent.name);
    
    // 如果拖拽到同一个位置，不做处理
    if (dragStartSeat && dragStartSeat.row === targetRow && dragStartSeat.col === targetCol) {
      console.log('拖拽到同一位置，取消');
      this.setData({ 
        isDragging: false, 
        draggingStudent: null, 
        dragStartSeat: null,
        selectedSeat: null // 清除选中状态
      });
      return;
    }
    
    const newSeatTable = seatTable.map((r, rIdx) => 
      r.map((seat, cIdx) => {
        // 目标位置：放置拖拽的学生（确保包含性别信息）
        if (rIdx === targetRow && cIdx === targetCol) {
          // 确保 draggingStudent 包含完整的性别信息
          if (draggingStudent && !draggingStudent.gender) {
            const fullStudent = this.data.students.find(s => s.id === draggingStudent.id);
            return fullStudent ? {
              id: fullStudent.id,
              name: fullStudent.name,
              gender: fullStudent.gender || 'male'
            } : draggingStudent;
          }
          return draggingStudent;
        }
        // 如果是从座位拖拽，处理起始位置
        if (dragStartSeat && rIdx === dragStartSeat.row && cIdx === dragStartSeat.col) {
          // 如果目标位置原来有学生，交换位置（将目标位置的学生放到起始位置）
          if (currentSeat) {
            // 确保 currentSeat 包含完整的性别信息
            if (!currentSeat.gender) {
              const fullStudent = this.data.students.find(s => s.id === currentSeat.id);
              return fullStudent ? {
                id: fullStudent.id,
                name: fullStudent.name,
                gender: fullStudent.gender || 'male'
              } : currentSeat;
            }
            return currentSeat; // 交换：将目标位置的学生放到起始位置
          }
          // 如果目标位置是空的，清空起始位置
          return null;
        }
        // 确保保留的座位也包含性别信息
        if (seat && !seat.gender) {
          const fullStudent = this.data.students.find(s => s.id === seat.id);
          return fullStudent ? {
            id: fullStudent.id,
            name: fullStudent.name,
            gender: fullStudent.gender || 'male'
          } : seat;
        }
        return seat;
      })
    );
    
    // 更新待排列列表
    let newUnassignedStudents = [...unassignedStudents];
    
    // 如果是从待排列区域拖拽，从列表中移除
    if (!dragStartSeat) {
      newUnassignedStudents = newUnassignedStudents.filter(s => s.id !== draggingStudent.id);
      console.log('从待排列区域移除:', draggingStudent.name);
    }
    
    // 注意：如果是从座位拖拽到座位（交换），不需要更新待排列列表
    // 因为两个学生都在座位上，只是交换了位置
    
    this.setData({
      seatTable: newSeatTable,
      unassignedStudents: newUnassignedStudents,
      draggingStudent: null,
      dragStartSeat: null,
      isDragging: false,
      selectedSeat: null, // 清除选中状态
      seatStats: {
        totalSeats: this.data.rows * this.data.cols,
        usedSeats: newSeatTable.flat().filter(s => s).length,
        emptySeats: this.data.rows * this.data.cols - newSeatTable.flat().filter(s => s).length
      }
    });
    
    console.log('拖拽完成，座位表已更新');
  },

  /**
   * 拖拽结束（未放置到有效位置）
   */
  onDragEnd(e) {
    // 如果触摸结束在座位区域外，取消拖拽
    if (this.data.isDragging) {
      console.log('拖拽取消（未放置到有效位置）');
      this.setData({
        isDragging: false,
        draggingStudent: null,
        dragStartSeat: null,
        selectedSeat: null, // 清除选中状态
        dragOffset: { x: 0, y: 0 }
      });
    }
  },

  /**
   * 重新生成座位表
   */
  reGenerate() {
    this.generateSeats();
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止事件冒泡
  },

  /**
   * 根据学生ID获取学生信息
   */
  getStudentById(studentId) {
    return this.data.students.find(s => s.id === studentId) || null;
  }
});
