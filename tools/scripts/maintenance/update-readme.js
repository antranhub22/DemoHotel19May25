#!/usr/bin/env node

/**
 * SSOT README Update Script
 * Automatically updates README files based on codebase analysis
 * Maintains documentation consistency with code changes
 */

const fs = require("fs").promises;
const path = require("path");
const { execSync } = require("child_process");
const chalk = require("chalk");
const { z } = require("zod");

// Configuration schema
const ReadmeConfigSchema = z.object({
  target: z.object({
    files: z.array(z.string()).default(["README.md", "docs/README.md"]),
    sections: z
      .array(z.string())
      .default([
        "description",
        "features",
        "installation",
        "usage",
        "api",
        "configuration",
        "deployment",
        "contributing",
      ]),
  }),
  analysis: z.object({
    includeMetrics: z.boolean().default(true),
    includeDependencies: z.boolean().default(true),
    includeArchitecture: z.boolean().default(true),
    includeApiDocs: z.boolean().default(true),
  }),
  templates: z.object({
    directory: z.string().default("./docs/templates"),
    defaultTemplate: z.string().default("README.template.md"),
  }),
  generation: z.object({
    autoUpdateBadges: z.boolean().default(true),
    includeTOC: z.boolean().default(true),
    includeSchemas: z.boolean().default(true),
    includeExamples: z.boolean().default(true),
  }),
  formatting: z.object({
    lineLength: z.number().default(80),
    indentSize: z.number().default(2),
    useMarkdownLint: z.boolean().default(true),
  }),
});

