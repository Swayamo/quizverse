const net = require('net');

/**
 * Checks if a port is in use
 * @param {number} port - The port to check
 * @returns {Promise<boolean>} - Resolves to true if port is in use, false otherwise
 */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
}

/**
 * Finds an available port starting from the specified port
 * @param {number} startPort - The starting port to check from
 * @returns {Promise<number>} - Resolves to available port
 */
async function findAvailablePort(startPort) {
  let port = startPort;
  let portFound = false;
  
  while (!portFound) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      portFound = true;
    } else {
      port++;
    }
  }
  
  return port;
}

module.exports = { isPortInUse, findAvailablePort };
