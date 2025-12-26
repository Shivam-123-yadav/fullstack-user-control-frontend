import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import './Tasks.css';

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    assigned_to: ''
  });

  useEffect(() => {
    fetchTasks();
    if (user.role !== 'user') {
      fetchUsers();
    }
  }, [user.role]);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}/`, formData);
      } else {
        await api.post('/tasks/', formData);
      }
      fetchTasks();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}/`);
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        assigned_to: task.assigned_to
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        assigned_to: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      assigned_to: ''
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const canEdit = (task) => {
    return user.role === 'admin' || task.created_by === user.id;
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>Tasks Management</h1>
        {(user.role === 'admin' || user.role === 'manager') && (
          <button className="btn-primary" onClick={() => openModal()}>
            + Create Task
          </button>
        )}
      </div>

      <div className="tasks-list">
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <div className="task-header">
              <h3 className="task-title">{task.title}</h3>
              <span className={`status-badge ${task.status}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            <p className="task-description">{task.description}</p>
            <div className="task-meta">
              <span>👤 {task.assigned_to_username}</span>
              <span>✍️ {task.created_by_username}</span>
              <span>📅 {new Date(task.created_at).toLocaleDateString()}</span>
            </div>
            {canEdit(task) && (
              <div className="task-actions">
                <button className="btn-secondary" onClick={() => openModal(task)}>
                  Edit
                </button>
                <button className="btn-danger" onClick={() => handleDelete(task.id)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select name="assigned_to" value={formData.assigned_to} onChange={handleChange}>
                  <option value="">Select User</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username} - {u.first_name} {u.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTask ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;