class ReadmeUpdater {
  constructor(options = {}) {
    this.config = this.loadConfig();
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.template = options.template || null;

    this.logFile = path.join(process.cwd(), "readme-update.log");
    this.projectInfo = {};
    this.generatedSections = new Map();
  }

  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), "readme.config.json");
      const configData = require(configPath);
      return ReadmeConfigSchema.parse(configData);
    } catch (error) {
      // Return default configuration
      return ReadmeConfigSchema.parse({});
    }
  }

  async log(message, level = "info") {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    if (this.verbose || level === "error") {
      console.log(this.colorizeLog(logEntry, level));
    }

    await fs.appendFile(this.logFile, logEntry).catch(() => {});
  }

  colorizeLog(message, level) {
    switch (level) {
      case "error":
        return chalk.red(message);
      case "warn":
        return chalk.yellow(message);
      case "success":
        return chalk.green(message);
      case "info":
        return chalk.blue(message);
      default:
        return message;
    }
  }

  async analyzeProject() {
    await this.log("Analyzing project structure...");

    try {
      // Read package.json
      const packageJson = JSON.parse(
        await fs.readFile(path.join(process.cwd(), "package.json"), "utf8"),
      );

      this.projectInfo = {
        name: packageJson.name || "Untitled Project",
        version: packageJson.version || "1.0.0",
        description: packageJson.description || "",
        author: packageJson.author || "Unknown",
        license: packageJson.license || "MIT",
        homepage: packageJson.homepage || "",
        repository: packageJson.repository || "",
        keywords: packageJson.keywords || [],
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {}),
        scripts: Object.keys(packageJson.scripts || {}),
      };

      // Get git information
      try {
        this.projectInfo.gitInfo = {
          commitCount: execSync("git rev-list --count HEAD", {
            encoding: "utf8",
          }).trim(),
          lastCommit: execSync('git log -1 --format="%h %s"', {
            encoding: "utf8",
          }).trim(),
          branch: execSync("git branch --show-current", {
            encoding: "utf8",
          }).trim(),
          contributors: execSync("git shortlog -sn", { encoding: "utf8" })
            .split("\n")
            .filter((line) => line.trim()).length,
        };
      } catch (error) {
        this.projectInfo.gitInfo = null;
      }

      // Analyze project structure
      this.projectInfo.structure = await this.analyzeProjectStructure();

      // Get database schema info
      if (this.config.analysis.includeArchitecture) {
        this.projectInfo.architecture = await this.analyzeArchitecture();
      }

      // Get API endpoints
      if (this.config.analysis.includeApiDocs) {
        this.projectInfo.apiEndpoints = await this.analyzeApiEndpoints();
      }

      await this.log("Project analysis completed", "success");
    } catch (error) {
      await this.log(`Project analysis failed: ${error.message}`, "error");
      throw error;
    }
  }

  async analyzeProjectStructure() {
    const structure = {
      totalFiles: 0,
      directories: [],
      fileTypes: new Map(),
      codeMetrics: {
        totalLines: 0,
        jsFiles: 0,
        tsFiles: 0,
        cssFiles: 0,
        testFiles: 0,
      },
    };

    try {
      // Get directory structure
      const output = execSync(
        'find . -type d -not -path "./node_modules*" -not -path "./.git*" | head -20',
        {
          encoding: "utf8",
        },
      );
      structure.directories = output.split("\n").filter((line) => line.trim());

      // Count files by type
      const fileCount = execSync(
        'find . -type f -not -path "./node_modules*" -not -path "./.git*" | wc -l',
        {
          encoding: "utf8",
        },
      );
      structure.totalFiles = parseInt(fileCount.trim());

      // Analyze code metrics
      const extensions = [
        ".js",
        ".ts",
        ".tsx",
        ".jsx",
        ".css",
        ".scss",
        ".json",
      ];
      for (const ext of extensions) {
        try {
          const count = execSync(
            `find . -name "*${ext}" -not -path "./node_modules*" | wc -l`,
            {
              encoding: "utf8",
            },
          );
          structure.fileTypes.set(ext, parseInt(count.trim()));
        } catch {
          structure.fileTypes.set(ext, 0);
        }
      }

      // Count test files
      const testCount = execSync(
        'find . -name "*.test.*" -o -name "*.spec.*" | wc -l',
        {
          encoding: "utf8",
        },
      );
      structure.codeMetrics.testFiles = parseInt(testCount.trim());
    } catch (error) {
      await this.log(`Structure analysis warning: ${error.message}`, "warn");
    }

    return structure;
  }

  async analyzeArchitecture() {
    const architecture = {
      type: "Unknown",
      components: [],
      databases: [],
      services: [],
      deployment: "Unknown",
    };

    try {
      // Detect architecture type
      if (
        (await this.fileExists("apps/client")) &&
        (await this.fileExists("apps/server"))
      ) {
        architecture.type = "Monorepo (Client/Server)";
      } else if (await this.fileExists("src/pages")) {
        architecture.type = "Single Page Application";
      } else if (await this.fileExists("apps/server")) {
        architecture.type = "Backend Service";
      }

      // Detect databases
      if (await this.fileExists("prisma/schema.prisma")) {
        architecture.databases.push("PostgreSQL (Prisma ORM)");
      }

      // Detect services
      const servicesDir = "apps/server/services";
      if (await this.fileExists(servicesDir)) {
        const services = await fs.readdir(servicesDir);
        architecture.services = services
          .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
          .map((file) => file.replace(/\.(ts|js)$/, ""));
      }

      // Detect deployment
      if (
        (await this.fileExists("render.yaml")) ||
        (await this.fileExists("deploy-render.sh"))
      ) {
        architecture.deployment = "Render";
      } else if (await this.fileExists("vercel.json")) {
        architecture.deployment = "Vercel";
      } else if (await this.fileExists("Dockerfile")) {
        architecture.deployment = "Docker";
      }
    } catch (error) {
      await this.log(`Architecture analysis warning: ${error.message}`, "warn");
    }

    return architecture;
  }

  async analyzeApiEndpoints() {
    const endpoints = [];

    try {
      const routesDir = "apps/server/routes";
      if (await this.fileExists(routesDir)) {
        const routeFiles = await fs.readdir(routesDir);

        for (const file of routeFiles) {
          if (file.endsWith(".ts") || file.endsWith(".js")) {
            const content = await fs.readFile(
              path.join(routesDir, file),
              "utf8",
            );
            const extractedRoutes = this.extractRoutesFromFile(content, file);
            endpoints.push(...extractedRoutes);
          }
        }
      }
    } catch (error) {
      await this.log(`API analysis warning: ${error.message}`, "warn");
    }

    return endpoints;
  }

  extractRoutesFromFile(content, filename) {
    const routes = [];
    const routeRegex =
      /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;

    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      routes.push({
        method: match[1].toUpperCase(),
        path: match[2],
        file: filename,
      });
    }

    return routes;
  }

  async fileExists(filePath) {
    try {
      await fs.access(path.join(process.cwd(), filePath));
      return true;
    } catch {
      return false;
    }
  }

  async generateDescriptionSection() {
    let section = `# ${this.projectInfo.name}\n\n`;

    if (this.projectInfo.description) {
      section += `${this.projectInfo.description}\n\n`;
    }

    // Add badges
    if (this.config.generation.autoUpdateBadges) {
      section += "## Badges\n\n";
      section += `![Version](https://img.shields.io/badge/version-${this.projectInfo.version}-blue)\n`;
      section += `![License](https://img.shields.io/badge/license-${this.projectInfo.license}-green)\n`;

      if (this.projectInfo.gitInfo) {
        section += `![Commits](https://img.shields.io/badge/commits-${this.projectInfo.gitInfo.commitCount}-orange)\n`;
        section += `![Contributors](https://img.shields.io/badge/contributors-${this.projectInfo.gitInfo.contributors}-purple)\n`;
      }

      section += "\n";
    }

    return section;
  }

  async generateFeaturesSection() {
    let section = "## Features\n\n";

    // Auto-detect features based on dependencies and structure
    const features = [];

    if (this.projectInfo.dependencies.includes("react")) {
      features.push(
        "🚀 **React Frontend** - Modern React application with TypeScript",
      );
    }

    if (this.projectInfo.dependencies.includes("express")) {
      features.push("⚡ **Express Backend** - RESTful API server");
    }

    if (this.projectInfo.architecture.databases.length > 0) {
      features.push(
        `🗄️ **Database Integration** - ${this.projectInfo.architecture.databases.join(", ")}`,
      );
    }

    if (this.projectInfo.dependencies.some((dep) => dep.includes("auth"))) {
      features.push(
        "🔐 **Authentication** - Secure user authentication system",
      );
    }

    if (this.projectInfo.apiEndpoints.length > 0) {
      features.push(
        `🔌 **REST API** - ${this.projectInfo.apiEndpoints.length} endpoints`,
      );
    }

    if (this.projectInfo.structure.codeMetrics.testFiles > 0) {
      features.push("🧪 **Testing Suite** - Comprehensive test coverage");
    }

    if (this.projectInfo.dependencies.includes("socket.io")) {
      features.push("🔄 **Real-time Updates** - WebSocket integration");
    }

    if (features.length > 0) {
      section += features.join("\n") + "\n\n";
    } else {
      section += "- Feature discovery in progress...\n\n";
    }

    return section;
  }

  async generateInstallationSection() {
    let section = "## Installation\n\n";

    section += "### Prerequisites\n\n";
    section += "- Node.js (v16 or higher)\n";
    section += "- npm or yarn\n";

    if (this.projectInfo.architecture.databases.length > 0) {
      section += "- Database (SQLite/PostgreSQL)\n";
    }

    section += "\n### Setup\n\n";
    section += "1. Clone the repository:\n";
    section += "```bash\n";
    section += `git clone ${this.projectInfo.repository}\n`;
    section += `cd ${this.projectInfo.name}\n`;
    section += "```\n\n";

    section += "2. Install dependencies:\n";
    section += "```bash\n";
    section += "npm install\n";
    section += "```\n\n";

    if (await this.fileExists(".env.example")) {
      section += "3. Set up environment variables:\n";
      section += "```bash\n";
      section += "cp .env.example .env\n";
      section += "# Edit .env with your configuration\n";
      section += "```\n\n";
    }

    if (
      this.projectInfo.scripts.includes("db:migrate") ||
      this.projectInfo.scripts.includes("migrate")
    ) {
      section += "4. Set up the database:\n";
      section += "```bash\n";
      section += "npm run db:migrate\n";
      section += "```\n\n";
    }

    section += "5. Start the development server:\n";
    section += "```bash\n";
    section += "npm run dev\n";
    section += "```\n\n";

    return section;
  }

  async generateUsageSection() {
    let section = "## Usage\n\n";

    // Development commands
    section += "### Development\n\n";
    const devScripts = Object.entries(this.projectInfo.scripts || {}).filter(
      ([name]) => name.includes("dev") || name.includes("start"),
    );

    if (devScripts.length > 0) {
      for (const [name] of devScripts) {
        section += `- \`npm run ${name}\` - Start development server\n`;
      }
    }

    // Build commands
    const buildScripts = Object.entries(this.projectInfo.scripts || {}).filter(
      ([name]) => name.includes("build"),
    );

    if (buildScripts.length > 0) {
      section += "\n### Building\n\n";
      for (const [name] of buildScripts) {
        section += `- \`npm run ${name}\` - Build for production\n`;
      }
    }

    // Test commands
    const testScripts = Object.entries(this.projectInfo.scripts || {}).filter(
      ([name]) => name.includes("test"),
    );

    if (testScripts.length > 0) {
      section += "\n### Testing\n\n";
      for (const [name] of testScripts) {
        section += `- \`npm run ${name}\` - Run tests\n`;
      }
    }

    section += "\n";
    return section;
  }

  async generateApiSection() {
    if (this.projectInfo.apiEndpoints.length === 0) {
      return "";
    }

    let section = "## API Documentation\n\n";

    // Group endpoints by method
    const groupedEndpoints = this.projectInfo.apiEndpoints.reduce(
      (acc, endpoint) => {
        if (!acc[endpoint.method]) {
          acc[endpoint.method] = [];
        }
        acc[endpoint.method].push(endpoint);
        return acc;
      },
      {},
    );

    for (const [method, endpoints] of Object.entries(groupedEndpoints)) {
      section += `### ${method} Endpoints\n\n`;
      for (const endpoint of endpoints) {
        section += `- \`${method} ${endpoint.path}\`\n`;
      }
      section += "\n";
    }

    section +=
      "For detailed API documentation, see [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)\n\n";

    return section;
  }

  async generateConfigurationSection() {
    let section = "## Configuration\n\n";

    if (await this.fileExists(".env.example")) {
      section += "### Environment Variables\n\n";
      try {
        const envExample = await fs.readFile(".env.example", "utf8");
        const envVars = envExample
          .split("\n")
          .filter((line) => line.trim() && !line.startsWith("#"))
          .map((line) => line.split("=")[0]);

        for (const envVar of envVars) {
          section += `- \`${envVar}\` - Description needed\n`;
        }
      } catch {
        section += "See `.env.example` for required environment variables.\n";
      }
      section += "\n";
    }

    if (this.config.generation.includeSchemas) {
      section += "### Schema Configuration\n\n";
      section += "This project uses JSON schemas for validation:\n";
      section +=
        "- `schemas/dashboard-schema.json` - Dashboard configuration\n";
      section +=
        "- `schemas/api-schema.json` - API request/response validation\n\n";
    }

    return section;
  }

  async generateDeploymentSection() {
    let section = "## Deployment\n\n";

    if (this.projectInfo.architecture.deployment !== "Unknown") {
      section += `### ${this.projectInfo.architecture.deployment}\n\n`;

      switch (this.projectInfo.architecture.deployment) {
        case "Render":
          section += "This project is configured for deployment on Render.\n\n";
          section += "1. Connect your repository to Render\n";
          section += "2. Set environment variables\n";
          section += "3. Deploy using the provided scripts\n\n";
          section += "```bash\n";
          section += "npm run deploy:render\n";
          section += "```\n\n";
          break;
        case "Vercel":
          section += "Deploy to Vercel with one click:\n\n";
          section += "```bash\n";
          section += "vercel --prod\n";
          section += "```\n\n";
          break;
        case "Docker":
          section += "Build and run with Docker:\n\n";
          section += "```bash\n";
          section += "docker build -t app .\n";
          section += "docker run -p 3000:3000 app\n";
          section += "```\n\n";
          break;
      }
    } else {
      section += "Deployment configuration to be added.\n\n";
    }

    return section;
  }

  async generateContributingSection() {
    let section = "## Contributing\n\n";

    section += "1. Fork the repository\n";
    section +=
      "2. Create your feature branch (`git checkout -b feature/amazing-feature`)\n";
    section +=
      '3. Commit your changes (`git commit -m "Add some amazing feature"`)\n';
    section +=
      "4. Push to the branch (`git push origin feature/amazing-feature`)\n";
    section += "5. Open a Pull Request\n\n";

    if (this.projectInfo.structure.codeMetrics.testFiles > 0) {
      section += "### Development Guidelines\n\n";
      section += "- Write tests for new features\n";
      section += "- Follow the existing code style\n";
      section += "- Update documentation as needed\n";
      section += "- Ensure all tests pass before submitting\n\n";
    }

    return section;
  }

  async generateTableOfContents() {
    if (!this.config.generation.includeTOC) {
      return "";
    }

    let toc = "## Table of Contents\n\n";

    for (const section of this.config.target.sections) {
      const sectionTitle = section.charAt(0).toUpperCase() + section.slice(1);
      const anchor = section.toLowerCase().replace(/\s+/g, "-");
      toc += `- [${sectionTitle}](#${anchor})\n`;
    }

    toc += "\n";
    return toc;
  }

  async generateFullReadme() {
    await this.log("Generating README content...");

    let content = "";

    // Generate all sections
    const sectionGenerators = {
      description: this.generateDescriptionSection.bind(this),
      features: this.generateFeaturesSection.bind(this),
      installation: this.generateInstallationSection.bind(this),
      usage: this.generateUsageSection.bind(this),
      api: this.generateApiSection.bind(this),
      configuration: this.generateConfigurationSection.bind(this),
      deployment: this.generateDeploymentSection.bind(this),
      contributing: this.generateContributingSection.bind(this),
    };

    // Add description (includes title and badges)
    content += await sectionGenerators.description();

    // Add table of contents
    content += await this.generateTableOfContents();

    // Generate requested sections
    for (const sectionName of this.config.target.sections) {
      if (sectionName !== "description" && sectionGenerators[sectionName]) {
        const sectionContent = await sectionGenerators[sectionName]();
        if (sectionContent.trim()) {
          content += sectionContent;
        }
      }
    }

    // Add footer
    content += "## License\n\n";
    content += `This project is licensed under the ${this.projectInfo.license} License.\n\n`;

    if (this.projectInfo.gitInfo) {
      content += "---\n\n";
      content += `Generated automatically by SSOT README updater\n`;
      content += `Last updated: ${new Date().toISOString().split("T")[0]}\n`;
    }

    return content;
  }

  async updateReadmeFile(filePath, content) {
    await this.log(`Updating ${filePath}...`);

    if (this.dryRun) {
      await this.log(`[DRY RUN] Would update ${filePath}`, "info");
      return;
    }

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write content
      await fs.writeFile(filePath, content);

      await this.log(`✓ Updated ${filePath}`, "success");
    } catch (error) {
      await this.log(
        `✗ Failed to update ${filePath}: ${error.message}`,
        "error",
      );
      throw error;
    }
  }

  async update() {
    await this.log("Starting README update process...");

    try {
      // Analyze project
      await this.analyzeProject();

      // Generate content
      const content = await this.generateFullReadme();

      // Update target files
      const updatedFiles = [];
      for (const file of this.config.target.files) {
        const fullPath = path.join(process.cwd(), file);
        await this.updateReadmeFile(fullPath, content);
        updatedFiles.push(file);
      }

      await this.log("✓ README update completed", "success");

      return {
        updatedFiles,
        projectInfo: this.projectInfo,
        summary: {
          totalLines: content.split("\n").length,
          sections: this.config.target.sections.length,
          features: this.projectInfo.apiEndpoints?.length || 0,
          dependencies: this.projectInfo.dependencies?.length || 0,
        },
      };
    } catch (error) {
      await this.log(`✗ README update failed: ${error.message}`, "error");
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes("--dry-run"),
    verbose: args.includes("--verbose") || args.includes("-v"),
    template: args.find((arg) => arg.startsWith("--template="))?.split("=")[1],
    help: args.includes("--help") || args.includes("-h"),
  };

  if (options.help) {
    console.log(`
README Update Script

Usage: node update-readme.js [options]

Options:
  --dry-run              Show what would be updated without making changes
  --verbose, -v          Show detailed output
  --template=FILE        Use custom template file
  --help, -h             Show this help message

Examples:
  node update-readme.js                    # Update README with auto-generated content
  node update-readme.js --dry-run          # Preview changes without updating
  node update-readme.js --verbose          # Show detailed output
    `);
    return;
  }

  try {
    const updater = new ReadmeUpdater(options);
    const result = await updater.update();

    console.log(chalk.green("\n✓ README update completed!"));
    console.log(`\nUpdated files: ${result.updatedFiles.join(", ")}`);
    console.log(`\nSummary:`);
    console.log(`  Total lines: ${result.summary.totalLines}`);
    console.log(`  Sections: ${result.summary.sections}`);
    console.log(`  API endpoints: ${result.summary.features}`);
    console.log(`  Dependencies: ${result.summary.dependencies}`);
  } catch (error) {
    console.error(chalk.red(`\n✗ README update failed: ${error.message}`));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

module.exports = { ReadmeUpdater };
