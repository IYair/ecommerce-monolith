const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Set production environment
process.env.NODE_ENV = 'production';

// Configuration constants (defined at top level for accessibility)
const PORT = process.env.PORT || '3000';
const STRAPI_PORT = '1337';
const NEXTJS_PORT = '3001';
const STRAPI_STARTUP_WAIT = Number(process.env.STRAPI_STARTUP_WAIT) || 10000; // ms
const NEXTJS_STARTUP_WAIT = Number(process.env.NEXTJS_STARTUP_WAIT) || 5000; // ms
const HEALTH_CHECK_INTERVAL = Number(process.env.HEALTH_CHECK_INTERVAL) || 1000; // ms
const HEALTH_CHECK_TIMEOUT = Number(process.env.HEALTH_CHECK_TIMEOUT) || 30000; // ms
const SHUTDOWN_TIMEOUT = Number(process.env.SHUTDOWN_TIMEOUT) || 5000; // ms

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🚀 Starting Ecommerce Monolith in Production Mode       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

// Track processes
const processes = [];
let isCleaningUp = false;

// HTTP health check function
function checkHealth(port, path = '/health') {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}${path}`, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Wait for service to be healthy with timeout
async function waitForHealthy(
  port,
  serviceName,
  timeout = HEALTH_CHECK_TIMEOUT,
  healthPath = '/health'
) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const isHealthy = await checkHealth(port, healthPath);
    if (isHealthy) {
      console.log(`✅ ${serviceName} is ready!`);
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, HEALTH_CHECK_INTERVAL));
  }

  throw new Error(`${serviceName} failed to start within ${timeout / 1000}s`);
}

// Function to spawn a process and handle its lifecycle
function spawnProcess(name, command, args, options = {}) {
  console.log(`\n🔄 Starting ${name}...`);

  const proc = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    ...options,
  });

  processes.push({ name, proc });

  proc.on('error', (error) => {
    console.error(`❌ ${name} spawn error:`, error.message);
    // Trigger cleanup if a service fails to spawn
    if (!isCleaningUp) {
      cleanup(1);
    }
  });

  proc.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ ${name} exited unexpectedly with code ${code}`);
      // If any service exits unexpectedly, shut down everything
      if (!isCleaningUp) {
        cleanup(1);
      }
    }
  });

  return proc;
}

// Cleanup function to kill all processes
function cleanup(exitCode = 0) {
  if (isCleaningUp) return;
  isCleaningUp = true;

  console.log('\n\n🛑 Shutting down all services...\n');

  processes.forEach(({ name, proc }) => {
    console.log(`   Stopping ${name}...`);
    try {
      proc.kill('SIGTERM');
    } catch (error) {
      console.error(`   Failed to stop ${name}:`, error.message);
    }
  });

  // Graceful shutdown with fallback to SIGKILL
  const shutdownTimer = setTimeout(() => {
    console.warn('⚠️  Graceful shutdown timeout, forcing kill...');
    processes.forEach(({ name, proc }) => {
      try {
        proc.kill('SIGKILL');
      } catch (error) {
        // Process might already be dead
      }
    });
    process.exit(exitCode);
  }, SHUTDOWN_TIMEOUT);

  // Check if all processes are dead
  const checkInterval = setInterval(() => {
    const alive = processes.filter(({ proc }) => !proc.killed && proc.exitCode === null);
    if (alive.length === 0) {
      clearTimeout(shutdownTimer);
      clearInterval(checkInterval);
      console.log('\n✅ All services stopped gracefully\n');
      process.exit(exitCode);
    }
  }, 500);
}

// Handle shutdown signals
process.on('SIGTERM', () => cleanup(0));
process.on('SIGINT', () => cleanup(0));
process.on('exit', () => {
  if (!isCleaningUp) cleanup(0);
});

// Pad string to center in box
function padCenter(text, width) {
  const padding = Math.max(0, width - text.length);
  const leftPad = Math.floor(padding / 2);
  const rightPad = Math.ceil(padding / 2);
  return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
}

