// In-memory storage (use a database in production)
let ipDatabase = [];

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Add new IP
    const { ip, timestamp } = req.body;
    
    // Add to database
    ipDatabase.push({ ip, timestamp });
    
    // Keep only last 100 entries
    if (ipDatabase.length > 100) {
      ipDatabase = ipDatabase.slice(-100);
    }
    
    res.status(200).json({ success: true });
  } else if (req.method === 'GET') {
    // Return all IPs
    res.status(200).json(ipDatabase);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
