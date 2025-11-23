import { useState, useEffect } from 'react';

export default function IPDashboard() {
  const [currentIP, setCurrentIP] = useState('');
  const [allIPs, setAllIPs] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '' });

  // Get visitor's IP on page load
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        setCurrentIP(data.ip);
        // Save this IP to our database
        saveIP(data.ip);
      })
      .catch(() => {
        // Demo IP if API fails
        setCurrentIP('203.0.113.42');
        saveIP('203.0.113.42');
      });
    
    // Load all IPs
    loadAllIPs();
  }, []);

  const saveIP = async (ip) => {
    try {
      const response = await fetch('/api/ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, timestamp: new Date().toISOString() })
      });
      
      if (response.ok) {
        showNotification(`IP ${ip} detected and saved`);
        loadAllIPs(); // Refresh the list
      }
    } catch (error) {
      console.error('Error saving IP:', error);
    }
  };

  const loadAllIPs = async () => {
    try {
      const response = await fetch('/api/ips');
      const data = await response.json();
      setAllIPs(data);
    } catch (error) {
      console.error('Error loading IPs:', error);
    }
  };

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  const refreshData = () => {
    loadAllIPs();
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🌍 Global IP Dashboard</h1>
        <p>Real-time visitor tracking</p>
      </div>
      
      <div className="dashboard">
        <div className="current-ip">
          <h2>Your Public IP</h2>
          <div className="ip-display">{currentIP || 'Detecting...'}</div>
        </div>
        
        <div className="all-ips">
          <div className="ips-header">
            <h2>Detected IPs</h2>
            <button onClick={refreshData}>🔄 Refresh</button>
          </div>
          <div className="ip-list">
            {allIPs.map((entry, index) => (
              <div key={index} className="ip-item">
                <span>{entry.ip}</span>
                <span className="timestamp">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {notification.show && (
        <div className="notification show">
          {notification.message}
        </div>
      )}
      
      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          color: white;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          background: linear-gradient(45deg, #00d4ff, #0099ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .dashboard {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .current-ip {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 30px;
          text-align: center;
        }
        
        .current-ip h2 {
          margin-bottom: 20px;
          color: #00d4ff;
        }
        
        .ip-display {
          font-size: 2rem;
          font-family: monospace;
          background: rgba(0, 212, 255, 0.1);
          padding: 20px;
          border-radius: 10px;
          border: 1px solid rgba(0, 212, 255, 0.3);
        }
        
        .all-ips {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 30px;
        }
        
        .ips-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .ips-header h2 {
          color: #00d4ff;
        }
        
        button {
          background: linear-gradient(45deg, #00d4ff, #0099ff);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .ip-list {
          max-height: 500px;
          overflow-y: auto;
        }
        
        .ip-item {
          display: flex;
          justify-content: space-between;
          padding: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-family: monospace;
        }
        
        .timestamp {
          color: #aaa;
          font-size: 0.9rem;
        }
        
        .notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 15px 20px;
          border-radius: 8px;
          border-left: 4px solid #00d4ff;
          transform: translateY(100px);
          opacity: 0;
          transition: all 0.3s ease;
        }
        
        .notification.show {
          transform: translateY(0);
          opacity: 1;
        }
        
        @media (max-width: 768px) {
          .dashboard {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
