#!/usr/bin/env node

/**
 * Script dọn dẹp và tối ưu hóa cấu trúc docs
 * - Xóa file trùng lặp
 * - Đổi tên file không rõ ràng
 * - Tạo index cho từng category
 */

const fs = require('fs');
const path = require('path');

// Cấu trúc thư mục docs
const DOCS_CATEGORIES = [
    'project-info', 'architecture', 'deployment', 'development',
    'testing', 'troubleshooting', 'api', 'voice-assistant',
    'database', 'security', 'analytics', 'multi-tenant',
    'automation', 'knowledge-base', 'training', 'governance',
    'legacy', 'templates'
];

// Tên file cần đổi tên
const FILE_RENAMES = {
    'LỖHI_ĐÃ_SỬA.md': 'BUG_FIXES_SUMMARY.md',
    'TRẠNG_THÁI_CUỐI_CÙNG.md': 'FINAL_STATUS_REPORT.md',
    'HƯỚNG_DẪN_CẬP_NHẬT_ENV.md': 'ENV_UPDATE_GUIDE.md',
    'GIẢI_PHÁP_HOÀN_CHỈNH.md': 'COMPLETE_SOLUTION.md',
    'VAPI_LANGUAGE_DEBUGGING.md': 'VAPI_DEBUGGING_GUIDE.md',
    'fix-environment.md': 'ENVIRONMENT_FIX.md',
    'fix-production-now.md': 'PRODUCTION_FIX.md',
    'fix-react-infinite-render.md': 'REACT_INFINITE_RENDER_FIX.md'
};

// Xóa file trùng lặp
function removeDuplicateFiles() {
    console.log('🧹 Dọn dẹp file trùng lặp...');

    DOCS_CATEGORIES.forEach(category => {
        const categoryPath = path.join(process.cwd(), 'docs', category);
        if (!fs.existsSync(categoryPath)) return;

        const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.md'));
        const fileGroups = {};

        // Nhóm file theo nội dung
        files.forEach(file => {
            try {
                const content = fs.readFileSync(path.join(categoryPath, file), 'utf8');
                const hash = content.length + '_' + content.substring(0, 100);

                if (!fileGroups[hash]) {
                    fileGroups[hash] = [];
                }
                fileGroups[hash].push(file);
            } catch (error) {
                console.warn(`⚠️ Không thể đọc file ${file}:`, error.message);
            }
        });

        // Xóa file trùng lặp, giữ lại file có tên ngắn nhất
        Object.values(fileGroups).forEach(group => {
            if (group.length > 1) {
                group.sort((a, b) => a.length - b.length);
                const keepFile = group[0];
                const deleteFiles = group.slice(1);

                console.log(`📁 ${category}: Giữ ${keepFile}, xóa ${deleteFiles.join(', ')}`);

                deleteFiles.forEach(file => {
                    fs.unlinkSync(path.join(categoryPath, file));
                });
            }
        });
    });
}

// Đổi tên file không rõ ràng
function renameUnclearFiles() {
    console.log('✏️ Đổi tên file không rõ ràng...');

    DOCS_CATEGORIES.forEach(category => {
        const categoryPath = path.join(process.cwd(), 'docs', category);
        if (!fs.existsSync(categoryPath)) return;

        const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.md'));

        files.forEach(file => {
            if (FILE_RENAMES[file]) {
                const oldPath = path.join(categoryPath, file);
                const newPath = path.join(categoryPath, FILE_RENAMES[file]);

                if (!fs.existsSync(newPath)) {
                    fs.renameSync(oldPath, newPath);
                    console.log(`✅ ${category}: ${file} → ${FILE_RENAMES[file]}`);
                }
            }
        });
    });
}

