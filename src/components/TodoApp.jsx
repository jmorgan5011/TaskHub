// components/TodoApp.js
// Local Storage version - No Firebase required

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Flag, Grid3X3, List, Edit3, MessageSquare, Archive, Check, ChevronRight, ChevronDown, Menu, Tag, BarChart3, Filter, X, CheckSquare, Loader2 } from 'lucide-react';

// Main TodoApp Component
const TodoApp = () => {
  const [currentView, setCurrentView] = useState('list');
  const [showArchived, setShowArchived] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [sortBy, setSortBy] = useState('smart');
  const [editingTask, setEditingTask] = useState(null);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [editingDescription, setEditingDescription] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [addingSubtaskTo, setAddingSubtaskTo] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentingTask, setCommentingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  const categories = ['Digital Marketing', 'SEO', 'Business Intelligence', 'Analytics', 'Websites', 'Admin', 'Misc'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  // Load todos from localStorage on mount
  useEffect(() => {
    const loadTodos = () => {
      try {
        const savedTodos = localStorage.getItem('taskhub_todos');
        if (savedTodos) {
          setTodos(JSON.parse(savedTodos));
        }
      } catch (error) {
        console.error('Error loading todos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('taskhub_todos', JSON.stringify(todos));
    }
  }, [todos, loading]);

  // Add todo
  const addTodo = async () => {
    if (newTodo.trim()) {
      setSaving(true);
      
      const newTask = {
        id: Date.now().toString(),
        title: newTodo,
        status: 'To Do',
        priority: 'Medium',
        category: 'Digital Marketing',
        dueDate: new Date().toISOString().split('T')[0],
        description: '',
        archived: false,
        subtasks: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTodos(prevTodos => [newTask, ...prevTodos]);
      setNewTodo('');
      
      // Simulate save delay
      setTimeout(() => setSaving(false), 300);
    }
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
  };

  // Delete todo
  const deleteTodo = (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    }
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

  // Style helper functions
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-red-300';
      case 'High': return 'text-orange-300';
      case 'Medium': return 'text-yellow-300';
      case 'Low': return 'text-green-300';
      default: return 'text-gray-300';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Digital Marketing': 'bg-pink-400/20 text-pink-200 border-pink-400/30',
      'SEO': 'bg-green-400/20 text-green-200 border-green-400/30',
      'Business Intelligence': 'bg-blue-400/20 text-blue-200 border-blue-400/30',
      'Analytics': 'bg-purple-400/20 text-purple-200 border-purple-400/30',
      'Websites': 'bg-orange-400/20 text-orange-200 border-orange-400/30',
      'Admin': 'bg-red-400/20 text-red-200 border-red-400/30',
      'Misc': 'bg-gray-400/20 text-gray-200 border-gray-400/30'
    };
    return colors[category] || 'bg-gray-400/20 text-gray-200 border-gray-400/30';
  };

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

  // View Components
  const ReportsView = () => {
    const data = getReportData();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Tasks</h3>
            <p className="text-2xl font-bold text-orange-400">{data.total}</p>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Overdue</h3>
            <p className="text-2xl font-bold text-red-400">{data.overdueTasks}</p>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">In Progress</h3>
            <p className="text-2xl font-bold text-yellow-400">{data.statusBreakdown['In Progress']}</p>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Completion Rate</h3>
            <p className="text-2xl font-bold text-green-400">
              {data.total > 0 ? Math.round((data.statusBreakdown.Done / data.total) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-orange-400 mb-4">Status Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(data.statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-300">{status}</span>
                  <span className="text-orange-300 font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-orange-400 mb-4">Priority Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(data.priorityBreakdown).map(([priority, count]) => (
                <div key={priority} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Flag className={`w-4 h-4 ${getPriorityColor(priority)}`} />
                    <span className="text-gray-300">{priority}</span>
                  </div>
                  <span className="text-orange-300 font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-orange-400 mb-4">Category Breakdown</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map(category => {
                const count = data.categoryBreakdown[category] || 0;
                if (count === 0) return null;
                return (
                  <div key={category} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        category === 'Digital Marketing' ? 'bg-pink-400' :
                        category === 'SEO' ? 'bg-green-400' :
                        category === 'Business Intelligence' ? 'bg-blue-400' :
                        category === 'Analytics' ? 'bg-purple-400' :
                        category === 'Websites' ? 'bg-orange-400' :
                        category === 'Admin' ? 'bg-red-400' :
                        category === 'Misc' ? 'bg-gray-400' :
                        'bg-gray-400'
                      }`}></div>
                      <span className="text-gray-300">{category}</span>
                    </div>
                    <span className="text-orange-300 font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TaskCard = ({ todo, isListView = false }) => {
    const isExpanded = expandedTasks.has(todo.id);
    const isOverdue = new Date(todo.dueDate) < new Date() && todo.status !== 'Done';
    const daysUntilDue = Math.ceil((new Date(todo.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    const isToday = new Date(todo.dueDate).toDateString() === new Date().toDateString();
    const isTomorrow = daysUntilDue === 1;
    
    if (isListView && !isExpanded) {
      return (
        <div 
          className={`bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 md:p-4 landscape:p-2 landscape:md:p-3 border border-gray-700 hover:border-orange-500/50 hover:bg-gray-800/80 transition-all cursor-pointer group ${isOverdue ? 'border-red-500/30' : ''} relative overflow-hidden`}
          onClick={() => toggleTaskExpansion(todo.id)}
        >
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
            todo.priority === 'Critical' ? 'bg-red-400' :
            todo.priority === 'High' ? 'bg-orange-400' :
            todo.priority === 'Medium' ? 'bg-yellow-400' :
            'bg-green-400'
          }`} />
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateTodo(todo.id, { status: todo.status === 'Done' ? 'To Do' : 'Done' });
                }}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  todo.status === 'Done'
                    ? 'bg-orange-500 border-orange-500' 
                    : 'border-gray-600 hover:border-orange-500'
                }`}
              >
                {todo.status === 'Done' && <Check className="w-4 h-4 text-white" />}
              </button>
              
              <div className="flex flex-col gap-1 min-w-0">
                <h4 className={`font-semibold text-lg text-orange-300 truncate ${todo.status === 'Done' ? 'line-through opacity-60' : ''}`}>
                  {todo.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs ${getCategoryColor(todo.category)}`}>
                    {todo.category}
                  </span>
                  {todo.status === 'In Progress' && (
                    <span className="bg-yellow-500/20 text-yellow-200 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">
                      In Progress
                    </span>
                  )}
                  {todo.status === 'To Do' && (
                    <Flag className={`w-3 h-3 ${getPriorityColor(todo.priority)}`} />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
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
                isOverdue ? 'bg-red-500/20 text-red-200 border border-red-500/30' :
                isToday ? 'bg-orange-500/20 text-orange-200 border border-orange-500/30' :
                isTomorrow ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30' :
                'bg-gray-700/50 text-gray-300 border border-gray-600'
              }`}>
                <Calendar className="w-3 h-3" />
                <span className="hidden sm:inline">
                  {isOverdue ? `${Math.abs(daysUntilDue)}d overdue` :
                   isToday ? 'Today' :
                   isTomorrow ? 'Tomorrow' :
                   new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="sm:hidden">
                  {isOverdue ? `-${Math.abs(daysUntilDue)}d` :
                   isToday ? 'Today' :
                   isTomorrow ? 'Tmrw' :
                   new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                </span>
              </div>
              
              <ChevronRight className={`w-4 h-4 text-gray-400 transform transition-transform group-hover:text-orange-400 ${isExpanded ? 'rotate-90' : ''}`} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-orange-500/50 hover:bg-gray-800/80 transition-all ${isOverdue ? 'border-red-500/30' : ''} relative overflow-hidden`}>
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
          todo.priority === 'Critical' ? 'bg-red-400' :
          todo.priority === 'High' ? 'bg-orange-400' :
          todo.priority === 'Medium' ? 'bg-yellow-400' :
          'bg-green-400'
        }`} />
        
        {isListView && (
          <div 
            className="flex items-center justify-between gap-3 p-3 md:p-4 landscape:p-2 landscape:md:p-3 cursor-pointer hover:bg-gray-700/30 transition-colors border-b border-gray-700/30"
            onClick={() => toggleTaskExpansion(todo.id)}
          >
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateTodo(todo.id, { status: todo.status === 'Done' ? 'To Do' : 'Done' });
                }}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  todo.status === 'Done'
                    ? 'bg-orange-500 border-orange-500' 
                    : 'border-gray-600 hover:border-orange-500'
                }`}
              >
                {todo.status === 'Done' && <Check className="w-4 h-4 text-white" />}
              </button>
              
              <h4 className={`font-semibold text-lg text-orange-300 ${todo.status === 'Done' ? 'line-through opacity-60' : ''}`}>
                {todo.title}
              </h4>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                isOverdue ? 'bg-red-500/20 text-red-200 border border-red-500/30' :
                isToday ? 'bg-orange-500/20 text-orange-200 border border-orange-500/30' :
                isTomorrow ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30' :
                'bg-gray-700/50 text-gray-300 border border-gray-600'
              }`}>
                <Calendar className="w-3 h-3" />
                {isOverdue ? `${Math.abs(daysUntilDue)}d overdue` :
                 isToday ? 'Today' :
                 isTomorrow ? 'Tomorrow' :
                 new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        )}
        
        <div className={`p-3 md:p-4 landscape:p-2 landscape:md:p-3 ${isListView ? 'pt-0' : ''}`}>
          {!isListView && (
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                {editingTask === todo.id ? (
                  <input
                    type="text"
                    value={todo.title}
                    onChange={(e) => updateTodo(todo.id, { title: e.target.value })}
                    onBlur={() => setEditingTask(null)}
                    onKeyPress={(e) => e.key === 'Enter' && setEditingTask(null)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-orange-300 text-lg font-semibold focus:outline-none focus:border-orange-500"
                    autoFocus
                  />
                ) : (
                  <h4 
                    className="font-semibold text-lg text-orange-300 leading-tight cursor-pointer"
                    onClick={() => setEditingTask(todo.id)}
                  >
                    {todo.title}
                  </h4>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-2">
                {((todo.subtasks?.length > 0) || (todo.comments?.length > 0)) && (
                  <button
                    onClick={() => toggleTaskExpansion(todo.id)}
                    className="text-gray-400 hover:text-orange-400 transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => setEditingTask(todo.id)}
                  className="text-gray-400 hover:text-orange-400 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {!isListView && (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium mb-3 ${
              isOverdue ? 'bg-red-500/20 text-red-200 border border-red-500/30' :
              isToday ? 'bg-orange-500/20 text-orange-200 border border-orange-500/30' :
              isTomorrow ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30' :
              'bg-gray-700/50 text-gray-300 border border-gray-600'
            }`}>
              <Calendar className="w-3 h-3" />
              {isOverdue ? `Overdue by ${Math.abs(daysUntilDue)} days` :
               isToday ? 'Due today' :
               isTomorrow ? 'Due tomorrow' :
               new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}

          {editingDescription === todo.id ? (
            <textarea
              value={todo.description}
              onChange={(e) => updateTodo(todo.id, { description: e.target.value })}
              onBlur={() => setEditingDescription(null)}
              onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && setEditingDescription(null)}
              placeholder="Add a description..."
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-orange-500 text-sm resize-none mb-4"
              rows="2"
              autoFocus
            />
          ) : (
            <p 
              className={`text-sm ${todo.description ? 'text-gray-500' : 'text-gray-600 italic'} mb-4 cursor-pointer hover:text-gray-400 transition-colors leading-relaxed`}
              onClick={() => setEditingDescription(todo.id)}
            >
              {todo.description || 'Click to add description...'}
            </p>
          )}

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
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
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
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            <select
              value={todo.category}
              onChange={(e) => updateTodo(todo.id, { category: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <input
              type="date"
              value={todo.dueDate}
              onChange={(e) => updateTodo(todo.id, { dueDate: e.target.value })}
              className={`bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500`}
            />
          </div>

          {todo.subtasks?.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(todo.subtasks.filter(st => st.completed).length / todo.subtasks.length) * 100}%` }}
                />
              </div>
              <span>{todo.subtasks.filter(st => st.completed).length}/{todo.subtasks.length}</span>
            </div>
          )}

          {(isExpanded || addingSubtaskTo === todo.id) && (
            <div className="mb-3">
              {(todo.subtasks?.length > 0 || addingSubtaskTo === todo.id) && (
                <>
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Subtasks</h5>
                  <div className="space-y-1">
                    {todo.subtasks?.map(subtask => (
                      <div key={subtask.id} className="flex items-center gap-2 text-sm group">
                        <button
                          onClick={() => toggleSubtask(todo.id, subtask.id)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            subtask.completed 
                              ? 'bg-orange-500 border-orange-500' 
                              : 'border-gray-600 hover:border-orange-500'
                          }`}
                        >
                          {subtask.completed && <Check className="w-3 h-3 text-white" />}
                        </button>
                        {editingSubtask === subtask.id ? (
                          <input
                            type="text"
                            value={subtask.title}
                            onChange={(e) => updateSubtask(todo.id, subtask.id, e.target.value)}
                            onBlur={() => setEditingSubtask(null)}
                            onKeyPress={(e) => e.key === 'Enter' && setEditingSubtask(null)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-1 text-gray-300 focus:outline-none focus:border-orange-500"
                            autoFocus
                          />
                        ) : (
                          <span 
                            className={`flex-1 cursor-pointer ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}
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
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <div className="w-4 h-4"></div>
                        <input
                          type="text"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSubtask(todo.id);
                            }
                          }}
                          placeholder="Add subtask..."
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-1 text-gray-300 focus:outline-none focus:border-orange-500"
                          autoFocus
                        />
                        <button
                          onClick={() => addSubtask(todo.id)}
                          className="text-orange-400 hover:text-orange-300"
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
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition-colors mt-2"
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
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition-colors mb-3"
            >
              <Plus className="w-4 h-4" />
              Add subtask
            </button>
          )}

          {todo.comments?.length > 0 && isExpanded && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-400 mb-2">Comments</h5>
              <div className="space-y-2">
                {todo.comments.map(comment => (
                  <div key={comment.id} className="text-sm bg-gray-700/50 rounded p-2">
                    <p className="text-gray-300">{comment.text}</p>
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
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-orange-500"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setCommentingTask(todo.id)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition-colors mb-3"
            >
              <MessageSquare className="w-4 h-4" />
              {todo.comments?.length > 0 ? `${todo.comments.length} comments` : 'Add comment'}
            </button>
          )}

          <div className="flex gap-3 text-sm">
            <button
              onClick={() => setCommentingTask(todo.id)}
              className="flex items-center gap-1 text-gray-400 hover:text-orange-400 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              {todo.comments?.length > 0 ? `${todo.comments.length}` : 'Comment'}
            </button>
            
            <button
              onClick={() => updateTodo(todo.id, { archived: !todo.archived })}
              className="flex items-center gap-1 text-gray-400 hover:text-orange-400 transition-colors"
            >
              <Archive className="w-4 h-4" />
              {todo.archived ? 'Restore' : 'Archive'}
            </button>
            
            <button
              onClick={() => deleteTodo(todo.id)}
              className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors ml-auto"
            >
              <X className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const BoardView = () => {
    const columns = ['To Do', 'In Progress', 'Done'];
    
    return (
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full overflow-x-auto pb-4">
        {columns.map(column => (
          <div key={column} className="flex-shrink-0 w-full lg:w-80">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 min-h-[300px] border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-400">{column}</h3>
                <span className="bg-gray-800/60 text-orange-300 px-2 py-1 rounded text-sm border border-gray-700">
                  {displayTodos.filter(todo => todo.status === column).length}
                </span>
              </div>
              
              <div className="space-y-3">
                {displayTodos.filter(todo => todo.status === column).map(todo => (
                  <TaskCard key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ListView = () => (
    <div className="space-y-2">
      {displayTodos.map((todo) => (
        <TaskCard key={todo.id} todo={todo} isListView={true} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-3 md:p-6 landscape:p-2 landscape:md:p-4 landscape:lg:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 landscape:mb-4">
          <div className="flex items-center justify-between mb-6 landscape:mb-3 gap-2">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 p-2 rounded-lg shadow-lg transform transition-all group-hover:scale-110 group-hover:shadow-xl">
                  <CheckSquare className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold">
                <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent transition-all group-hover:from-orange-300 group-hover:to-orange-500">
                  TaskHub
                </span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">(Local Storage Mode)</span>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-400 hover:text-orange-400 transition-colors p-2"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            
            <div className="hidden md:flex items-center gap-2 lg:gap-4 flex-wrap">
              {!showReports && (
                <div className="flex items-center gap-1 lg:gap-2 bg-gray-800/60 px-2 lg:px-3 py-1.5 lg:py-2 rounded border border-gray-700 text-sm">
                  <Filter className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-gray-300 text-xs lg:text-sm focus:outline-none"
                    title="Sort tasks by"
                  >
                    <option value="smart">Smart Sort</option>
                    <option value="priority">Priority</option>
                    <option value="dueDate">Due Date</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              )}

              <button
                onClick={() => setShowReports(!showReports)}
                className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded transition-all text-sm ${
                  showReports ? 'bg-orange-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-white'
                }`}
                title="Reports"
              >
                <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden lg:inline">Reports</span>
              </button>

              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded transition-all text-sm ${
                  showArchived ? 'bg-orange-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-white'
                }`}
                title={showArchived ? 'Show Active' : 'Show Archived'}
              >
                <Archive className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden lg:inline">{showArchived ? 'Active' : 'Archived'}</span>
              </button>

              {!showReports && (
                <div className="flex bg-gray-800/60 backdrop-blur-sm rounded-lg p-1 border border-gray-700/50">
                  <button
                    onClick={() => setCurrentView('list')}
                    className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded transition-all text-sm ${
                      currentView === 'list' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    title="List View"
                  >
                    <List className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden lg:inline">List</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('board')}
                    className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded transition-all text-sm ${
                      currentView === 'board' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    title="Board View"
                  >
                    <Grid3X3 className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden lg:inline">Board</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mb-4 landscape:mb-2 bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 landscape:p-2 border border-gray-700/50">
              <div className="space-y-2">
                {!showReports && (
                  <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); setMobileMenuOpen(false); }}
                      className="flex-1 bg-transparent text-gray-300 text-sm focus:outline-none"
                    >
                      <option value="smart">Smart Sort</option>
                      <option value="priority">Priority</option>
                      <option value="dueDate">Due Date</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                )}

                <button
                  onClick={() => { setShowReports(!showReports); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-all ${
                    showReports ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Reports
                </button>

                <button
                  onClick={() => { setShowArchived(!showArchived); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-all ${
                    showArchived ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  {showArchived ? 'Active' : 'Archived'}
                </button>

                {!showReports && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setCurrentView('list'); setMobileMenuOpen(false); }}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-all ${
                        currentView === 'list' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      List
                    </button>
                    <button
                      onClick={() => { setCurrentView('board'); setMobileMenuOpen(false); }}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-all ${
                        currentView === 'board' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      Board
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {!showReports && (
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 landscape:p-3 border border-gray-700/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  placeholder="Add a new task..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  disabled={saving}
                />
                <button
                  onClick={addTodo}
                  disabled={saving}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span className="hidden lg:inline">Add Task</span>
                </button>
              </div>
            </div>
          )}
        </header>

        <main>
          {showReports ? (
            <ReportsView />
          ) : currentView === 'board' ? (
            <BoardView />
          ) : (
            <ListView />
          )}
          
          {!loading && displayTodos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">
                {showArchived ? 'No archived tasks' : 'No tasks yet. Create your first task above!'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TodoApp;