// Start services sequentially with health checks
async function startServices() {
  try {
    // Validate directories exist
    const backendDir = path.join(__dirname, 'backend');
    const frontendDir = path.join(__dirname, 'frontend');

    if (!fs.existsSync(backendDir)) {
      throw new Error('Backend directory not found');
    }
    if (!fs.existsSync(frontendDir)) {
      throw new Error('Frontend directory not found');
    }
    if (!fs.existsSync(path.join(__dirname, 'server.js'))) {
      throw new Error('server.js not found');
    }

    // 1. Start Strapi backend (must run from backend directory)
    spawnProcess('Strapi Backend', 'npm', ['run', 'start'], {
      cwd: backendDir,
      env: {
        ...process.env,
        PORT: STRAPI_PORT,
        HOST: '0.0.0.0',
      },
    });

    console.log(
      `⏳ Waiting for Strapi to be ready (max ${HEALTH_CHECK_TIMEOUT / 1000}s, checking every ${HEALTH_CHECK_INTERVAL / 1000}s)...`
    );
    // Strapi doesn't have a standard health endpoint, check the admin endpoint
    await waitForHealthy(STRAPI_PORT, 'Strapi Backend', HEALTH_CHECK_TIMEOUT, '/admin');

    // 2. Start Next.js frontend (must run from frontend directory)
    spawnProcess('Next.js Frontend', 'npm', ['run', 'start'], {
      cwd: frontendDir,
      env: {
        ...process.env,
        PORT: NEXTJS_PORT,
        HOSTNAME: '0.0.0.0',
      },
    });

    console.log(
      `⏳ Waiting for Next.js to be ready (max ${HEALTH_CHECK_TIMEOUT / 1000}s, checking every ${HEALTH_CHECK_INTERVAL / 1000}s)...`
    );
    // Next.js doesn't have a health endpoint, so we wait for it to respond
    await new Promise((resolve) => setTimeout(resolve, NEXTJS_STARTUP_WAIT));

    // 3. Start proxy server
    spawnProcess('Proxy Server', 'node', ['server.js'], {
      cwd: path.join(__dirname),
      env: {
        ...process.env,
        PORT: PORT,
        HOST: '0.0.0.0',
      },
    });

    // Wait for proxy to be ready
    console.log(`⏳ Waiting for Proxy Server to be ready (max ${HEALTH_CHECK_TIMEOUT / 1000}s)...`);
    await waitForHealthy(PORT, 'Proxy Server');

    // Success message with proper padding
    const boxWidth = 59;
    const storeUrl = `🏪 Store:     http://0.0.0.0:${PORT}`;
    const adminUrl = `⚙️  Admin:     http://0.0.0.0:${PORT}/admin`;
    const apiUrl = `🔌 API:       http://0.0.0.0:${PORT}/api`;
    const healthUrl = `💚 Health:    http://0.0.0.0:${PORT}/health`;

    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  ✅ All services started successfully!                    ║
║                                                           ║
║  ${padCenter(storeUrl, boxWidth)}║
║  ${padCenter(adminUrl, boxWidth)}║
║  ${padCenter(apiUrl, boxWidth)}║
║  ${padCenter(healthUrl, boxWidth)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);

    console.log('📊 Configuration:');
    console.log(`   - Strapi startup wait: ${STRAPI_STARTUP_WAIT / 1000}s`);
    console.log(`   - Next.js startup wait: ${NEXTJS_STARTUP_WAIT / 1000}s`);
    console.log(`   - Health check interval: ${HEALTH_CHECK_INTERVAL / 1000}s`);
    console.log(`   - Health check timeout: ${HEALTH_CHECK_TIMEOUT / 1000}s`);
    console.log(`   - Shutdown timeout: ${SHUTDOWN_TIMEOUT / 1000}s\n`);
  } catch (error) {
    console.error('❌ Failed to start services:', error.message);
    cleanup(1);
  }
}

// Start all services
startServices();
