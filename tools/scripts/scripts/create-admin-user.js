#!/usr/bin/env ts-node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var bcryptjs_1 = require("bcryptjs");
var readline_1 = require("readline");
var db_1 = require("../src/db");
var schema_1 = require("../src/db/schema");
var drizzle_orm_1 = require("drizzle-orm");
function prompt(question) {
    return __awaiter(this, void 0, void 0, function () {
        var rl;
        return __generator(this, function (_a) {
            rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
            return [2 /*return*/, new Promise(function (resolve) { return rl.question(question, function (ans) { rl.close(); resolve(ans); }); })];
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var email, password, tenantId, hash, now, found;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prompt('Admin email (default: admin@hotel.com): ')];
                case 1:
                    email = (_a.sent()) || 'admin@hotel.com';
                    return [4 /*yield*/, prompt('Admin password: ')];
                case 2:
                    password = _a.sent();
                    if (!password) {
                        console.error('Password is required!');
                        process.exit(1);
                    }
                    return [4 /*yield*/, prompt('Tenant ID (default: mi-nhon-hotel): ')];
                case 3:
                    tenantId = (_a.sent()) || 'mi-nhon-hotel';
                    return [4 /*yield*/, bcryptjs_1.default.hash(password, 10)];
                case 4:
                    hash = _a.sent();
                    now = new Date();
                    return [4 /*yield*/, db_1.db.select().from(schema_1.staff).where((0, drizzle_orm_1.eq)(schema_1.staff.username, email)).limit(1)];
                case 5:
                    found = _a.sent();
                    if (!(found.length > 0)) return [3 /*break*/, 7];
                    return [4 /*yield*/, db_1.db.update(schema_1.staff)
                            .set({ password: hash, role: 'admin', tenantId: tenantId, updatedAt: now })
                            .where((0, drizzle_orm_1.eq)(schema_1.staff.username, email))];
                case 6:
                    _a.sent();
                    console.log("\u2705 Updated admin user: ".concat(email, " (tenant: ").concat(tenantId, ")"));
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, db_1.db.insert(schema_1.staff).values({
                        username: email,
                        password: hash,
                        role: 'admin',
                        tenantId: tenantId,
                        name: 'Administrator',
                        email: email,
                        createdAt: now,
                        updatedAt: now
                    })];
                case 8:
                    _a.sent();
                    console.log("\u2705 Created new admin user: ".concat(email, " (tenant: ").concat(tenantId, ")"));
                    _a.label = 9;
                case 9:
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) { console.error('❌ Error:', err); process.exit(1); });
