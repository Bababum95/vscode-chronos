# Change Log

All notable changes to the "vscode-chronos" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Future enhancements and bug fixes

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
