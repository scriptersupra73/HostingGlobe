// Add this to the end of the existing script in index.html
// Or create a separate script file

// Connect to Socket.IO server
const socket = io();

// Listen for new IPs
socket.on('new-ip', (data) => {
    console.log('Received new IP:', data);
    // Add to the globe visualization
    // You would implement this part to show markers on the globe
});

// Listen for initial IPs
socket.on('initial-ips', (ips) => {
    console.log('Initial IPs:', ips);
    // Populate the dashboard with existing IPs
});

// When you detect an IP, send it to the server
function sendIPData(ipData) {
    socket.emit('ip-detected', ipData);
}

// Modify the fetchIPInfo function to send data to server
async function fetchIPInfo() {
    try {
        // First try WebRTC leak detection to get local IP
        const leakedIPs = await detectWebRTCLeak();
        
        // Try the ipify API for public IP
        const response = await fetch('https://api.ipify.org?format=json');
        const ipData = await response.json();
        
        // Add public IP to list
        addIPToList(ipData.ip, 'public');
        showNotification(`Public IP detected: ${ipData.ip}`, 'public');
        
        // Create demo data based on detected IP
        const data = {
            ip: ipData.ip,
            city: 'Detected City',
            region: 'Detected Region',
            country: 'US',
            country_name: 'United States',
            org: 'Your ISP Provider',
            asn: 'AS#####',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            postal: 'N/A',
            latitude: 40.7128,
            longitude: -74.0060,
            localIPs: leakedIPs
        };
        
        currentIPData = data;
        
        let status = 'unknown';
        let statusText = '? Connection Type Unknown';
        let statusClass = 'status-unknown';

        displayIPInfo(data, status, statusText, statusClass, leakedIPs);
        updateMarker(data.latitude, data.longitude, data.ip, data.country_name);
        
        // Send data to server
        sendIPData(data);
        
    } catch (error) {
        console.error('Error:', error);
        
        // Show demo data if API fails
        const demoData = {
            ip: '203.0.113.42',
            city: 'Demo City',
            region: 'Demo Region',
            country: 'US',
            country_name: 'United States',
            org: 'Demo ISP Provider',
            asn: 'AS12345',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            postal: 'N/A',
            latitude: 37.7749,
            longitude: -122.4194,
            localIPs: []
        };
        
        addIPToList(demoData.ip, 'public');
        showNotification(`Demo IP detected: ${demoData.ip}`, 'demo');
        currentIPData = demoData;
        
        displayIPInfo(demoData, 'unknown', '📋 Demo Mode', 'status-unknown', []);
        updateMarker(demoData.latitude, demoData.longitude, demoData.ip, demoData.country_name);
        
        // Send demo data to server
        sendIPData(demoData);
    }
}
