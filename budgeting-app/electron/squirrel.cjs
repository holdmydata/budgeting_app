const { app } = require('electron');

module.exports = function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Install desktop and start menu shortcuts
      app.quit();
      return true;
    case '--squirrel-uninstall':
      // Remove desktop and start menu shortcuts
      app.quit();
      return true;
    case '--squirrel-obsolete':
      app.quit();
      return true;
    default:
      return false;
  }
}; 