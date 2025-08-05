# 🚀 **CLEANUP QUICK REFERENCE**

**Quick checklist cho việc cleanup repo**

---

## ✅ **QUICK CHECKLIST**

### **📦 PHASE 1: BACKUP & SAFETY**

- [ ] 💾 Create backup: `cp -r . ../DemoHotel19May_BACKUP_$(date +%H%M%S)`
- [ ] 📊 Check current state: 30 dirs → goal ~10 dirs

### **🗂️ PHASE 2: ARCHIVE CLUTTER (5 minutes)**

```bash
# Archive old backup directories
mkdir -p archive/backups
mv backup-refactor/ archive/backups/     # 208KB
mv backup-files/ archive/backups/        # 28KB
mv database-files/ archive/backups/      # 244KB

# Archive reports
mkdir -p archive/reports
mv validation/ archive/reports/
mv reports/ archive/reports/
```

### **📚 PHASE 3: CONSOLIDATE DOCS (5 minutes)**

```bash
# Merge documentation into docs
mkdir -p docs
rsync -av documentation/ docs/
mv documentation/ archive/consolidated/
```

### **⚙️ PHASE 4: ORGANIZE CONFIG (3 minutes)**

```bash
# Move env files to config
mv env-files/ config/env-files/

# Move monitoring to tools
mkdir -p tools
mv monitoring/ tools/monitoring/
```

### **✅ PHASE 5: TEST (2 minutes)**

```bash
# Verify app still works
npm run build
npm run dev    # Check if starts
```

---

## 🎯 **EXPECTED OUTCOME**

**BEFORE:**

```
DemoHotel19May/
├── apps/                    ✅ Keep
├── packages/                ✅ Keep
├── backup-refactor/         ❌ Move to archive
├── backup-files/            ❌ Move to archive
├── database-files/          ❌ Move to archive
├── documentation/           ❌ Merge into docs
├── docs/                    ✅ Keep
├── validation/              ❌ Move to archive
├── reports/                 ❌ Move to archive
├── env-files/               ❌ Move to config
├── monitoring/              ❌ Move to tools
└── [20+ other dirs]         ❌ Various cleanup
```

**AFTER:**

```
DemoHotel19May/
├── apps/                    ✅ Applications
├── packages/                ✅ Shared code
├── config/                  ✅ Configuration
│   └── env-files/           ✅ Environment files
├── docs/                    ✅ All documentation
├── tools/                   ✅ Development tools
│   └── monitoring/          ✅ Monitoring tools
├── scripts/                 ✅ Build scripts
├── tests/                   ✅ Test files
├── prisma/                  ✅ Database
├── archive/                 ✅ Old files
│   ├── backups/             ✅ Old backup files
│   ├── reports/             ✅ Old reports
│   └── consolidated/        ✅ Merged docs
└── [core files]             ✅ package.json, etc.
```

---

## 🛡️ **SAFETY COMMANDS**

### **Check Progress:**

```bash
# Count directories
find . -maxdepth 1 -type d | wc -l

# Check backup exists
ls -la ../DemoHotel19May_BACKUP_*

# Test app builds
npm run build
```

### **Emergency Rollback:**

```bash
cd ..
rm -rf DemoHotel19May
cp -r DemoHotel19May_BACKUP_[timestamp] DemoHotel19May
cd DemoHotel19May
```

---

## ⏱️ **TIME ESTIMATE**

- **Phase 1 (Backup):** 2 minutes
- **Phase 2 (Archive):** 5 minutes
- **Phase 3 (Docs):** 5 minutes
- **Phase 4 (Config):** 3 minutes
- **Phase 5 (Test):** 2 minutes

**Total:** ~17 minutes for basic cleanup!

---

## 🎊 **BENEFITS GAINED**

✅ **Immediate:**

- Clean directory structure
- Easy file navigation
- No more confusion

✅ **Development:**

- Faster file finding
- Better git diffs
- Cleaner development experience

✅ **Team:**

- Easier onboarding
- Professional appearance
- Less mistakes from confusion

---

**🚀 Start with Phase 1 backup when ready!**
