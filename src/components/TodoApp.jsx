// TaskHub - Task & Goal Management App
// Clean version with proper structure

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Flag, Edit3, MessageSquare, Archive, Check, ChevronRight, ChevronDown, Menu, Tag, BarChart3, Filter, X, Zap, CheckCircle, AlertCircle, Loader2, ChevronUp, GripVertical, Download, Target, TrendingUp, Trophy } from 'lucide-react';

// Toast Notification Component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-indigo-600';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
      <Icon className="w-5 h-5" />
      <span className="flex-1 font-medium">{message}</span>
      <button onClick={onClose} className="hover:opacity-80 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Main TodoApp Component
const TodoApp = () => {
  const [showArchived, setShowArchived] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [currentView, setCurrentView] = useState('tasks'); // 'tasks' or 'goals'
  const [sortBy, setSortBy] = useState('smart');
  const [editingTask, setEditingTask] = useState(null);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [newSubtask, setNewSubtask] = useState('');
  const [addingSubtaskTo, setAddingSubtaskTo] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentingTask, setCommentingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [toasts, setToasts] = useState([]);
  const [deletedTodos, setDeletedTodos] = useState([]);
  const [lightningTasks, setLightningTasks] = useState(new Set());
  const [showStormLoader, setShowStormLoader] = useState(true);
  const [savingTask, setSavingTask] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);

  const categories = ['Digital Marketing', 'SEO', 'Business Intelligence', 'Analytics', 'Websites', 'Admin', 'Misc'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const goalTimeframes = ['This Month', 'This Quarter', 'This Year', 'Long-term'];

  // Add Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Apply font to body
    document.body.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  }, []);

  // Toast management
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Load todos and goals from memory (simulated localStorage) on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate loading with some sample data
        const sampleTodos = [
          {
            id: '1',
            title: 'Launch new marketing campaign',
            status: 'In Progress',
            priority: 'High',
            category: 'Digital Marketing',
            dueDate: new Date().toISOString().split('T')[0],
            archived: false,
            subtasks: [
              { id: 1, title: 'Design banner ads', completed: true },
              { id: 2, title: 'Write ad copy', completed: false }
            ],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            order: 0
          },
          {
            id: '2',
            title: 'Optimize website SEO',
            status: 'To Do',
            priority: 'Medium',
            category: 'SEO',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            archived: false,
            subtasks: [],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            order: 1
          }
        ];
        
        const sampleGoals = [
          {
            id: '1',
            title: 'Increase website traffic by 50%',
            category: 'Digital Marketing',
            timeframe: 'This Quarter',
            progress: 35,
            milestones: [
              { id: 1, title: 'Implement SEO improvements', completed: true },
              { id: 2, title: 'Launch social media campaign', completed: false },
              { id: 3, title: 'Start content marketing', completed: false }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completed: false
          }
        ];
        
        // Wait for storm loader to finish
        await new Promise(resolve => setTimeout(resolve, 4500));
        
        setTodos(sampleTodos);
        setGoals(sampleGoals);
        setLoading(false);
        
        // Hide storm loader after data is loaded
        setTimeout(() => setShowStormLoader(false), 500);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
        setShowStormLoader(false);
      }
    };

    loadData();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // New task: Ctrl/Cmd + N
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        document.querySelector('input[placeholder="Add a new task..."]')?.focus();
      }
      // Simple N key when not in input
      if (e.key === 'n' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        document.querySelector('input[placeholder="Add a new task..."]')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add todo
  const addTodo = async () => {
    if (newTodo.trim()) {
      setSavingTask(true);

      let newTask;
      if (sortBy === 'manual') {
        // Manual sort: insert at top and bump others down
        const updatedTodos = todos.map(todo => ({
          ...todo,
          order: (todo.order || 0) + 1
        }));

        newTask = {
          id: Date.now().toString(),
          title: newTodo,
          status: 'To Do',
          priority: 'Medium',
          category: 'Digital Marketing',
          dueDate: new Date().toISOString().split('T')[0],
          archived: false,
          subtasks: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: 0
        };

        setTodos([newTask, ...updatedTodos]);
      } else {
        // Other sorts: append after highest order
        const maxOrder = Math.max(...todos.map(t => t.order || 0), -1);

        newTask = {
          id: Date.now().toString(),
          title: newTodo,
          status: 'To Do',
          priority: 'Medium',
          category: 'Digital Marketing',
          dueDate: new Date().toISOString().split('T')[0],
          archived: false,
          subtasks: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: maxOrder + 1
        };

        setTodos(prev => [newTask, ...prev]);
      }

      setNewTodo('');
      addToast('Task added successfully!');

      // Simulate save delay
      setTimeout(() => setSavingTask(false), 300);
    }
  };

  // Add goal callback
  const onAddGoal = async (goalTitle) => {
    if (goalTitle.trim()) {
      setSavingGoal(true);
      
      const goal = {
        id: Date.now().toString(),
        title: goalTitle,
        category: 'Digital Marketing',
        timeframe: 'This Quarter',
        progress: 0,
        milestones: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completed: false
      };

      setGoals(prev => [goal, ...prev]);
      addToast('Goal added successfully! 🎯');
      
      setTimeout(() => setSavingGoal(false), 300);
      return true; // Signal success
    }
    return false;
  };

  // Update todo
  const updateTodo = (id, updates) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id 
          ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
          : todo
      )
    );
    
    if (updates.status === 'Done') {
      // Trigger lightning animation
      setLightningTasks(prev => new Set([...prev, id]));
      
      // Archive the task after animation
      setTimeout(() => {
        setTodos(prevTodos => 
          prevTodos.map(todo => 
            todo.id === id 
              ? { ...todo, archived: true }
              : todo
          )
        );
        setLightningTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        addToast('Task completed and archived! ⚡', 'success');
      }, 1000);
    }
  };

  // Update goal
  const updateGoal = (id, updates) => {
    setGoals(prevGoals => 
      prevGoals.map(goal => 
        goal.id === id 
          ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
          : goal
      )
    );
    
    if (updates.progress === 100 && !goals.find(g => g.id === id)?.completed) {
      addToast('Goal achieved! 🎉🏆', 'success');
      updateGoal(id, { completed: true });
    }
  };

  // Move task up or down
  const moveTask = (id, direction) => {
    const activeTodos = todos.filter(todo => !todo.archived).sort((a, b) => (a.order || 0) - (b.order || 0));
    const index = activeTodos.findIndex(t => t.id === id);
    
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < activeTodos.length - 1)) {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const newTodos = [...activeTodos];
      [newTodos[index], newTodos[newIndex]] = [newTodos[newIndex], newTodos[index]];
      
      // Update order values
      const updatedTodos = newTodos.map((todo, idx) => ({
        ...todo,
        order: idx
      }));
      
      // Merge back with archived todos
      const archivedTodos = todos.filter(todo => todo.archived);
      setTodos([...updatedTodos, ...archivedTodos]);
    }
  };

  // Delete todo with undo
  const deleteTodo = (id) => {
    const todoToDelete = todos.find(t => t.id === id);
    if (!todoToDelete) return;

    // Store the deleted todo
    setDeletedTodos(prev => [...prev, todoToDelete]);
    
    // Remove from todos
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    
    // Show undo toast
    const toastId = Date.now();
    setToasts(prev => [...prev, {
      id: toastId,
      message: 'Task deleted',
      type: 'info',
      action: {
        label: 'Undo',
        onClick: () => {
          // Restore the todo
          setTodos(prevTodos => [todoToDelete, ...prevTodos]);
          setDeletedTodos(prev => prev.filter(t => t.id !== id));
          removeToast(toastId);
          addToast('Task restored!');
        }
      }
    }]);
  };

  // Delete goal
  const deleteGoal = (id) => {
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
    addToast('Goal removed');
  };

  // Helper functions for subtasks and comments
  const addSubtask = (taskId) => {
    if (newSubtask.trim()) {
      const task = todos.find(t => t.id === taskId);
      const subtask = {
        id: Date.now(),
        title: newSubtask,
        completed: false
      };
      updateTodo(taskId, {
        subtasks: [...(task.subtasks || []), subtask]
      });
      setNewSubtask('');
      setAddingSubtaskTo(null);
    }
  };

  const deleteSubtask = (taskId, subtaskId) => {
    const task = todos.find(t => t.id === taskId);
    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
    updateTodo(taskId, { subtasks: updatedSubtasks });
  };

  const toggleSubtask = (taskId, subtaskId) => {
    const task = todos.find(t => t.id === taskId);
    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTodo(taskId, { subtasks: updatedSubtasks });
  };

  const updateSubtask = (taskId, subtaskId, newTitle) => {
    const task = todos.find(t => t.id === taskId);
    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, title: newTitle } : st
    );
    updateTodo(taskId, { subtasks: updatedSubtasks });
  };

  const addComment = (taskId) => {
    if (newComment.trim()) {
      const task = todos.find(t => t.id === taskId);
      const comment = {
        id: Date.now(),
        text: newComment,
        timestamp: new Date().toLocaleString()
      };
      updateTodo(taskId, {
        comments: [...(task.comments || []), comment]
      });
      setNewComment('');
      setCommentingTask(null);
    }
  };

  const toggleTaskExpansion = (taskId) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // Add milestone to goal
  const addMilestone = (goalId, milestone) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const newMilestone = {
      id: Date.now(),
      title: milestone,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    updateGoal(goalId, {
      milestones: [...(goal.milestones || []), newMilestone]
    });
  };

  // Toggle milestone
  const toggleMilestone = (goalId, milestoneId) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const updatedMilestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    
    updateGoal(goalId, { milestones: updatedMilestones });
    
    // Update progress based on milestones
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const progress = updatedMilestones.length > 0 
      ? Math.round((completedCount / updatedMilestones.length) * 100)
      : 0;
    
    updateGoal(goalId, { progress });
  };

  // Filtering and sorting functions
  const getActiveTodos = () => todos.filter(todo => !todo.archived);
  const getArchivedTodos = () => todos.filter(todo => todo.archived);
  
  const sortTodos = (todosToSort) => {
    const priorityWeight = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    const statusWeight = { 'In Progress': 3, 'To Do': 2, 'Done': 1 };
    const now = new Date();
    
    return [...todosToSort].sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      
      switch (sortBy) {
        case 'manual':
          return (a.order || 0) - (b.order || 0);
          
        case 'priority':
          return priorityWeight[b.priority] - priorityWeight[a.priority];
          
        case 'dueDate':
          const isOverdueA = dateA < now && a.status !== 'Done';
          const isOverdueB = dateB < now && b.status !== 'Done';
          
          if (isOverdueA && !isOverdueB) return -1;
          if (!isOverdueA && isOverdueB) return 1;
          return dateA - dateB;
          
        case 'status':
          return statusWeight[b.status] - statusWeight[a.status];
          
        case 'smart':
        default:
          const daysUntilA = Math.ceil((dateA - now) / (1000 * 60 * 60 * 24));
          const daysUntilB = Math.ceil((dateB - now) / (1000 * 60 * 60 * 24));
          
          let scoreA = 0;
          let scoreB = 0;
          
          scoreA += priorityWeight[a.priority] * 10;
          scoreB += priorityWeight[b.priority] * 10;
          
          if (a.status !== 'Done') {
            if (daysUntilA < 0) scoreA += 50;
            else if (daysUntilA === 0) scoreA += 45;
            else if (daysUntilA === 1) scoreA += 40;
            else if (daysUntilA <= 3) scoreA += 30;
            else if (daysUntilA <= 7) scoreA += 20;
            else scoreA += Math.max(0, 15 - daysUntilA);
          }
          
          if (b.status !== 'Done') {
            if (daysUntilB < 0) scoreB += 50;
            else if (daysUntilB === 0) scoreB += 45;
            else if (daysUntilB === 1) scoreB += 40;
            else if (daysUntilB <= 3) scoreB += 30;
            else if (daysUntilB <= 7) scoreB += 20;
            else scoreB += Math.max(0, 15 - daysUntilB);
          }
          
          scoreA += statusWeight[a.status] * 3;
          scoreB += statusWeight[b.status] * 3;
          
          return scoreB - scoreA;
      }
    });
  };
  
  const displayTodos = sortTodos(showArchived ? getArchivedTodos() : getActiveTodos());

  // Export to CSV function
  const exportToCSV = () => {
    const activeTodos = getActiveTodos();
    const archivedTodos = getArchivedTodos();
    
    // Helper function to escape CSV fields
    const escapeCSV = (field) => {
      if (field === null || field === undefined) return '';
      const str = String(field);
      // If field contains comma, quote, or newline, wrap in quotes and escape quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    // CSV headers
    const headers = ['Title', 'Status', 'Priority', 'Category', 'Due Date', 'Created At', 'Subtasks', 'Comments'];
    
    // Convert todos to CSV format
    const todoToCSVRow = (todo) => {
      const subtasks = todo.subtasks?.map(st => `${st.title}${st.completed ? ' ✓' : ''}`).join('; ') || '';
      const comments = todo.comments?.map(c => c.text).join('; ') || '';
      
      return [
        todo.title,
        todo.status,
        todo.priority,
        todo.category,
        new Date(todo.dueDate).toLocaleDateString(),
        new Date(todo.createdAt).toLocaleDateString(),
        subtasks,
        comments
      ].map(escapeCSV).join(',');
    };
    
    // Build CSV content
    let csvContent = '';
    
    // Active tasks section
    csvContent += 'ACTIVE TASKS\n';
    csvContent += headers.join(',') + '\n';
    activeTodos.forEach(todo => {
      csvContent += todoToCSVRow(todo) + '\n';
    });
    
    // Add spacing
    csvContent += '\n\n';
    
    // Archived tasks section
    csvContent += 'ARCHIVED TASKS\n';
    csvContent += headers.join(',') + '\n';
    archivedTodos.forEach(todo => {
      csvContent += todoToCSVRow(todo) + '\n';
    });
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `TaskHub_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addToast('Tasks exported successfully!', 'success');
  };

  // Style helper functions
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-red-400';
      case 'High': return 'text-purple-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Digital Marketing': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'SEO': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Business Intelligence': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Analytics': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Websites': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'Admin': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Misc': 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  // Storm Loader Component
  const StormLoader = () => (
    <div className="fixed inset-0 bg-zinc-900 z-50 flex items-center justify-center storm-bg overflow-hidden storm-loader-container">
      {/* Background lightning effects */}
      <div className="absolute inset-0">
        <div className="lightning-bg lightning-bg-1"></div>
        <div className="lightning-bg lightning-bg-2"></div>
        <div className="lightning-bg lightning-bg-3"></div>
        <div className="lightning-bg lightning-bg-4"></div>
        <div className="lightning-bg lightning-bg-5"></div>
        <div className="random-flash random-flash-1"></div>
        <div className="random-flash random-flash-2"></div>
        <div className="random-flash random-flash-3"></div>
      </div>
      
      {/* Storm clouds effect */}
      <div className="absolute inset-0 storm-clouds"></div>
      
      {/* Rain effect */}
      <div className="rain-container">
        <div className="rain"></div>
      </div>
      
      <div className="text-center relative z-10">
        <div className="relative">
          <div className="lightning-container">
            <div className="lightning lightning-1"></div>
            <div className="lightning lightning-2"></div>
            <div className="lightning lightning-3"></div>
          </div>
          <div className="w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse relative z-10 shadow-2xl storm-icon">
            <Zap className="w-16 h-16 text-white animate-bounce" />
          </div>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2 relative">
          Charging TaskHub...
        </h2>
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full lightning-progress shadow-lg"
          ></div>
        </div>
      </div>
    </div>
  );

  // Reports data calculation
  const getReportData = () => {
    const activeTodos = getActiveTodos();
    
    const statusBreakdown = {
      'To Do': activeTodos.filter(t => t.status === 'To Do').length,
      'In Progress': activeTodos.filter(t => t.status === 'In Progress').length,
      'Done': activeTodos.filter(t => t.status === 'Done').length
    };

    const priorityBreakdown = priorities.reduce((acc, priority) => {
      acc[priority] = activeTodos.filter(t => t.priority === priority).length;
      return acc;
    }, {});

    const categoryBreakdown = categories.reduce((acc, category) => {
      acc[category] = activeTodos.filter(t => t.category === category).length;
      return acc;
    }, {});

    const overdueTasks = activeTodos.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Done').length;

    return {
      total: activeTodos.length,
      statusBreakdown,
      priorityBreakdown,
      categoryBreakdown,
      overdueTasks
    };
  };

  // Reports View Component - Memoized
  const ReportsView = React.memo(() => {
    const data = getReportData();
    
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Tasks</h3>
            <p className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{data.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Overdue</h3>
            <p className="text-2xl font-bold text-red-400">{data.overdueTasks}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">In Progress</h3>
            <p className="text-2xl font-bold text-yellow-400">{data.statusBreakdown['In Progress']}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Completion Rate</h3>
            <p className="text-2xl font-bold text-green-400">
              {data.total > 0 ? Math.round((data.statusBreakdown.Done / data.total) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-4">Status Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(data.statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-100">{status}</span>
                  <span className="text-purple-400 font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-4">Priority Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(data.priorityBreakdown).map(([priority, count]) => (
                <div key={priority} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Flag className={`w-4 h-4 ${getPriorityColor(priority)}`} />
                    <span className="text-gray-100">{priority}</span>
                  </div>
                  <span className="text-purple-400 font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-4">Category Breakdown</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map(category => {
                const count = data.categoryBreakdown[category] || 0;
                if (count === 0) return null;
                return (
                  <div key={category} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        category === 'Digital Marketing' ? 'bg-pink-500' :
                        category === 'SEO' ? 'bg-green-500' :
                        category === 'Business Intelligence' ? 'bg-blue-500' :
                        category === 'Analytics' ? 'bg-purple-500' :
                        category === 'Websites' ? 'bg-indigo-500' :
                        category === 'Admin' ? 'bg-red-500' :
                        category === 'Misc' ? 'bg-gray-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-gray-100">{category}</span>
                    </div>
                    <span className="text-purple-400 font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  });

  // Goal Card Component - Memoized
  const GoalCard = React.memo(({ 
    goal, 
    updateGoal, 
    deleteGoal, 
    addMilestone, 
    toggleMilestone,
    categories,
    goalTimeframes,
    getCategoryColor
  }) => {
    const [showMilestones, setShowMilestones] = useState(false);
    const [newMilestone, setNewMilestone] = useState('');
    const [editingGoal, setEditingGoal] = useState(false);
    const [editingTitle, setEditingTitle] = useState(goal.title);
    
    // Update local title when goal prop changes
    useEffect(() => {
      setEditingTitle(goal.title);
    }, [goal.title]);
    
    const handleTitleSave = () => {
      if (editingTitle.trim() && editingTitle !== goal.title) {
        updateGoal(goal.id, { title: editingTitle.trim() });
      }
      setEditingGoal(false);
    };
    
    const handleTitleCancel = () => {
      setEditingTitle(goal.title);
      setEditingGoal(false);
    };
    
    return (
      <div className={`bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all relative overflow-hidden ${goal.completed ? 'opacity-75' : ''}`}>
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
          goal.completed ? 'bg-green-400' :
          goal.progress >= 80 ? 'bg-purple-400' :
          goal.progress >= 60 ? 'bg-blue-400' :
          goal.progress >= 40 ? 'bg-yellow-400' :
          goal.progress >= 20 ? 'bg-orange-400' :
          'bg-gray-400'
        }`} />
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              {editingGoal ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTitleSave();
                    } else if (e.key === 'Escape') {
                      handleTitleCancel();
                    }
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-gray-100 focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              ) : (
                <h3 
                  className={`text-lg font-semibold text-gray-100 cursor-pointer hover:text-purple-300 transition-colors ${goal.completed ? 'line-through' : ''}`}
                  onClick={() => setEditingGoal(true)}
                >
                  {goal.title}
                </h3>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(goal.category)}`}>
                  <Tag className="w-3 h-3" />
                  {goal.category}
                </span>
                <span className="text-xs text-gray-400">{goal.timeframe}</span>
              </div>
            </div>
            {goal.completed && (
              <Trophy className="w-5 h-5 text-yellow-400" />
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{goal.progress}%</span>
            </div>
            <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 relative"
                style={{ width: `${goal.progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Milestones */}
          <div className="space-y-2">
            <button
              onClick={() => setShowMilestones(!showMilestones)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors"
            >
              <ChevronRight className={`w-4 h-4 transform transition-transform ${showMilestones ? 'rotate-90' : ''}`} />
              <span>Milestones ({goal.milestones?.filter(m => m.completed).length || 0}/{goal.milestones?.length || 0})</span>
            </button>
            
            {showMilestones && (
              <div className="ml-6 space-y-1">
                {goal.milestones?.map(milestone => (
                  <div key={milestone.id} className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => toggleMilestone(goal.id, milestone.id)}
                      className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all ${
                        milestone.completed 
                          ? 'bg-purple-600 border-purple-600' 
                          : 'border-gray-600 hover:border-purple-500'
                      }`}
                    >
                      {milestone.completed && <Check className="w-2.5 h-2.5 text-white" />}
                    </button>
                    <span className={`${milestone.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                      {milestone.title}
                    </span>
                  </div>
                ))}
                
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newMilestone.trim()) {
                        addMilestone(goal.id, newMilestone);
                        setNewMilestone('');
                      }
                    }}
                    placeholder="Add milestone..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                    spellCheck={false}
                  />
                  <button
                    onClick={() => {
                      if (newMilestone.trim()) {
                        addMilestone(goal.id, newMilestone);
                        setNewMilestone('');
                      }
                    }}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Goal Actions */}
          <div className="flex items-center gap-3 mt-4">
            <select
              value={goal.category}
              onChange={(e) => updateGoal(goal.id, { category: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-purple-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={goal.timeframe}
              onChange={(e) => updateGoal(goal.id, { timeframe: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-purple-500"
            >
              {goalTimeframes.map(timeframe => (
                <option key={timeframe} value={timeframe}>{timeframe}</option>
              ))}
            </select>
            
            <button
              onClick={() => deleteGoal(goal.id)}
              className="ml-auto text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  });

  // Goals View - Memoized to prevent re-renders
  const GoalsView = React.memo(({ 
    goals, 
    updateGoal, 
    deleteGoal, 
    onAddGoal, 
    savingGoal, 
    addMilestone, 
    toggleMilestone,
    categories,
    goalTimeframes,
    getCategoryColor
  }) => {
    const [newGoal, setNewGoal] = useState('');
    const activeGoals = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);
    
    // Calculate overall progress
    const overallProgress = goals.length > 0 
      ? Math.round(
          goals.reduce((sum, goal) => sum + (goal.completed ? 100 : goal.progress), 0) / goals.length
        )
      : 0;
    
    const handleAddGoal = async () => {
      if (newGoal.trim()) {
        const success = await onAddGoal(newGoal);
        if (success) {
          setNewGoal('');
        }
      }
    };
    
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Overall Progress */}
        {(activeGoals.length > 0 || completedGoals.length > 0) && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Overall Goals Progress
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  {overallProgress}%
                </span>
                {overallProgress === 100 && goals.length > 0 && (
                  <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
                )}
              </div>
            </div>
            <div className="bg-gray-700 rounded-full h-4 overflow-hidden mb-6">
              <div 
                className={`h-full rounded-full transition-all duration-500 relative ${
                  overallProgress === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  overallProgress >= 80 ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                  overallProgress >= 60 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                  overallProgress >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  overallProgress >= 20 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                  'bg-gradient-to-r from-gray-500 to-gray-600'
                }`}
                style={{ width: `${overallProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                <div className="charging-effect"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                <p className="text-gray-400 mb-1">Active Goals</p>
                <p className="text-2xl font-bold text-purple-400">{activeGoals.length}</p>
              </div>
              <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                <p className="text-gray-400 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-400">{completedGoals.length}</p>
              </div>
              <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                <p className="text-gray-400 mb-1">Total Milestones</p>
                <p className="text-2xl font-bold text-blue-400">
                  {goals.reduce((sum, goal) => sum + (goal.milestones?.length || 0), 0)}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                <p className="text-gray-400 mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Goal Input */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddGoal();
                }
              }}
              placeholder="Add a new goal..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500"
              disabled={savingGoal}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              onClick={handleAddGoal}
              disabled={savingGoal || !newGoal.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded transition-colors flex items-center gap-2"
            >
              {savingGoal ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Target className="w-5 h-5" />
              )}
              <span>Add Goal</span>
            </button>
          </div>
        </div>
        
        {/* Active Goals */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Active Goals ({activeGoals.length})
          </h2>
          {activeGoals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {activeGoals.map(goal => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal}
                  updateGoal={updateGoal}
                  deleteGoal={deleteGoal}
                  addMilestone={addMilestone}
                  toggleMilestone={toggleMilestone}
                  categories={categories}
                  goalTimeframes={goalTimeframes}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              No active goals. Set your first goal above!
            </p>
          )}
        </div>
        
        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Achieved Goals ({completedGoals.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {completedGoals.map(goal => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal}
                  updateGoal={updateGoal}
                  deleteGoal={deleteGoal}
                  addMilestone={addMilestone}
                  toggleMilestone={toggleMilestone}
                  categories={categories}
                  goalTimeframes={goalTimeframes}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  });

  const TaskCard = React.memo(({ todo, isListView = false, index = 0, totalCount = 0 }) => {
    const isExpanded = expandedTasks.has(todo.id);
    const isOverdue = new Date(todo.dueDate) < new Date() && todo.status !== 'Done';
    const daysUntilDue = Math.ceil((new Date(todo.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    const isToday = new Date(todo.dueDate).toDateString() === new Date().toDateString();
    const isTomorrow = daysUntilDue === 1;
    const hasLightning = lightningTasks.has(todo.id);
    
    if (isListView && !isExpanded) {
      return (
        <div 
          className={`bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/80 transition-all cursor-pointer group ${isOverdue ? 'border-red-500/30' : ''} relative overflow-hidden ${hasLightning ? 'lightning-strike' : ''}`}
          onClick={() => toggleTaskExpansion(todo.id)}
        >
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
            todo.priority === 'Critical' ? 'bg-red-400' :
            todo.priority === 'High' ? 'bg-purple-400' :
            todo.priority === 'Medium' ? 'bg-yellow-400' :
            'bg-green-400'
          }`} />
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {sortBy === 'manual' && !showArchived && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveTask(todo.id, 'up');
                    }}
                    disabled={index === 0}
                    className={`p-1 rounded transition-colors ${
                      index === 0 
                        ? 'text-gray-600 cursor-not-allowed' 
                        : 'text-gray-400 hover:text-purple-400 hover:bg-gray-700'
                    }`}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveTask(todo.id, 'down');
                    }}
                    disabled={index === totalCount - 1}
                    className={`p-1 rounded transition-colors ${
                      index === totalCount - 1 
                        ? 'text-gray-600 cursor-not-allowed' 
                        : 'text-gray-400 hover:text-purple-400 hover:bg-gray-700'
                    }`}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateTodo(todo.id, { status: todo.status === 'Done' ? 'To Do' : 'Done' });
                }}
                className={`flex-shrink-0 w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all ${
                  todo.status === 'Done'
                    ? 'bg-purple-600 border-purple-600' 
                    : 'border-gray-600 hover:border-purple-500'
                }`}
              >
                {todo.status === 'Done' && <Check className="w-2.5 h-2.5 text-white" />}
              </button>
              
              <div className="flex flex-col gap-1 min-w-0">
                <h4 className={`font-semibold text-lg text-gray-100 truncate ${todo.status === 'Done' ? 'line-through opacity-60' : ''}`}>
                  {todo.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getCategoryColor(todo.category)}`}>
                    {todo.category}
                  </span>
                  {todo.status === 'In Progress' && (
                    <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">
                      In Progress
                    </span>
                  )}
                  {todo.status === 'To Do' && (
                    <Flag className={`w-3 h-3 ${getPriorityColor(todo.priority)}`} />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {(todo.subtasks?.length > 0 || todo.comments?.length > 0) && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {todo.subtasks?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {todo.subtasks.filter(st => st.completed).length}/{todo.subtasks.length}
                    </span>
                  )}
                  {todo.comments?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {todo.comments.length}
                    </span>
                  )}
                </div>
              )}
              
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                isOverdue ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                isToday ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                isTomorrow ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                'bg-gray-700/50 text-gray-300 border border-gray-600'
              }`}>
                <Calendar className="w-3 h-3" />
                <span>
                  {isOverdue ? `Past due (${Math.abs(daysUntilDue)}d)` :
                   isToday ? 'Today' :
                   isTomorrow ? 'Tomorrow' :
                   new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              <ChevronRight className={`w-4 h-4 text-gray-400 transform transition-transform group-hover:text-purple-400 ${isExpanded ? 'rotate-90' : ''}`} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/80 transition-all ${isOverdue ? 'border-red-500/30' : ''} relative overflow-hidden ${hasLightning ? 'lightning-strike' : ''}`}>
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
          todo.priority === 'Critical' ? 'bg-red-400' :
          todo.priority === 'High' ? 'bg-purple-400' :
          todo.priority === 'Medium' ? 'bg-yellow-400' :
          'bg-green-400'
        }`} />
        
        {isListView && (
          <div 
            className="flex items-center justify-between gap-3 p-4 cursor-pointer hover:bg-gray-700/30 transition-colors border-b border-gray-700/30"
            onClick={() => toggleTaskExpansion(todo.id)}
          >
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateTodo(todo.id, { status: todo.status === 'Done' ? 'To Do' : 'Done' });
                }}
                className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all ${
                  todo.status === 'Done'
                    ? 'bg-purple-600 border-purple-600' 
                    : 'border-gray-600 hover:border-purple-500'
                }`}
              >
                {todo.status === 'Done' && <Check className="w-2.5 h-2.5 text-white" />}
              </button>
              
              <h4 className={`font-semibold text-lg text-gray-100 ${todo.status === 'Done' ? 'line-through opacity-60' : ''}`}>
                {todo.title}
              </h4>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                isOverdue ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                isToday ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                isTomorrow ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                'bg-gray-700/50 text-gray-300 border border-gray-600'
              }`}>
                <Calendar className="w-3 h-3" />
                {isOverdue ? `Past due (${Math.abs(daysUntilDue)}d)` :
                 isToday ? 'Today' :
                 isTomorrow ? 'Tomorrow' :
                 new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        )}
        
        <div className={`p-4 ${isListView ? 'pt-0' : ''}`}>
          <div className="mb-4">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(todo.category)}`}>
              <Tag className="w-3 h-3" />
              {todo.category}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <select
              value={todo.status}
              onChange={(e) => updateTodo(todo.id, { status: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-purple-500"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            
            <div className="flex items-center gap-1">
              <Flag className={`w-3 h-3 ${getPriorityColor(todo.priority)}`} />
              <select
                value={todo.priority}
                onChange={(e) => updateTodo(todo.id, { priority: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-purple-500"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            <select
              value={todo.category}
              onChange={(e) => updateTodo(todo.id, { category: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-purple-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <input
              type="date"
              value={todo.dueDate}
              onChange={(e) => updateTodo(todo.id, { dueDate: e.target.value })}
              className={`bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-purple-500`}
            />
          </div>

          {todo.subtasks?.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden relative">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 relative charging-bar"
                  style={{ width: `${(todo.subtasks.filter(st => st.completed).length / todo.subtasks.length) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  <div className="charging-effect"></div>
                </div>
              </div>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-purple-400" />
                {todo.subtasks.filter(st => st.completed).length}/{todo.subtasks.length}
              </span>
            </div>
          )}

          {(isExpanded || addingSubtaskTo === todo.id) && (
            <div className="mb-3">
              {(todo.subtasks?.length > 0 || addingSubtaskTo === todo.id) && (
                <>
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Subtasks</h5>
                  <div className="space-y-1">
                    {todo.subtasks?.map(subtask => (
                      <div key={subtask.id} className="flex items-center gap-2 text-sm group pl-1">
                        <button
                          onClick={() => toggleSubtask(todo.id, subtask.id)}
                          className={`flex-shrink-0 w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all ${
                            subtask.completed 
                              ? 'bg-purple-600 border-purple-600' 
                              : 'border-gray-600 hover:border-purple-500'
                          }`}
                        >
                          {subtask.completed && <Check className="w-2.5 h-2.5 text-white" />}
                        </button>
                        {editingSubtask === subtask.id ? (
                          <input
                            type="text"
                            value={subtask.title}
                            onChange={(e) => updateSubtask(todo.id, subtask.id, e.target.value)}
                            onBlur={() => setEditingSubtask(null)}
                            onKeyPress={(e) => e.key === 'Enter' && setEditingSubtask(null)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-100 focus:outline-none focus:border-purple-500"
                            autoFocus
                          />
                        ) : (
                          <span 
                            className={`flex-1 cursor-pointer ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}
                            onClick={() => setEditingSubtask(subtask.id)}
                          >
                            {subtask.title}
                          </span>
                        )}
                        <button
                          onClick={() => deleteSubtask(todo.id, subtask.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {addingSubtaskTo === todo.id ? (
                      <div className="flex items-center gap-2 text-sm mt-2 pl-1">
                        <div className="w-3.5 h-3.5"></div>
                        <input
                          type="text"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              e.stopPropagation();
                              if (newSubtask.trim()) {
                                addSubtask(todo.id);
                              }
                            } else if (e.key === 'Escape') {
                              setNewSubtask('');
                              setAddingSubtaskTo(null);
                            }
                          }}
                          placeholder="Add subtask..."
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-100 focus:outline-none focus:border-purple-500"
                          autoFocus
                          autoComplete="off"
                          spellCheck={false}
                        />
                        <button
                          onClick={() => {
                            if (newSubtask.trim()) {
                              addSubtask(todo.id);
                            }
                          }}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setNewSubtask('');
                            setAddingSubtaskTo(null);
                          }}
                          className="text-gray-400 hover:text-gray-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : todo.subtasks?.length > 0 && (
                      <button
                        onClick={() => setAddingSubtaskTo(todo.id)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors mt-2 pl-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add subtask
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {(!isExpanded || (todo.subtasks?.length === 0 && addingSubtaskTo !== todo.id)) && addingSubtaskTo !== todo.id && (
            <button
              onClick={() => {
                setAddingSubtaskTo(todo.id);
                if (!isExpanded) {
                  setExpandedTasks(new Set([...expandedTasks, todo.id]));
                }
              }}
              className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors mb-3 w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>Add subtask</span>
            </button>
          )}

          {todo.comments?.length > 0 && isExpanded && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-400 mb-2">Comments</h5>
              <div className="space-y-2">
                {todo.comments.map(comment => (
                  <div key={comment.id} className="text-sm bg-gray-700/50 rounded p-2">
                    <p className="text-gray-100">{comment.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{comment.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {commentingTask === todo.id ? (
            <div className="mb-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addComment(todo.id)}
                onBlur={() => setCommentingTask(null)}
                placeholder="Add a comment..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setCommentingTask(todo.id)}
              className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors mb-3 w-fit"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{todo.comments?.length > 0 ? `${todo.comments.length} comments` : 'Add comment'}</span>
            </button>
          )}

          <div className="flex gap-3 text-sm">
            <button
              onClick={() => updateTodo(todo.id, { archived: !todo.archived })}
              className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors"
            >
              <Archive className="w-4 h-4" />
              <span>{todo.archived ? 'Restore' : 'Archive'}</span>
            </button>
            
            <button
              onClick={() => deleteTodo(todo.id)}
              className="flex items-center gap-1 bg-gray-700 hover:bg-red-600 text-gray-300 px-3 py-1.5 rounded transition-colors ml-auto"
            >
              <X className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  });

  const ListView = () => {
    // Sort displayTodos by order when in manual sort mode
    const sortedTodos = sortBy === 'manual' 
      ? [...displayTodos].sort((a, b) => (a.order || 0) - (b.order || 0))
      : displayTodos;
      
    return (
      <div className="space-y-3 max-w-4xl mx-auto">
        {sortedTodos.map((todo, index) => (
          <TaskCard key={todo.id} todo={todo} isListView={true} index={index} totalCount={sortedTodos.length} />
        ))}
      </div>
    );
  };

  if (loading || showStormLoader) {
    return (
      <>
        {/* Storm Loader */}
        {showStormLoader && <StormLoader />}
        
        {/* Fallback Loader */}
        {!showStormLoader && loading && (
          <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading your tasks...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-100 p-4 md:p-6 lg:p-8">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className="animate-slide-in-right">
            {toast.action ? (
              <div className={`bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] border border-gray-700`}>
                <AlertCircle className="w-5 h-5 text-purple-400" />
                <span className="flex-1 font-medium">{toast.message}</span>
                <button
                  onClick={toast.action.onClick}
                  className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  {toast.action.label}
                </button>
                <button onClick={() => removeToast(toast.id)} className="hover:opacity-80 transition-opacity ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg shadow-lg transform transition-all group-hover:scale-110 group-hover:shadow-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent transition-all group-hover:from-indigo-400 group-hover:to-purple-400">
                  TaskHub
                </span>
              </h1>
              <span className="text-sm text-gray-400">(Memory Mode)</span>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              {/* View Toggle */}
              <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                <button
                  onClick={() => {
                    setCurrentView('tasks');
                    setShowReports(false);
                  }}
                  className={`px-3 py-1.5 rounded text-sm transition-all ${
                    currentView === 'tasks' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => {
                    setCurrentView('goals');
                    setShowReports(false);
                  }}
                  className={`px-3 py-1.5 rounded text-sm transition-all ${
                    currentView === 'goals' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Goals
                </button>
              </div>
              
              {currentView === 'tasks' && !showReports && (
                <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-700 text-sm">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-gray-100 text-sm focus:outline-none cursor-pointer"
                    title="Sort tasks by"
                  >
                    <option value="smart" className="bg-gray-800">Smart Sort</option>
                    <option value="manual" className="bg-gray-800">Manual Sort</option>
                    <option value="priority" className="bg-gray-800">Priority</option>
                    <option value="dueDate" className="bg-gray-800">Due Date</option>
                    <option value="status" className="bg-gray-800">Status</option>
                  </select>
                </div>
              )}

              {currentView === 'tasks' && (
                <button
                  onClick={() => setShowReports(!showReports)}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-all text-sm ${
                    showReports ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                  title="Reports"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Reports</span>
                </button>
              )}

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 rounded transition-all text-sm bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
                title="Export to CSV"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>

              {currentView === 'tasks' && (
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-all text-sm ${
                    showArchived ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                  title={showArchived ? 'Show Active' : 'Show Archived'}
                >
                  <Archive className="w-4 h-4" />
                  <span>{showArchived ? 'Active' : 'Archived'}</span>
                </button>
              )}
            </div>
          </div>

          {currentView === 'tasks' && !showReports && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 max-w-2xl mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      e.stopPropagation();
                      if (newTodo.trim()) {
                        addTodo();
                      }
                    }
                  }}
                  placeholder="Add a new task..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  disabled={savingTask}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  onClick={() => {
                    if (newTodo.trim()) {
                      addTodo();
                    }
                  }}
                  disabled={savingTask || !newTodo.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded transition-colors flex items-center gap-2"
                >
                  {savingTask ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span>Add Task</span>
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <kbd className="px-2 py-1 bg-gray-700 rounded">N</kbd> or <kbd className="px-2 py-1 bg-gray-700 rounded">Ctrl+N</kbd> to add new task
              </div>
            </div>
          )}
        </header>

        <main>
          {currentView === 'tasks' ? (
            showReports ? (
              <ReportsView />
            ) : (
              <>
                <ListView />
                {!loading && displayTodos.length === 0 && (
                  <div className="text-center py-12 max-w-md mx-auto">
                    <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
                      <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Zap className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-100 mb-2">
                        {showArchived ? 'No archived tasks' : 'Welcome to TaskHub!'}
                      </h3>
                      <p className="text-gray-400 mb-4">
                        {showArchived 
                          ? 'Your archived tasks will appear here' 
                          : 'Start organizing your work by creating your first task above'}
                      </p>
                      {!showArchived && (
                        <button
                          onClick={() => document.querySelector('input[placeholder="Add a new task..."]')?.focus()}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
                        >
                          Create First Task
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )
          ) : (
            <GoalsView 
              goals={goals}
              updateGoal={updateGoal}
              deleteGoal={deleteGoal}
              onAddGoal={onAddGoal}
              savingGoal={savingGoal}
              addMilestone={addMilestone}
              toggleMilestone={toggleMilestone}
              categories={categories}
              goalTimeframes={goalTimeframes}
              getCategoryColor={getCategoryColor}
            />
          )}
        </main>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        
        /* Lightning Strike Animation */
        @keyframes lightning-flash {
          0%, 100% { opacity: 0; }
          10%, 20% { opacity: 1; }
          15% { opacity: 0.5; }
        }
        
        .lightning-strike {
          animation: lightning-flash 1s ease-out;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.4);
        }
        
        /* Storm Background */
        .storm-bg {
          background: 
            linear-gradient(to bottom, rgba(16, 16, 30, 0.9) 0%, transparent 50%, rgba(10, 10, 10, 0.9) 100%),
            radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0a 100%);
          position: relative;
        }
        
        /* Storm Clouds Effect */
        .storm-clouds {
          background-image: 
            radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at bottom left, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(99, 102, 241, 0.05) 0%, transparent 50%);
          animation: storm-clouds-move 20s ease-in-out infinite;
        }
        
        @keyframes storm-clouds-move {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-20px, 10px) scale(1.1); }
          50% { transform: translate(20px, -10px) scale(0.95); }
          75% { transform: translate(-10px, -20px) scale(1.05); }
        }
        
        /* Background Lightning Bolts */
        .lightning-bg {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          background: linear-gradient(to bottom, transparent 0%, rgba(139, 92, 246, 0.4) 50%, transparent 100%);
          filter: blur(2px);
        }
        
        .lightning-bg-1 {
          left: 10%;
          width: 2px;
          animation: lightning-flash-bg 4s ease-in-out infinite;
        }
        
        .lightning-bg-2 {
          left: 30%;
          width: 3px;
          animation: lightning-flash-bg 4s ease-in-out infinite 0.5s;
          transform: rotate(5deg);
        }
        
        .lightning-bg-3 {
          right: 20%;
          width: 2px;
          animation: lightning-flash-bg 4s ease-in-out infinite 1s;
          transform: rotate(-5deg);
        }
        
        .lightning-bg-4 {
          left: 60%;
          width: 4px;
          animation: lightning-flash-bg 4s ease-in-out infinite 1.5s;
          transform: rotate(10deg);
        }
        
        .lightning-bg-5 {
          right: 40%;
          width: 2px;
          animation: lightning-flash-bg 4s ease-in-out infinite 2s;
          transform: rotate(-10deg);
        }
        
        @keyframes lightning-flash-bg {
          0%, 90%, 100% {
            opacity: 0;
            transform: translateY(-100vh) scaleY(0.5);
          }
          92% {
            opacity: 0.3;
            transform: translateY(0) scaleY(1);
          }
          94% {
            opacity: 0.6;
            transform: translateY(50vh) scaleY(1.2);
          }
          95% {
            opacity: 0.2;
            transform: translateY(50vh) scaleY(1.2);
          }
          96% {
            opacity: 0.8;
            transform: translateY(100vh) scaleY(1.5);
          }
          98% {
            opacity: 0;
            transform: translateY(100vh) scaleY(1.5);
          }
        }
        
        /* Lightning Bolts for Loader */
        .lightning-container {
          position: absolute;
          inset: -50px;
          pointer-events: none;
        }
        
        .lightning {
          position: absolute;
          width: 2px;
          height: 100px;
          background: linear-gradient(to bottom, transparent, #8b5cf6, transparent);
          opacity: 0;
          filter: blur(1px);
          box-shadow: 0 0 10px #8b5cf6, 0 0 20px #8b5cf6;
        }
        
        .lightning::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, transparent, white, transparent);
          opacity: 0.5;
        }
        
        /* Zigzag lightning effect */
        .lightning::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 30%;
          width: 20px;
          height: 20px;
          background: #8b5cf6;
          opacity: 0.8;
          transform: rotate(45deg);
          box-shadow: 
            10px 10px 0 #8b5cf6,
            20px 20px 0 #8b5cf6;
          filter: blur(2px);
        }
        
        .lightning-1 {
          left: 20%;
          animation: lightning-strike-loader 3s ease-in-out infinite;
        }
        
        .lightning-2 {
          left: 50%;
          animation: lightning-strike-loader 3s ease-in-out infinite 1s;
        }
        
        .lightning-3 {
          right: 20%;
          animation: lightning-strike-loader 3s ease-in-out infinite 2s;
        }
        
        @keyframes lightning-strike-loader {
          0%, 90%, 100% {
            opacity: 0;
            transform: translateY(-100px) scaleY(1);
          }
          95% {
            opacity: 1;
            transform: translateY(0) scaleY(1.5);
          }
        }
        
        /* Flash effect during lightning */
        .storm-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
          opacity: 0;
          animation: lightning-flash-screen 3s ease-in-out infinite;
          pointer-events: none;
          z-index: 10;
        }
        
        .storm-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: white;
          opacity: 0;
          animation: white-flash 3s ease-in-out infinite;
          pointer-events: none;
          z-index: 9;
        }
        
        @keyframes lightning-flash-screen {
          0%, 90%, 100% { opacity: 0; }
          95% { opacity: 1; }
        }
        
        @keyframes white-flash {
          0%, 94.5%, 96%, 100% { opacity: 0; }
          95% { opacity: 0.1; }
        }
        
        /* Rain Effect */
        .rain-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 5;
        }
        
        .rain {
          position: absolute;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.1) 75%, rgba(255, 255, 255, 0.2) 100%);
          background-size: 2px 100px;
          background-repeat: repeat;
          animation: rain-fall 0.5s linear infinite;
          opacity: 0.3;
        }
        
        .rain::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.1) 75%, rgba(255, 255, 255, 0.2) 100%);
          background-size: 2px 100px;
          background-repeat: repeat;
          animation: rain-fall 0.7s linear infinite;
          left: 50%;
          opacity: 0.2;
        }
        
        @keyframes rain-fall {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 100px;
          }
        }
        
        /* Storm icon glow */
        .storm-icon {
          animation: icon-storm-glow 3s ease-in-out infinite;
        }
        
        @keyframes icon-storm-glow {
          0%, 94%, 100% { 
            box-shadow: 
              0 0 20px rgba(139, 92, 246, 0.5),
              0 0 40px rgba(139, 92, 246, 0.3),
              0 0 60px rgba(139, 92, 246, 0.1);
          }
          95% { 
            box-shadow: 
              0 0 40px rgba(139, 92, 246, 1),
              0 0 80px rgba(139, 92, 246, 0.8),
              0 0 120px rgba(139, 92, 246, 0.6),
              0 0 160px rgba(139, 92, 246, 0.4);
          }
        }
        
        /* Random lightning flashes */
        .random-flash {
          position: absolute;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%);
          opacity: 0;
          filter: blur(20px);
          pointer-events: none;
        }
        
        .random-flash-1 {
          top: 20%;
          left: 15%;
          animation: random-lightning 5s ease-in-out infinite 1.5s;
        }
        
        .random-flash-2 {
          bottom: 30%;
          right: 20%;
          animation: random-lightning 5s ease-in-out infinite 3s;
        }
        
        .random-flash-3 {
          top: 50%;
          right: 40%;
          animation: random-lightning 5s ease-in-out infinite 4.2s;
        }
        
        @keyframes random-lightning {
          0%, 95%, 100% { opacity: 0; transform: scale(0.5); }
          96% { opacity: 0.6; transform: scale(1); }
          97% { opacity: 0; transform: scale(1.2); }
          98% { opacity: 0.4; transform: scale(0.8); }
        }
        
        /* Thunder rumble effect */
        .storm-loader-container {
          animation: thunder-rumble 3s ease-in-out infinite;
        }
        
        @keyframes thunder-rumble {
          0%, 94%, 98%, 100% { transform: translate(0, 0); }
          95% { transform: translate(-1px, 1px); }
          96% { transform: translate(1px, -1px); }
          97% { transform: translate(-1px, 0); }
        }
        
        /* Loading Progress Animation */
        .lightning-progress {
          transform-origin: left;
          animation: progress-fill-scale 4.5s ease-out forwards, progress-glow 1s ease-in-out infinite alternate;
          box-shadow: 
            0 0 10px rgba(139, 92, 246, 0.5),
            0 0 20px rgba(139, 92, 246, 0.3);
        }
        
        @keyframes progress-fill-scale {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        
        @keyframes progress-glow {
          0% { 
            box-shadow: 
              0 0 10px rgba(139, 92, 246, 0.5),
              0 0 20px rgba(139, 92, 246, 0.3);
          }
          100% { 
            box-shadow: 
              0 0 20px rgba(139, 92, 246, 0.8),
              0 0 30px rgba(139, 92, 246, 0.6),
              0 0 40px rgba(139, 92, 246, 0.4);
          }
        }
        
        /* Charging Progress Bar */
        .charging-bar {
          position: relative;
          overflow: hidden;
        }
        
        .charging-effect {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: charge 2s linear infinite;
        }
        
        @keyframes charge {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default TodoApp;