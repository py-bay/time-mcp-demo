# Time MCP Server

A minimal Model Context Protocol (MCP) server that provides current time functionality. This server implements the MCP protocol specification and exposes a single tool for retrieving the current date and time.

## Features

- **Single Tool**: `getCurrentTime` - Returns current date/time in ISO 8601 format
- **Timezone Support**: Optional timezone parameter for localized time
- **MCP Protocol**: Full compliance with Model Context Protocol specification
- **TypeScript**: Modern TypeScript with strict typing
- **Minimal Dependencies**: Only uses `@modelcontextprotocol/sdk`
- **Stdio Transport**: Communication via standard input/output

## Installation

```bash
npm install
```

This will install dependencies and automatically build the project.

## Usage

### As a Standalone Server

Run the server directly:

```bash
npm run build
node dist/index.js
```

Or use the binary:

```bash
npx time-mcp-server
```

### With MCP Clients

Configure your MCP client to use this server. Example configuration for Claude Desktop or other MCP clients:

```json
{
  "mcpServers": {
    "time": {
      "command": "node",
      "args": ["/path/to/time-mcp-demo/dist/index.js"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "time": {
      "command": "npx",
      "args": ["time-mcp-server"]
    }
  }
}
```

## Tool: getCurrentTime

Returns the current date and time in ISO 8601 format.

### Parameters

- `timezone` (optional): IANA timezone identifier (e.g., 'America/New_York', 'Europe/London', 'Asia/Tokyo')
  - If not provided, returns time in UTC

### Examples

**Get current time in UTC:**
```json
{
  "name": "getCurrentTime",
  "arguments": {}
}
```

Returns: `2025-10-22T21:09:31.654Z`

**Get current time in a specific timezone:**
```json
{
  "name": "getCurrentTime",
  "arguments": {
    "timezone": "America/New_York"
  }
}
```

Returns: `2025-10-22T17:09:31.654`

**Other timezone examples:**
- `Europe/London`
- `Asia/Tokyo`
- `America/Los_Angeles`
- `Australia/Sydney`
- `UTC`

## Development

### Build

```bash
npm run build
```

### Watch Mode

For development with auto-rebuild on file changes:

```bash
npm run dev
```

## Project Structure

```
time-mcp-demo/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Technical Details

### MCP Protocol Compliance

This server implements the Model Context Protocol specification:
- Uses `StdioServerTransport` for communication
- Handles `tools/list` requests to advertise available tools
- Handles `tools/call` requests to execute tools
- Returns responses in the correct MCP format

### TypeScript Configuration

- Target: ES2022
- Module: Node16
- Strict mode enabled
- Full type safety with no implicit any

### Dependencies

- `@modelcontextprotocol/sdk`: MCP protocol implementation
- `typescript`: TypeScript compiler
- `@types/node`: Node.js type definitions

## Error Handling

The server includes robust error handling:
- Invalid timezone identifiers return descriptive error messages
- Unknown tools return appropriate error responses
- All errors are properly formatted in MCP response format

## License

MIT