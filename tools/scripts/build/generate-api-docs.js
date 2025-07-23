#!/usr/bin/env node

/**
 * SSOT API Documentation Generator
 * Automatically generates API documentation from routes and schemas
 * Usage: node scripts/generate-api-docs.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  routesPath: path.join(__dirname, '../apps/server/routes'),
  schemasPath: path.join(__dirname, '../packages/shared/validation/schemas.ts'),
  outputPath: path.join(__dirname, '../docs/api'),
  templatePath: path.join(__dirname, '../docs/templates'),
  backupPath: path.join(__dirname, '../backup/api-docs-backup.json'),
};

// API endpoint patterns to extract
const ENDPOINT_PATTERNS = {
  route: /router\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g,
  middleware: /router\.use\(([^)]+)\)/g,
  description: /\/\*\*\s*\n\s*\*\s*([^\n]+)/g,
  requestBody: /@param\s+\{([^}]+)\}\s+([^\s]+)\s+-\s+([^\n]+)/g,
  responseType: /@returns?\s+\{([^}]+)\}\s+([^\n]+)/g,
};

class ApiDocGenerator {
  constructor() {
    this.routes = [];
    this.schemas = {};
    this.generatedDocs = [];
    this.timestamp = new Date().toISOString();
  }

  async generateApiDocs() {
    console.log('📚 Starting SSOT API Documentation Generation...');

    try {
      // Create backup of existing docs
      await this.createBackup();

      // Scan routes directory
      await this.scanRoutes();

      // Parse validation schemas
      await this.parseSchemas();

      // Generate documentation for each route file
      await this.generateRouteDocs();

      // Generate OpenAPI/Swagger specification
      await this.generateOpenApiSpec();

      // Generate Postman collection
      await this.generatePostmanCollection();

      // Generate README and index
      await this.generateIndexDocs();

      console.log('✅ API documentation generation completed!');
      console.log(
        `📁 Generated: ${this.generatedDocs.length} documentation files`
      );
    } catch (error) {
      console.error('❌ API documentation generation failed:', error);
      await this.restoreBackup();
      process.exit(1);
    }
  }

  async createBackup() {
    console.log('💾 Creating backup of existing API docs...');

    if (!fs.existsSync(path.dirname(CONFIG.backupPath))) {
      fs.mkdirSync(path.dirname(CONFIG.backupPath), { recursive: true });
    }

    const existingDocs = {};

    if (fs.existsSync(CONFIG.outputPath)) {
      const files = this.getAllFiles(CONFIG.outputPath);
      for (const file of files) {
        const relativePath = path.relative(CONFIG.outputPath, file);
        existingDocs[relativePath] = fs.readFileSync(file, 'utf8');
      }
    }

    fs.writeFileSync(
      CONFIG.backupPath,
      JSON.stringify(
        {
          timestamp: this.timestamp,
          docs: existingDocs,
        },
        null,
        2
      )
    );

    console.log('✅ Backup created successfully');
  }

  async scanRoutes() {
    console.log('🔍 Scanning routes directory...');

    const routeFiles = fs
      .readdirSync(CONFIG.routesPath)
      .filter(file => file.endsWith('.ts') && !file.includes('.test.'))
      .map(file => path.join(CONFIG.routesPath, file));

    for (const routeFile of routeFiles) {
      const content = fs.readFileSync(routeFile, 'utf8');
      const routeName = path.basename(routeFile, '.ts');

      const routes = this.extractRoutesFromFile(content, routeName);
      this.routes.push(...routes);
    }

    console.log(
      `✅ Found ${this.routes.length} API endpoints across ${routeFiles.length} route files`
    );
  }

  extractRoutesFromFile(content, fileName) {
    const routes = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for route definitions
      const routeMatch = line.match(
        /router\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/
      );
      if (routeMatch) {
        const [, method, path] = routeMatch;

        // Extract documentation from comments above
        const documentation = this.extractDocumentationFromLines(lines, i);

        // Extract middleware from the route definition
        const middleware = this.extractMiddleware(line);

        // Extract handler function details
        const handler = this.extractHandlerDetails(lines, i);

        routes.push({
          file: fileName,
          method: method.toUpperCase(),
          path: this.normalizePath(path),
          fullPath: this.getFullApiPath(path),
          documentation,
          middleware,
          handler,
          lineNumber: i + 1,
        });
      }
    }

    return routes;
  }

  extractDocumentationFromLines(lines, routeIndex) {
    const docs = {
      summary: '',
      description: '',
      tags: [],
      parameters: [],
      requestBody: null,
      responses: {},
      examples: [],
    };

    // Look for JSDoc comments above the route
    let i = routeIndex - 1;
    const commentLines = [];

    while (
      i >= 0 &&
      (lines[i].trim().startsWith('*') ||
        lines[i].trim().startsWith('/**') ||
        lines[i].trim().startsWith('//'))
    ) {
      commentLines.unshift(lines[i].trim());
      i--;
    }

    // Parse comment lines
    for (const commentLine of commentLines) {
      const clean = commentLine.replace(/^\/\*\*|\*\/|\*|\/\/\s?/g, '').trim();

      if (clean.startsWith('@summary')) {
        docs.summary = clean.replace('@summary', '').trim();
      } else if (clean.startsWith('@description')) {
        docs.description = clean.replace('@description', '').trim();
      } else if (clean.startsWith('@tag')) {
        docs.tags.push(clean.replace('@tag', '').trim());
      } else if (clean.startsWith('@param')) {
        docs.parameters.push(this.parseParameter(clean));
      } else if (clean.startsWith('@body')) {
        docs.requestBody = this.parseRequestBody(clean);
      } else if (clean.startsWith('@response')) {
        const response = this.parseResponse(clean);
        docs.responses[response.code] = response;
      } else if (clean && !clean.startsWith('@') && !docs.summary) {
        docs.summary = clean;
      }
    }

    return docs;
  }

  parseParameter(paramLine) {
    const match = paramLine.match(
      /@param\s+\{([^}]+)\}\s+([^\s]+)\s+-?\s*(.*)/
    );
    if (match) {
      const [, type, name, description] = match;
      return {
        name: name,
        type: type,
        description: description || '',
        required: !type.includes('?'),
        in: name.includes(':') ? 'path' : 'query',
      };
    }
    return null;
  }

  parseRequestBody(bodyLine) {
    const match = bodyLine.match(/@body\s+\{([^}]+)\}\s+-?\s*(.*)/);
    if (match) {
      const [, schema, description] = match;
      return {
        description: description || '',
        schema: schema,
        required: true,
      };
    }
    return null;
  }

  parseResponse(responseLine) {
    const match = responseLine.match(
      /@response\s+(\d+)\s+\{([^}]+)\}\s+-?\s*(.*)/
    );
    if (match) {
      const [, code, schema, description] = match;
      return {
        code: code,
        description: description || '',
        schema: schema,
      };
    }
    return null;
  }

  extractMiddleware(routeLine) {
    const middleware = [];

    // Common middleware patterns
    if (routeLine.includes('verifyJWT'))
      middleware.push('Authentication Required');
    if (routeLine.includes('checkLimits')) middleware.push('Rate Limiting');
    if (routeLine.includes('validateTenant'))
      middleware.push('Tenant Validation');
    if (routeLine.includes('requireFeature')) middleware.push('Feature Gate');

    return middleware;
  }

  extractHandlerDetails(lines, routeIndex) {
    // Look for request/response patterns in the handler
    const handlerStart = routeIndex;
    let handlerEnd = handlerStart;
    let braceCount = 0;

    // Find the end of the handler function
    for (let i = handlerStart; i < lines.length; i++) {
      const line = lines[i];
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;

      if (braceCount === 0 && i > handlerStart) {
        handlerEnd = i;
        break;
      }
    }

    const handlerContent = lines.slice(handlerStart, handlerEnd + 1).join('\n');

    return {
      startLine: handlerStart + 1,
      endLine: handlerEnd + 1,
      usesDatabase:
        handlerContent.includes('db.') || handlerContent.includes('storage.'),
      usesExternalApi:
        handlerContent.includes('fetch(') || handlerContent.includes('axios.'),
      errorHandling:
        handlerContent.includes('try') && handlerContent.includes('catch'),
      validation:
        handlerContent.includes('.parse(') ||
        handlerContent.includes('.safeParse('),
    };
  }

  normalizePath(path) {
    return path.replace(/:/g, '{').replace(/([^{]+)/g, match => {
      if (match.includes('{')) return match + '}';
      return match;
    });
  }

  getFullApiPath(path) {
    // Determine base path from route file
    const basePaths = {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      analytics: '/api/analytics',
      orders: '/api/orders',
      calls: '/api/calls',
      health: '/api/health',
    };

    for (const [key, basePath] of Object.entries(basePaths)) {
      if (path.includes(key) || this.routes.some(r => r.file === key)) {
        return basePath + (path.startsWith('/') ? path : '/' + path);
      }
    }

    return '/api' + (path.startsWith('/') ? path : '/' + path);
  }

  async parseSchemas() {
    console.log('📋 Parsing validation schemas...');

    if (fs.existsSync(CONFIG.schemasPath)) {
      const content = fs.readFileSync(CONFIG.schemasPath, 'utf8');

      // Extract schema definitions (simplified parsing)
      const schemaMatches = content.match(
        /export const (\w+Schema) = z\.([\s\S]*?);/g
      );

      if (schemaMatches) {
        for (const match of schemaMatches) {
          const [, schemaName] = match.match(/export const (\w+Schema)/);
          this.schemas[schemaName] = {
            name: schemaName,
            definition: match,
            type: 'zod',
          };
        }
      }
    }

    console.log(
      `✅ Parsed ${Object.keys(this.schemas).length} validation schemas`
    );
  }

  async generateRouteDocs() {
    console.log('📝 Generating route documentation...');

    // Ensure output directory exists
    if (!fs.existsSync(CONFIG.outputPath)) {
      fs.mkdirSync(CONFIG.outputPath, { recursive: true });
    }

    // Group routes by file/module
    const routesByFile = {};
    for (const route of this.routes) {
      if (!routesByFile[route.file]) {
        routesByFile[route.file] = [];
      }
      routesByFile[route.file].push(route);
    }

    // Generate documentation for each module
    for (const [fileName, routes] of Object.entries(routesByFile)) {
      const docContent = this.generateModuleDoc(fileName, routes);
      const docPath = path.join(CONFIG.outputPath, `${fileName}.md`);

      fs.writeFileSync(docPath, docContent);
      this.generatedDocs.push(docPath);
    }

    console.log(
      `✅ Generated ${Object.keys(routesByFile).length} route documentation files`
    );
  }

  generateModuleDoc(moduleName, routes) {
    const moduleTitle = this.capitalize(moduleName) + ' API';

    let content = `# ${moduleTitle}

> Auto-generated API documentation from SSOT
> Generated on: ${this.timestamp}

## Overview

This module provides API endpoints for ${moduleName} functionality.

## Base URL

All endpoints in this module are prefixed with \`/api/${moduleName}\`

## Authentication

${this.getAuthenticationInfo(routes)}

## Endpoints

`;

    // Generate documentation for each endpoint
    for (const route of routes.sort((a, b) => a.path.localeCompare(b.path))) {
      content += this.generateEndpointDoc(route);
      content += '\n\n---\n\n';
    }

    content += this.generateModuleFooter(moduleName, routes);

    return content;
  }

  generateEndpointDoc(route) {
    const { method, path, documentation, middleware, handler } = route;

    let content = `### ${method} ${path}

${documentation.summary || 'No description available'}

${documentation.description ? `\n${documentation.description}\n` : ''}

**Method:** \`${method}\`  
**Path:** \`${route.fullPath}\`  

`;

    // Middleware information
    if (middleware.length > 0) {
      content += `**Middleware:** ${middleware.join(', ')}\n\n`;
    }

    // Parameters
    if (documentation.parameters.length > 0) {
      content += `**Parameters:**\n\n`;
      content += `| Name | Type | Required | Location | Description |\n`;
      content += `|------|------|----------|----------|-------------|\n`;

      for (const param of documentation.parameters) {
        const required = param.required ? '✅' : '❌';
        content += `| ${param.name} | ${param.type} | ${required} | ${param.in} | ${param.description} |\n`;
      }
      content += '\n';
    }

    // Request body
    if (documentation.requestBody) {
      content += `**Request Body:**\n\n`;
      content += `\`\`\`json\n`;
      content += `// ${documentation.requestBody.description}\n`;
      content += `// Schema: ${documentation.requestBody.schema}\n`;
      content += `{\n  // Request body structure\n}\n`;
      content += `\`\`\`\n\n`;
    }

    // Responses
    if (Object.keys(documentation.responses).length > 0) {
      content += `**Responses:**\n\n`;

      for (const [code, response] of Object.entries(documentation.responses)) {
        content += `**${code}** - ${response.description}\n`;
        content += `\`\`\`json\n`;
        content += `// Schema: ${response.schema}\n`;
        content += `{\n  // Response structure\n}\n`;
        content += `\`\`\`\n\n`;
      }
    }

    // Handler information
    content += `**Implementation Details:**\n`;
    content += `- Database Access: ${handler.usesDatabase ? '✅' : '❌'}\n`;
    content += `- External API: ${handler.usesExternalApi ? '✅' : '❌'}\n`;
    content += `- Error Handling: ${handler.errorHandling ? '✅' : '❌'}\n`;
    content += `- Input Validation: ${handler.validation ? '✅' : '❌'}\n`;

    return content;
  }

  getAuthenticationInfo(routes) {
    const hasAuth = routes.some(r =>
      r.middleware.includes('Authentication Required')
    );

    if (hasAuth) {
      return `🔒 **Authentication Required**: Most endpoints require a valid JWT token in the Authorization header.

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\``;
    }

    return '🔓 **No Authentication Required**: Endpoints in this module are publicly accessible.';
  }

  generateModuleFooter(moduleName, routes) {
    return `## Summary

This module contains **${routes.length}** endpoints:

${routes.map(r => `- \`${r.method} ${r.path}\` - ${r.documentation.summary || 'No description'}`).join('\n')}

## Error Handling

All endpoints follow the standard error response format:

\`\`\`json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-20T10:30:00Z"
}
\`\`\`

## Rate Limiting

API endpoints may be rate-limited based on your subscription plan and tenant configuration.

---

*Generated by SSOT API Documentation Generator*  
*Last updated: ${this.timestamp}*`;
  }

  async generateOpenApiSpec() {
    console.log('🌐 Generating OpenAPI specification...');

    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Hotel Voice Assistant API',
        version: '1.0.0',
        description: 'Multi-tenant hotel voice assistant platform API',
        contact: {
          name: 'API Support',
          email: 'support@hotel-assistant.com',
        },
      },
      servers: [
        {
          url: 'https://api.hotel-assistant.com',
          description: 'Production server',
        },
        {
          url: 'http://localhost:10000',
          description: 'Development server',
        },
      ],
      paths: {},
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: this.generateOpenApiSchemas(),
      },
    };

    // Generate paths from routes
    for (const route of this.routes) {
      const pathKey = route.fullPath.replace(/{([^}]+)}/g, '{$1}');

      if (!spec.paths[pathKey]) {
        spec.paths[pathKey] = {};
      }

      spec.paths[pathKey][route.method.toLowerCase()] =
        this.generateOpenApiOperation(route);
    }

    const specPath = path.join(CONFIG.outputPath, 'openapi.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
    this.generatedDocs.push(specPath);

    console.log('✅ OpenAPI specification generated');
  }

  generateOpenApiOperation(route) {
    const operation = {
      summary: route.documentation.summary || `${route.method} ${route.path}`,
      description: route.documentation.description || '',
      tags:
        route.documentation.tags.length > 0
          ? route.documentation.tags
          : [route.file],
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
      },
    };

    // Add security if authentication required
    if (route.middleware.includes('Authentication Required')) {
      operation.security = [{ bearerAuth: [] }];
    }

    // Add parameters
    if (route.documentation.parameters.length > 0) {
      operation.parameters = route.documentation.parameters.map(param => ({
        name: param.name,
        in: param.in,
        required: param.required,
        description: param.description,
        schema: { type: this.mapTypeToOpenApi(param.type) },
      }));
    }

    // Add request body
    if (route.documentation.requestBody) {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: { type: 'object' },
          },
        },
      };
    }

    return operation;
  }

  mapTypeToOpenApi(type) {
    const typeMap = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      object: 'object',
      array: 'array',
    };
    return typeMap[type] || 'string';
  }

  generateOpenApiSchemas() {
    const schemas = {};

    // Convert Zod schemas to OpenAPI schemas (simplified)
    for (const [name, schema] of Object.entries(this.schemas)) {
      schemas[name] = {
        type: 'object',
        description: `Generated from ${schema.name}`,
      };
    }

    return schemas;
  }

  async generatePostmanCollection() {
    console.log('📮 Generating Postman collection...');

    const collection = {
      info: {
        name: 'Hotel Voice Assistant API',
        description: 'Auto-generated Postman collection from SSOT',
        schema:
          'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      auth: {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{jwt_token}}',
            type: 'string',
          },
        ],
      },
      variable: [
        {
          key: 'base_url',
          value: 'http://localhost:10000',
        },
        {
          key: 'jwt_token',
          value: 'your-jwt-token-here',
        },
      ],
      item: [],
    };

    // Group routes by module
    const routesByModule = {};
    for (const route of this.routes) {
      if (!routesByModule[route.file]) {
        routesByModule[route.file] = [];
      }
      routesByModule[route.file].push(route);
    }

    // Generate folders for each module
    for (const [moduleName, routes] of Object.entries(routesByModule)) {
      const folder = {
        name: this.capitalize(moduleName),
        item: [],
      };

      for (const route of routes) {
        folder.item.push(this.generatePostmanRequest(route));
      }

      collection.item.push(folder);
    }

    const collectionPath = path.join(
      CONFIG.outputPath,
      'postman-collection.json'
    );
    fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
    this.generatedDocs.push(collectionPath);

    console.log('✅ Postman collection generated');
  }

  generatePostmanRequest(route) {
    const request = {
      name: `${route.method} ${route.path}`,
      request: {
        method: route.method,
        header: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
        url: {
          raw: `{{base_url}}${route.fullPath}`,
          host: ['{{base_url}}'],
          path: route.fullPath.split('/').filter(p => p),
        },
      },
    };

    // Add authentication if required
    if (route.middleware.includes('Authentication Required')) {
      request.request.auth = {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{jwt_token}}',
            type: 'string',
          },
        ],
      };
    }

    // Add request body for POST/PUT/PATCH
    if (
      ['POST', 'PUT', 'PATCH'].includes(route.method) &&
      route.documentation.requestBody
    ) {
      request.request.body = {
        mode: 'raw',
        raw: JSON.stringify(
          {
            // Example request body
          },
          null,
          2
        ),
      };
    }

    return request;
  }

  async generateIndexDocs() {
    console.log('📑 Generating index documentation...');

    const indexContent = `# API Documentation

> Auto-generated API documentation from SSOT  
> Generated on: ${this.timestamp}

## Overview

This documentation covers all API endpoints for the Hotel Voice Assistant platform.

## Modules

${this.routes
  .reduce((acc, route) => {
    if (!acc.includes(route.file)) acc.push(route.file);
    return acc;
  }, [])
  .map(file => `- [${this.capitalize(file)} API](${file}.md)`)
  .join('\n')}

## Quick Start

### Authentication

Most API endpoints require authentication. Include your JWT token in the Authorization header:

\`\`\`
Authorization: Bearer your-jwt-token-here
\`\`\`

### Base URL

**Development:** \`http://localhost:10000/api\`  
**Production:** \`https://api.hotel-assistant.com/api\`

### Response Format

All API responses follow this standard format:

\`\`\`json
{
  "success": true,
  "data": { },
  "message": "Optional message",
  "timestamp": "2024-01-20T10:30:00Z"
}
\`\`\`

## Tools

- **[OpenAPI Specification](openapi.json)** - Machine-readable API spec
- **[Postman Collection](postman-collection.json)** - Import into Postman for testing

## Statistics

- **Total Endpoints:** ${this.routes.length}
- **Modules:** ${
      this.routes.reduce((acc, route) => {
        if (!acc.includes(route.file)) acc.push(route.file);
        return acc;
      }, []).length
    }
- **Authentication Required:** ${this.routes.filter(r => r.middleware.includes('Authentication Required')).length}/${this.routes.length}

---

*Generated by SSOT API Documentation Generator*  
*Last updated: ${this.timestamp}*
`;

    const indexPath = path.join(CONFIG.outputPath, 'README.md');
    fs.writeFileSync(indexPath, indexContent);
    this.generatedDocs.push(indexPath);

    console.log('✅ Index documentation generated');
  }

  async restoreBackup() {
    console.log('🔄 Restoring backup...');

    try {
      if (fs.existsSync(CONFIG.backupPath)) {
        const backup = JSON.parse(fs.readFileSync(CONFIG.backupPath, 'utf8'));

        for (const [relativePath, content] of Object.entries(backup.docs)) {
          const fullPath = path.join(CONFIG.outputPath, relativePath);
          const dir = path.dirname(fullPath);

          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(fullPath, content);
        }

        console.log('✅ Backup restored successfully');
      }
    } catch (error) {
      console.error('❌ Failed to restore backup:', error);
    }
  }

  getAllFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new ApiDocGenerator();
  generator.generateApiDocs().catch(error => {
    console.error('❌ API documentation generation error:', error);
    process.exit(1);
  });
}

export default ApiDocGenerator;
export { ApiDocGenerator };