// Tạo index cho từng category
function createCategoryIndexes() {
    console.log('📋 Tạo index cho từng category...');

    DOCS_CATEGORIES.forEach(category => {
        const categoryPath = path.join(process.cwd(), 'docs', category);
        if (!fs.existsSync(categoryPath)) return;

        const files = fs.readdirSync(categoryPath)
            .filter(file => file.endsWith('.md') && file !== 'README.md' && file !== 'INDEX.md');

        if (files.length === 0) return;

        const indexContent = `# 📁 Index - ${category}

## 📚 Tài liệu trong thư mục này

${files.map(file => {
            const name = file.replace('.md', '');
            return `- [${name}](./${file})`;
        }).join('\n')}

## 🔍 Tìm kiếm nhanh

\`\`\`bash
# Tìm kiếm theo từ khóa
grep -r "keyword" ./docs/${category}/

# Tìm kiếm file
find ./docs/${category}/ -name "*.md" | grep "keyword"
\`\`\`

## 📊 Thống kê

- **Tổng số file**: ${files.length}
- **Cập nhật cuối**: ${new Date().toISOString()}

---

*📚 Index được tạo tự động bởi script cleanup-docs.cjs*
`;

        const indexPath = path.join(categoryPath, 'INDEX.md');
        fs.writeFileSync(indexPath, indexContent);
        console.log(`✅ Tạo index cho ${category}/`);
    });
}

// Tạo sitemap tổng thể
function createSitemap() {
    console.log('🗺️ Tạo sitemap tổng thể...');

    const sitemapContent = `# 🗺️ Documentation Sitemap

## 📁 Cấu trúc tổng thể

${DOCS_CATEGORIES.map(category => {
        const categoryPath = path.join(process.cwd(), 'docs', category);
        if (!fs.existsSync(categoryPath)) return `### ${category} (0 files)`;

        const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.md'));
        return `### ${category} (${files.length} files)
- [Index](./${category}/INDEX.md)
- [README](./${category}/README.md)
${files.filter(file => file !== 'README.md' && file !== 'INDEX.md').map(file => `- [${file.replace('.md', '')}](./${category}/${file})`).join('\n')}`;
    }).join('\n\n')}

## 🔍 Tìm kiếm toàn bộ

\`\`\`bash
# Tìm kiếm trong toàn bộ docs
grep -r "keyword" ./docs/

# Tìm kiếm theo category
grep -r "keyword" ./docs/architecture/
grep -r "keyword" ./docs/deployment/
grep -r "keyword" ./docs/development/
\`\`\`

## 📊 Thống kê tổng thể

- **Tổng số category**: ${DOCS_CATEGORIES.length}
- **Tổng số file**: ${DOCS_CATEGORIES.reduce((total, category) => {
        const categoryPath = path.join(process.cwd(), 'docs', category);
        if (!fs.existsSync(categoryPath)) return total;
        const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.md'));
        return total + files.length;
    }, 0)}
- **Cập nhật cuối**: ${new Date().toISOString()}

---

*🗺️ Sitemap được tạo tự động bởi script cleanup-docs.cjs*
`;

    const sitemapPath = path.join(process.cwd(), 'docs', 'SITEMAP.md');
    fs.writeFileSync(sitemapPath, sitemapContent);
    console.log('✅ Tạo sitemap tổng thể');
}

// Tạo script npm
function createNpmScripts() {
    console.log('📦 Tạo npm scripts...');

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        console.warn('⚠️ Không tìm thấy package.json');
        return;
    }

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }

        packageJson.scripts['docs:organize'] = 'node scripts/organize-docs.cjs';
        packageJson.scripts['docs:cleanup'] = 'node scripts/cleanup-docs.cjs';
        packageJson.scripts['docs:update'] = 'npm run docs:organize && npm run docs:cleanup';
        packageJson.scripts['docs:validate'] = 'node scripts/validate-docs.cjs';

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Cập nhật package.json với docs scripts');
    } catch (error) {
        console.error('❌ Lỗi khi cập nhật package.json:', error.message);
    }
}

// Main function
function main() {
    console.log('🧹 Bắt đầu dọn dẹp và tối ưu hóa docs...\n');

    // 1. Xóa file trùng lặp
    removeDuplicateFiles();

    // 2. Đổi tên file không rõ ràng
    renameUnclearFiles();

    // 3. Tạo index cho từng category
    createCategoryIndexes();

    // 4. Tạo sitemap tổng thể
    createSitemap();

    // 5. Tạo npm scripts
    createNpmScripts();

    console.log('\n🎉 Hoàn thành dọn dẹp và tối ưu hóa docs!');
    console.log('📚 Xem kết quả tại: docs/');
    console.log('🗺️ Xem sitemap tại: docs/SITEMAP.md');
    console.log('📦 Chạy: npm run docs:update');
}

// Chạy script
if (require.main === module) {
    main();
}

module.exports = { main }; 