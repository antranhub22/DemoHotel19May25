'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === 'function' ? Iterator : Object).prototype
      );
    return (
      (g.next = verb(0)),
      (g['throw'] = verb(1)),
      (g['return'] = verb(2)),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.pool = exports.db = void 0;
var node_postgres_1 = require('drizzle-orm/node-postgres');
var better_sqlite3_1 = require('drizzle-orm/better-sqlite3');
var pg_1 = require('pg');
var better_sqlite3_2 = require('better-sqlite3');
var DATABASE_URL = process.env.DATABASE_URL;
var isProduction = process.env.NODE_ENV === 'production';
// Initialize database connection based on environment
var db;
var pool;
// Use SQLite for development if no DATABASE_URL is provided
if (!DATABASE_URL && !isProduction) {
  console.log('⏳ Using SQLite database for development');
  var sqlite = new better_sqlite3_2.default('./dev.db');
  exports.db = db = (0, better_sqlite3_1.drizzle)(sqlite);
} else if (!DATABASE_URL) {
  // Default connection string if DATABASE_URL is not provided
  var DEFAULT_DB_URL = 'postgres://postgres:postgres@localhost:5432/minhon';
  var dbUrl = DEFAULT_DB_URL;
  console.log(
    'Database connection using URL:',
    dbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://****:****@')
  );
  exports.pool = pool = new pg_1.Pool({
    connectionString: dbUrl,
  });
  // Test connection on startup
  (function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var client, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, pool.connect()];
          case 1:
            client = _a.sent();
            console.log('Database connection successful');
            client.release();
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error('Database connection failed:', error_1);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  })();
  exports.db = db = (0, node_postgres_1.drizzle)(pool);
} else {
  // Log connection information
  console.log(
    'Database connection using URL:',
    DATABASE_URL.replace(/:\/\/[^:]+:[^@]+@/, '://****:****@')
  );
  exports.pool = pool = new pg_1.Pool({
    connectionString: DATABASE_URL,
  });
  // Test connection on startup
  (function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var client, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, pool.connect()];
          case 1:
            client = _a.sent();
            console.log('Database connection successful');
            client.release();
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error('Database connection failed:', error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  })();
  exports.db = db = (0, node_postgres_1.drizzle)(pool);
}
