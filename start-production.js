const { spawn } = require('child_process');
const path = require('path');

// Set production environment
process.env.NODE_ENV = 'production';

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🚀 Starting Ecommerce Monolith in Production Mode       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

// Track processes
const processes = [];

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
    console.error(`❌ ${name} error:`, error.message);
  });

  proc.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ ${name} exited with code ${code}`);
      // If any critical service exits, shut down everything
      if (name !== 'Proxy Server') {
        cleanup();
      }
    }
  });

  return proc;
}

// Cleanup function to kill all processes
function cleanup() {
  console.log('\n\n🛑 Shutting down all services...\n');
  processes.forEach(({ name, proc }) => {
    console.log(`   Stopping ${name}...`);
    try {
      proc.kill('SIGTERM');
    } catch (error) {
      console.error(`   Failed to stop ${name}:`, error.message);
    }
  });

  setTimeout(() => {
    console.log('\n✅ All services stopped\n');
    process.exit(0);
  }, 2000);
}

// Handle shutdown signals
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

// Wait function
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Start services sequentially with delays
async function startServices() {
  try {
    // Configuration constants
    const PORT = process.env.PORT || '3000';
    const STRAPI_STARTUP_WAIT = Number(process.env.STRAPI_STARTUP_WAIT) || 10000; // ms (default 10s)
    const NEXTJS_STARTUP_WAIT = Number(process.env.NEXTJS_STARTUP_WAIT) || 5000; // ms (default 5s)

    // 1. Start Strapi backend
    spawnProcess('Strapi Backend', 'node', ['./backend/node_modules/.bin/strapi', 'start'], {
      cwd: path.join(__dirname),
      env: {
        ...process.env,
        PORT: '1337',
        HOST: '0.0.0.0',
      },
    });

    console.log(`⏳ Waiting for Strapi to be ready (${STRAPI_STARTUP_WAIT / 1000} seconds)...`);
    await wait(STRAPI_STARTUP_WAIT);

    // 2. Start Next.js frontend
    spawnProcess(
      'Next.js Frontend',
      'node',
      ['./frontend/node_modules/.bin/next', 'start', '-p', '3001'],
      {
        cwd: path.join(__dirname),
        env: {
          ...process.env,
          PORT: '3001',
          HOSTNAME: '0.0.0.0',
        },
      }
    );

    console.log(`⏳ Waiting for Next.js to be ready (${NEXTJS_STARTUP_WAIT / 1000} seconds)...`);
    await wait(NEXTJS_STARTUP_WAIT);

    // 3. Start proxy server
    spawnProcess('Proxy Server', 'node', ['server.js'], {
      cwd: path.join(__dirname),
      env: {
        ...process.env,
        PORT: PORT,
        HOST: '0.0.0.0',
      },
    });

    console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║  ✅ All services started successfully!                    ║
  ║                                                           ║
  ║  🏪 Store:     http://0.0.0.0:${PORT}
  ║  ⚙️  Admin:     http://0.0.0.0:${PORT}/admin
  ║  🔌 API:       http://0.0.0.0:${PORT}/api
  ║  💚 Health:    http://0.0.0.0:${PORT}/health
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error('❌ Failed to start services:', error.message);
    cleanup();
  }
}

// Start all services
startServices();
