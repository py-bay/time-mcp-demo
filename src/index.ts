#!/usr/bin/env node

/**
 * Time MCP Server
 * 
 * A minimal Model Context Protocol (MCP) server that provides current time functionality.
 * This server exposes a single tool `getCurrentTime` that returns the current date and time
 * in ISO 8601 format with optional timezone support.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Tool definition for getCurrentTime
 */
const GET_CURRENT_TIME_TOOL: Tool = {
  name: "getCurrentTime",
  description:
    "Returns the current date and time in ISO 8601 format. Optionally accepts a timezone parameter to return the time in a specific timezone (e.g., 'America/New_York', 'Europe/London', 'Asia/Tokyo').",
  inputSchema: {
    type: "object",
    properties: {
      timezone: {
        type: "string",
        description:
          "Optional IANA timezone identifier (e.g., 'America/New_York', 'Europe/London', 'UTC'). If not provided, returns time in UTC.",
      },
    },
  },
};

/**
 * Get current time in ISO 8601 format for the specified timezone
 * 
 * @param timezone - Optional IANA timezone identifier
 * @returns ISO 8601 formatted date-time string
 */
function getCurrentTime(timezone?: string): string {
  const now = new Date();

  // If no timezone specified, return UTC ISO string
  if (!timezone) {
    return now.toISOString();
  }

  try {
    // Format the date for the specified timezone
    // This uses Intl.DateTimeFormat for timezone conversion
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
      hour12: false,
      timeZoneName: "short",
    });

    const parts = formatter.formatToParts(now);
    const partsMap = Object.fromEntries(
      parts.map((part) => [part.type, part.value])
    );

    // Construct ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sss
    const isoString = `${partsMap.year}-${partsMap.month}-${partsMap.day}T${partsMap.hour}:${partsMap.minute}:${partsMap.second}.${partsMap.fractionalSecond}`;

    return isoString;
  } catch (error) {
    // If timezone is invalid, throw a descriptive error
    throw new Error(
      `Invalid timezone: ${timezone}. Please provide a valid IANA timezone identifier (e.g., 'America/New_York', 'Europe/London', 'UTC').`
    );
  }
}

/**
 * Main server setup and initialization
 */
async function main(): Promise<void> {
  // Create MCP server instance
  const server = new Server(
    {
      name: "time-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  /**
   * Handler for listing available tools
   * Returns the getCurrentTime tool definition
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [GET_CURRENT_TIME_TOOL],
    };
  });

  /**
   * Handler for tool execution requests
   * Executes the getCurrentTime tool with optional timezone parameter
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name !== "getCurrentTime") {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      const timezone = args?.timezone as string | undefined;
      const currentTime = getCurrentTime(timezone);

      return {
        content: [
          {
            type: "text",
            text: currentTime,
          },
        ],
      };
    } catch (error) {
      // Return error message if timezone is invalid or other errors occur
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Create stdio transport for communication
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  // Log server start (to stderr to not interfere with stdio protocol)
  console.error("Time MCP Server running on stdio");
}

// Run the server
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
