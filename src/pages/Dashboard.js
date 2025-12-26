import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tasks/');
        setTasks(res.data || []);
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const getStatusClass = (status) => {
    return status?.toLowerCase().replace(/\s+/g, '_') || 'pending';
  };

  // Prepare chart data
  const statusData = tasks.reduce((acc, task) => {
    const status = task.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusData).map(([name, value]) => ({ name, value }));
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  // Prepare clustered bar chart data by user and status
  const barDataMap = {};
  tasks.forEach(task => {
    const user = task.assigned_to_username || 'Unassigned';
    const status = getStatusClass(task.status);
    if (!barDataMap[user]) barDataMap[user] = {};
    barDataMap[user][status] = (barDataMap[user][status] || 0) + 1;
  });
  const barChartData = Object.entries(barDataMap).map(([user, statuses]) => ({ user, ...statuses }));

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Dashboard</h2>

      <div className="user-profile-card">
        <div>
          <div className="user-greeting">
            Welcome back, {user?.first_name || user?.username || 'User'}!
          </div>
        </div>
        <div className="user-role-badge">
          {user?.role || 'Guest'}
        </div>
      </div>

      <div className="charts-section">
        <h3>Task Statistics</h3>
        <div className="chart-container">
          <div className="chart-item">
            <h4>Status Distribution (Pie Chart)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} tasks`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-item">
            <h4>Tasks by User (Clustered Bar Chart)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="user" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value} tasks`, name]} />
                <Legend />
                <Bar dataKey="pending" fill="#6366f1" animationBegin={200} animationDuration={1000} />
                <Bar dataKey="in_progress" fill="#8b5cf6" animationBegin={400} animationDuration={1000} />
                <Bar dataKey="completed" fill="#ec4899" animationBegin={600} animationDuration={1000} />
                <Bar dataKey="Unknown" fill="#f59e0b" animationBegin={800} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="tasks-section">
        <h3>My Tasks {tasks.length > 0 && `(${tasks.length})`}</h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div className="loading-spinner">Loading tasks...</div>
          </div>
        ) : error ? (
          <div className="error-message" style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 1rem' }}>
            <h4>No tasks assigned yet</h4>
            <p>Tasks assigned to you will appear here</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <div key={task.id} className="task-card">
                <h4 className="task-title">{task.title}</h4>
                <p className="task-description">{task.description || 'No description'}</p>

                <div className="task-meta">
                  <span className={`task-meta-item status status-${getStatusClass(task.status)}`}>
                    {task.status || 'Unknown'}
                  </span>
                  <span className="task-meta-item">
                    {task.assigned_to_username || '—'}
                  </span>
                  {task.due_date && (
                    <span className="task-meta-item">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;