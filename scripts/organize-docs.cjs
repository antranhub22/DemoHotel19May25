#!/usr/bin/env node

/**
 * Script tổ chức lại các file markdown
 * Phân loại và di chuyển tất cả file .md vào cấu trúc docs/ mới
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cấu trúc thư mục mới
const DOCS_STRUCTURE = {
    'project-info': {
        description: 'Thông tin dự án',
        patterns: [
            'README.md', 'CHANGELOG.md', 'LICENSE.md', 'AUTO_MIGRATION_SYSTEM.md',
            'PROJECT_COMPLETE_SUMMARY.md', 'IMPLEMENTATION_ROADMAP.md'
        ]
    },
    'architecture': {
        description: 'Kiến trúc hệ thống',
        patterns: [
            'ARCHITECTURE.md', 'ARCHITECTURE_GUIDELINES.md', 'ARCHITECTURE_AUTOMATION.md',
            'SIRI_MODULAR_ARCHITECTURE.md', 'SCHEMA_CONSOLIDATION_ANALYSIS.md',
            'MODULAR_ARCHITECTURE_IMPLEMENTATION.md', 'adr-*.md'
        ]
    },
    'deployment': {
        description: 'Hướng dẫn triển khai',
        patterns: [
            'DEPLOYMENT_*.md', 'RENDER_*.md', 'FORCE_DEPLOY.md', 'QUICK_START_PRODUCTION.md',
            '🎯-SIMPLE-DEPLOYMENT-STEPS.md', '🎯-RENDER-FIX-NGAY.md'
        ]
    },
    'development': {
        description: 'Hướng dẫn phát triển',
        patterns: [
            'ENVIRONMENT_*.md', 'CONTRIBUTING.md', 'CODE_REVIEW_GUIDE.md',
            'IMPLEMENTATION_GUIDE.md', 'ONBOARDING_GUIDE.md', 'PACKAGE_DEPENDENCIES_*.md',
            'DEPENDENCIES_ANALYSIS.md'
        ]
    },
    'testing': {
        description: 'Tài liệu testing',
        patterns: [
            'TEST_*.md', 'TASK_*_TESTING_*.md', 'manual-testing-procedures.md',
            'integration-testing-README.md'
        ]
    },
    'troubleshooting': {
        description: 'Xử lý sự cố',
        patterns: [
            'TROUBLESHOOTING_*.md', 'FIX_*.md', 'DEBUG_*.md', 'ERROR_*.md',
            'DATABASE_CLEANUP_*.md', 'AUTH_FILES_ANALYSIS.md', 'MOBILE_SIRI_FIXES.md',
            'PRODUCTION_SCHEMA_FIX.md', 'VOICE_COMPONENT_EMERGENCY_FIXES.md'
        ]
    },
    'api': {
        description: 'Tài liệu API',
        patterns: [
            'API_DOCUMENTATION.md', 'API_*.md'
        ]
    },
    'voice-assistant': {
        description: 'Tài liệu voice assistant',
        patterns: [
            'VOICE_*.md', 'VAPI_*.md', 'SIRI_*.md', '🎤-TEST-INSTRUCTIONS.md',
            '📊-VAPI-SETUP-ANALYSIS.md', 'PRODUCTION_VAPI_DEBUG_PLAN.md'
        ]
    },
    'database': {
        description: 'Tài liệu database',
        patterns: [
            'database-optimization-summary.md', 'connection-pooling-summary.md',
            'typescript-code-quality-summary.md'
        ]
    },
    'security': {
        description: 'Tài liệu bảo mật',
        patterns: [
            'SECURITY_*.md', 'AUTHENTICATION_*.md'
        ]
    },
    'analytics': {
        description: 'Tài liệu analytics',
        patterns: [
            'ANALYTICS_*.md', 'METRICS_*.md'
        ]
    },
    'multi-tenant': {
        description: 'Tài liệu multi-tenant',
        patterns: [
            'TENANT_*.md', 'MULTI_TENANT_*.md'
        ]
    },
    'automation': {
        description: 'Tài liệu automation',
        patterns: [
            'AUTOMATION_*.md', 'REPOSITORY_SYNC_CHECKER_*.md', 'IMPORT_EXPORT_CHECKER_*.md',
            'ADVANCED_PAGINATION_GUIDE.md'
        ]
    },
    'knowledge-base': {
        description: 'Knowledge base',
        patterns: [
            'KNOWLEDGE_BASE_*.md', 'FAQ_*.md'
        ]
    },
    'training': {
        description: 'Tài liệu đào tạo',
        patterns: [
            'TRAINING_*.md', 'ONBOARDING_*.md'
        ]
    },
    'governance': {
        description: 'Tài liệu governance',
        patterns: [
            'GOVERNANCE_*.md', 'POLICIES_*.md'
        ]
    },
    'legacy': {
        description: 'Tài liệu legacy (đã lỗi thời)',
        patterns: [
            'legacy_*.md', 'STEP*.md', 'cursor_implementation_guide.md',
            'repository_refactoring_guide.md', 'USER_GUIDE.md', 'REFACTORING_PLAN.md',
            'INSTALL.md', 'INTERFACE1_REFACTOR.md', 'professional_repo_cleanup_guide.md',
            'DOCUMENTATION.md', 'README.vi.md', 'VAPI_LANGUAGE_DEBUGGING.md',
            'dashboard_consolidation_plan.md', 'voicebot_saas_ui_ux.md', 'FORCE_REBUILD.md',
            'SYSTEM_INTEGRATION_AUDIT.md'
        ]
    },
    'templates': {
        description: 'Templates',
        patterns: [
            'adr-template.md', 'template_*.md'
        ]
    }
};

// Tạo thư mục docs nếu chưa có
function createDocsDirectory() {
    const docsPath = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsPath)) {
        fs.mkdirSync(docsPath, { recursive: true });
        console.log('✅ Tạo thư mục docs/');
    }

    // Tạo các thư mục con
    Object.keys(DOCS_STRUCTURE).forEach(category => {
        const categoryPath = path.join(docsPath, category);
        if (!fs.existsSync(categoryPath)) {
            fs.mkdirSync(categoryPath, { recursive: true });
            console.log(`✅ Tạo thư mục docs/${category}/`);
        }
    });
}

// Tìm tất cả file markdown
function findAllMarkdownFiles() {
    try {
        const result = execSync('find . -name "*.md" -type f', { encoding: 'utf8' });
        return result.split('\n').filter(line => line.trim() && !line.includes('node_modules') && !line.includes('.git'));
    } catch (error) {
        console.error('❌ Lỗi khi tìm file markdown:', error.message);
        return [];
    }
}

// Phân loại file theo pattern
function categorizeFile(filename) {
    const basename = path.basename(filename);

    for (const [category, config] of Object.entries(DOCS_STRUCTURE)) {
        for (const pattern of config.patterns) {
            if (basename.includes(pattern.replace('*.md', '')) ||
                basename.match(pattern.replace('*', '.*'))) {
                return category;
            }
        }
    }

    // Kiểm tra nội dung file để phân loại
    try {
        const content = fs.readFileSync(filename, 'utf8').toLowerCase();
        if (content.includes('deployment') || content.includes('deploy')) return 'deployment';
        if (content.includes('test') || content.includes('testing')) return 'testing';
        if (content.includes('troubleshoot') || content.includes('fix') || content.includes('debug')) return 'troubleshooting';
        if (content.includes('api') || content.includes('endpoint')) return 'api';
        if (content.includes('voice') || content.includes('vapi') || content.includes('siri')) return 'voice-assistant';
        if (content.includes('database') || content.includes('schema')) return 'database';
        if (content.includes('security') || content.includes('auth')) return 'security';
        if (content.includes('analytics') || content.includes('metrics')) return 'analytics';
        if (content.includes('tenant') || content.includes('multi-tenant')) return 'multi-tenant';
        if (content.includes('automation') || content.includes('script')) return 'automation';
        if (content.includes('training') || content.includes('onboarding')) return 'training';
        if (content.includes('governance') || content.includes('policy')) return 'governance';
    } catch (error) {
        console.warn(`⚠️ Không thể đọc file ${filename}:`, error.message);
    }

    return 'legacy'; // Mặc định vào legacy nếu không phân loại được
}

// Di chuyển file
function moveFile(sourcePath, targetCategory) {
    const basename = path.basename(sourcePath);
    const targetPath = path.join(process.cwd(), 'docs', targetCategory, basename);

    // Kiểm tra xem file đã tồn tại chưa
    if (fs.existsSync(targetPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const nameWithoutExt = path.basename(basename, '.md');
        const newBasename = `${nameWithoutExt}_${timestamp}.md`;
        const newTargetPath = path.join(process.cwd(), 'docs', targetCategory, newBasename);

        console.log(`⚠️ File ${basename} đã tồn tại, đổi tên thành ${newBasename}`);
        fs.copyFileSync(sourcePath, newTargetPath);
    } else {
        fs.copyFileSync(sourcePath, targetPath);
    }

    console.log(`✅ Di chuyển ${basename} → docs/${targetCategory}/`);
}

// Tạo file README cho mỗi category
function createCategoryREADME(category, config) {
    const readmePath = path.join(process.cwd(), 'docs', category, 'README.md');
    const files = fs.readdirSync(path.join(process.cwd(), 'docs', category))
        .filter(file => file.endsWith('.md') && file !== 'README.md');

    const readmeContent = `# ${config.description}

## 📁 Tài liệu trong thư mục này

${files.map(file => `- [${file.replace('.md', '')}](./${file})`).join('\n')}

## 📝 Mô tả

${config.description}

## 🔍 Tìm kiếm

Để tìm kiếm trong thư mục này:

\`\`\`bash
# Tìm kiếm theo từ khóa
grep -r "keyword" ./docs/${category}/

# Tìm kiếm file
find ./docs/${category}/ -name "*.md" | grep "keyword"
\`\`\`

---

*📚 Tài liệu này được tổ chức tự động bởi script organize-docs.cjs*
`;

    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✅ Tạo README cho docs/${category}/`);
}

// Tạo báo cáo tổng kết
function createSummaryReport() {
    const summaryPath = path.join(process.cwd(), 'docs', 'ORGANIZATION_SUMMARY.md');
    const summary = {
        totalFiles: 0,
        categories: {},
        timestamp: new Date().toISOString()
    };

    Object.keys(DOCS_STRUCTURE).forEach(category => {
        const categoryPath = path.join(process.cwd(), 'docs', category);
        if (fs.existsSync(categoryPath)) {
            const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.md'));
            summary.categories[category] = {
                count: files.length,
                description: DOCS_STRUCTURE[category].description,
                files: files
            };
            summary.totalFiles += files.length;
        }
    });

    const summaryContent = `# 📊 Báo cáo tổ chức tài liệu

## 📈 Thống kê

- **Tổng số file**: ${summary.totalFiles}
- **Số category**: ${Object.keys(summary.categories).length}
- **Thời gian tổ chức**: ${summary.timestamp}

## 📁 Phân bố theo category

${Object.entries(summary.categories).map(([category, data]) =>
        `### ${category} (${data.count} files)
- **Mô tả**: ${data.description}
- **Files**: ${data.files.join(', ')}
`).join('\n')}

## 🎯 Cấu trúc mới

\`\`\`
docs/
${Object.keys(summary.categories).map(category =>
            `├── ${category}/ (${summary.categories[category].count} files)`
        ).join('\n')}
\`\`\`

## 🔄 Cập nhật

Để cập nhật tổ chức tài liệu:

\`\`\`bash
node scripts/organize-docs.cjs
\`\`\`

---

*📚 Báo cáo được tạo tự động bởi script organize-docs.cjs*
`;

    fs.writeFileSync(summaryPath, summaryContent);
    console.log('✅ Tạo báo cáo tổng kết');
}

// Main function
function main() {
    console.log('🚀 Bắt đầu tổ chức lại tài liệu...\n');

    // 1. Tạo cấu trúc thư mục
    createDocsDirectory();

    // 2. Tìm tất cả file markdown
    const markdownFiles = findAllMarkdownFiles();
    console.log(`📁 Tìm thấy ${markdownFiles.length} file markdown\n`);

    // 3. Phân loại và di chuyển file
    let processedCount = 0;
    markdownFiles.forEach(file => {
        if (file && fs.existsSync(file)) {
            const category = categorizeFile(file);
            moveFile(file, category);
            processedCount++;
        }
    });

    console.log(`\n✅ Đã xử lý ${processedCount} files\n`);

    // 4. Tạo README cho mỗi category
    Object.entries(DOCS_STRUCTURE).forEach(([category, config]) => {
        const categoryPath = path.join(process.cwd(), 'docs', category);
        if (fs.existsSync(categoryPath)) {
            createCategoryREADME(category, config);
        }
    });

    // 5. Tạo báo cáo tổng kết
    createSummaryReport();

    console.log('🎉 Hoàn thành tổ chức tài liệu!');
    console.log('📚 Xem kết quả tại: docs/');
    console.log('📊 Xem báo cáo tại: docs/ORGANIZATION_SUMMARY.md');
}

// Chạy script
if (require.main === module) {
    main();
}

module.exports = { main, DOCS_STRUCTURE }; 