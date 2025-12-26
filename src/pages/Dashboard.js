import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="user-info">
        <p>Welcome, {user.first_name || user.username}!</p>
        <p>Role: {user.role}</p>
      </div>

      <div className="tasks-section">
        <h3>My Tasks ({tasks.length})</h3>
        <div className="tasks-list">
          {tasks.map(task => (
            <div key={task.id} className="task-item">
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <div className="task-meta">
                <span>Status: {task.status}</span>
                <span>Assigned: {task.assigned_to_username}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;