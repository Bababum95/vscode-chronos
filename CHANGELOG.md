# Change Log

All notable changes to the "vscode-chronos" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.3] - 2025-11-23

### Fixed

- **Extension ID Mismatch**: Fixed incorrect extension ID used in `vscode.extensions.getExtension()` call
  - Changed from `'Chronos.vscode-chronos'` to `'bababum.vscode-chronos'` to match actual publisher.name from package.json
  - Prevents potential errors when extension tries to access its own metadata
- **Unhandled Promise Rejections**: Added comprehensive error handling for all async operations
  - Added `.catch()` handlers for `sendHeartbeats()` calls without await
  - Added error handling for `getCodingActivity()` async callbacks
  - Added try-catch block in `initialize()` method to prevent extension activation failures
  - Added error handling for async `initialize()` call in extension activation
- **Deactivate Function Safety**: Added null check in `deactivate()` function to prevent errors when extension is not properly initialized
- **API Error Handling**: Improved error handling in API class methods
  - Added try-catch blocks in `sendHeartbeats()` and `getToday()` methods
  - Added detailed error logging with response message extraction
  - Errors are now properly logged and re-thrown for upstream handling
- **File System Error Handling**: Fixed unhandled exception in `fs.writeFile` callback
  - Replaced `throw err` with proper error logging using Logger instance
  - Prevents extension crashes when config file cannot be written
- **Git Extension Safety**: Added error handling for Git extension API access
  - Wrapped `getGitBranch()` and `getGitRepo()` methods in try-catch blocks
  - Prevents errors when Git extension is not available or not initialized
  - Methods now gracefully return `undefined` on errors instead of crashing
- **Disposable Property**: Changed `disposable` property to optional type (`disposable?: vscode.Disposable`)
  - Prevents TypeScript errors when disposable is not yet initialized
  - Better aligns with actual usage patterns in the code

### Technical Improvements

- **Error Recovery**: All critical async operations now have proper error handling
  - Extension continues to function even if individual operations fail
  - All errors are logged for debugging purposes
  - User experience is not interrupted by background operation failures
- **Type Safety**: Improved type definitions for optional properties
- **Error Logging**: Enhanced error messages with context and stack traces where applicable

## [1.0.2] - 2025-10-11

### Added

- **Set Server URL Command**: New command `Chronos: Set Server URL` to easily change the API server URL through a dialog with URL validation
  - Validates URL format before saving
  - Automatically removes trailing slashes
  - Updates both configuration file and active API client
  - Provides user feedback on successful update
- **Open Log File Command**: New command `Chronos: Open Log File` to open the extension's log file directly in VS Code
  - Opens log file in a non-preview tab for easy access
  - Displays error message if log file cannot be accessed
  - Useful for debugging and troubleshooting
- **Dashboard Command**: New command `Chronos: Dashboard` to quickly open the Chronos dashboard in the default browser

### Changed

- **API Class Enhancement**: Added `setServerUrl()` method to allow dynamic server URL updates without restart
- **Command Structure**: Reorganized command palette entries for better user experience
  - Moved away from test/debug commands to production-ready user commands
  - All commands now have clear, user-friendly titles

### Removed

- **Test Commands**: Removed development-only commands (`Chronos: Hello` and `Chronos: Test`) from production build
  - These were debug commands and not needed for end users
  - Reduced command palette clutter

### Technical Improvements

- Improved error handling in log file opening
- Better URL validation with native URL API
- Enhanced user feedback messages for all new commands
- Code cleanup and removal of unused command registrations

## [1.0.1] - 2025-09-22

### Changed

- **API Endpoint**: Updated summaries endpoint from `/summaries` to `/summaries/range` for improved data retrieval with date range filtering

## [1.0.0] - 2025-09-13

### Added

- **Time Tracking**: Automatic tracking of coding sessions with heartbeat-based activity monitoring
- **AI Code Detection**: Intelligent detection and categorization of AI-generated code vs human-written code
- **Activity Categories**: Support for different coding activity types:
  - Regular coding
  - Debugging sessions
  - Building/compiling
  - AI-assisted coding
  - Code reviewing (Pull Requests)
- **Status Bar Integration**: Real-time display of today's coding time in VS Code status bar
- **API Integration**: Secure connection to Chronos server for data synchronization
- **Configuration Management**:
  - API key management with secure storage
  - Configurable server URL (defaults to https://next-chronos.vercel.app)
  - Status bar visibility controls
- **Project Context Tracking**:
  - Git branch detection
  - Project folder identification
  - File-level activity tracking
- **Smart Deduplication**: Prevents duplicate heartbeats for identical cursor positions
- **Line Change Tracking**: Separate tracking of AI vs human line changes
- **Command Palette Integration**:
  - `Chronos: Hello` - Test command to verify extension functionality
  - `Chronos: Api Key` - Set up API key for server connection
  - `Chronos: Test` - Test server connectivity
- **Error Handling**: Robust error handling with retry mechanisms for failed API calls
- **Logging System**: Comprehensive debug logging for troubleshooting
- **Cross-platform Support**: Works on Windows, macOS, and Linux

### Technical Features

- **Debounced Activity Tracking**: Prevents excessive API calls with intelligent debouncing
- **Background Processing**: Non-blocking heartbeat collection and transmission
- **Memory Management**: Efficient handling of large codebases with file selection mapping
- **Extension Lifecycle Management**: Proper activation/deactivation handling
- **TypeScript Support**: Full TypeScript implementation with type safety
- **Webpack Bundling**: Optimized production builds with source maps

### Security

- **Secure API Key Storage**: API keys stored securely in VS Code settings
- **Basic Authentication**: Secure API communication using Basic Auth
- **Input Validation**: Comprehensive validation of API keys and user inputs
