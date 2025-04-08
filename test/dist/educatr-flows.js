var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/dotenv/package.json
var require_package = __commonJS({
  "node_modules/dotenv/package.json"(exports2, module2) {
    module2.exports = {
      name: "dotenv",
      version: "16.4.7",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        pretest: "npm run lint && npm run dts-check",
        test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000",
        "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@types/node": "^18.11.3",
        decache: "^4.6.2",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-version": "^9.5.0",
        tap: "^19.2.0",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports2, module2) {
    var fs2 = require("fs");
    var path = require("path");
    var os = require("os");
    var crypto = require("crypto");
    var packageJson = require_package();
    var version = packageJson.version;
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      const vaultPath = _vaultPath(options);
      const result = DotenvModule.configDotenv({ path: vaultPath });
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _log(message) {
      console.log(`[dotenv@${version}][INFO] ${message}`);
    }
    function _warn(message) {
      console.log(`[dotenv@${version}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs2.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
      }
      if (fs2.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      _log("Loading env from encrypted .env.vault");
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      const debug = Boolean(options && options.debug);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path2 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs2.readFileSync(path2, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${path2} ${e.message}`);
          }
          lastError = e;
        }
      }
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsedAll, options);
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
        }
      }
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse,
      populate
    };
    module2.exports.configDotenv = DotenvModule.configDotenv;
    module2.exports._configVault = DotenvModule._configVault;
    module2.exports._parseVault = DotenvModule._parseVault;
    module2.exports.config = DotenvModule.config;
    module2.exports.decrypt = DotenvModule.decrypt;
    module2.exports.parse = DotenvModule.parse;
    module2.exports.populate = DotenvModule.populate;
    module2.exports = DotenvModule;
  }
});

// node_modules/dotenv/lib/env-options.js
var require_env_options = __commonJS({
  "node_modules/dotenv/lib/env-options.js"(exports2, module2) {
    var options = {};
    if (process.env.DOTENV_CONFIG_ENCODING != null) {
      options.encoding = process.env.DOTENV_CONFIG_ENCODING;
    }
    if (process.env.DOTENV_CONFIG_PATH != null) {
      options.path = process.env.DOTENV_CONFIG_PATH;
    }
    if (process.env.DOTENV_CONFIG_DEBUG != null) {
      options.debug = process.env.DOTENV_CONFIG_DEBUG;
    }
    if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
      options.override = process.env.DOTENV_CONFIG_OVERRIDE;
    }
    if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
      options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
    }
    module2.exports = options;
  }
});

// node_modules/dotenv/lib/cli-options.js
var require_cli_options = __commonJS({
  "node_modules/dotenv/lib/cli-options.js"(exports2, module2) {
    var re = /^dotenv_config_(encoding|path|debug|override|DOTENV_KEY)=(.+)$/;
    module2.exports = function optionMatcher(args) {
      return args.reduce(function(acc, cur) {
        const matches = cur.match(re);
        if (matches) {
          acc[matches[1]] = matches[2];
        }
        return acc;
      }, {});
    };
  }
});

// node_modules/csv-parser/index.js
var require_csv_parser = __commonJS({
  "node_modules/csv-parser/index.js"(exports2, module2) {
    var { Transform } = require("stream");
    var [cr] = Buffer.from("\r");
    var [nl] = Buffer.from("\n");
    var defaults = {
      escape: '"',
      headers: null,
      mapHeaders: ({ header }) => header,
      mapValues: ({ value }) => value,
      newline: "\n",
      quote: '"',
      raw: false,
      separator: ",",
      skipComments: false,
      skipLines: null,
      maxRowBytes: Number.MAX_SAFE_INTEGER,
      strict: false
    };
    var CsvParser = class extends Transform {
      constructor(opts = {}) {
        super({ objectMode: true, highWaterMark: 16 });
        if (Array.isArray(opts))
          opts = { headers: opts };
        const options = Object.assign({}, defaults, opts);
        options.customNewline = options.newline !== defaults.newline;
        for (const key of ["newline", "quote", "separator"]) {
          if (typeof options[key] !== "undefined") {
            [options[key]] = Buffer.from(options[key]);
          }
        }
        options.escape = (opts || {}).escape ? Buffer.from(options.escape)[0] : options.quote;
        this.state = {
          empty: options.raw ? Buffer.alloc(0) : "",
          escaped: false,
          first: true,
          lineNumber: 0,
          previousEnd: 0,
          rowLength: 0,
          quoted: false
        };
        this._prev = null;
        if (options.headers === false) {
          options.strict = false;
        }
        if (options.headers || options.headers === false) {
          this.state.first = false;
        }
        this.options = options;
        this.headers = options.headers;
      }
      parseCell(buffer, start, end) {
        const { escape, quote } = this.options;
        if (buffer[start] === quote && buffer[end - 1] === quote) {
          start++;
          end--;
        }
        let y = start;
        for (let i = start; i < end; i++) {
          if (buffer[i] === escape && i + 1 < end && buffer[i + 1] === quote) {
            i++;
          }
          if (y !== i) {
            buffer[y] = buffer[i];
          }
          y++;
        }
        return this.parseValue(buffer, start, y);
      }
      parseLine(buffer, start, end) {
        const { customNewline, escape, mapHeaders, mapValues, quote, separator, skipComments, skipLines } = this.options;
        end--;
        if (!customNewline && buffer.length && buffer[end - 1] === cr) {
          end--;
        }
        const comma = separator;
        const cells = [];
        let isQuoted = false;
        let offset = start;
        if (skipComments) {
          const char = typeof skipComments === "string" ? skipComments : "#";
          if (buffer[start] === Buffer.from(char)[0]) {
            return;
          }
        }
        const mapValue = (value) => {
          if (this.state.first) {
            return value;
          }
          const index = cells.length;
          const header = this.headers[index];
          return mapValues({ header, index, value });
        };
        for (let i = start; i < end; i++) {
          const isStartingQuote = !isQuoted && buffer[i] === quote;
          const isEndingQuote = isQuoted && buffer[i] === quote && i + 1 <= end && buffer[i + 1] === comma;
          const isEscape = isQuoted && buffer[i] === escape && i + 1 < end && buffer[i + 1] === quote;
          if (isStartingQuote || isEndingQuote) {
            isQuoted = !isQuoted;
            continue;
          } else if (isEscape) {
            i++;
            continue;
          }
          if (buffer[i] === comma && !isQuoted) {
            let value = this.parseCell(buffer, offset, i);
            value = mapValue(value);
            cells.push(value);
            offset = i + 1;
          }
        }
        if (offset < end) {
          let value = this.parseCell(buffer, offset, end);
          value = mapValue(value);
          cells.push(value);
        }
        if (buffer[end - 1] === comma) {
          cells.push(mapValue(this.state.empty));
        }
        const skip = skipLines && skipLines > this.state.lineNumber;
        this.state.lineNumber++;
        if (this.state.first && !skip) {
          this.state.first = false;
          this.headers = cells.map((header, index) => mapHeaders({ header, index }));
          this.emit("headers", this.headers);
          return;
        }
        if (!skip && this.options.strict && cells.length !== this.headers.length) {
          const e = new RangeError("Row length does not match headers");
          this.emit("error", e);
        } else {
          if (!skip)
            this.writeRow(cells);
        }
      }
      parseValue(buffer, start, end) {
        if (this.options.raw) {
          return buffer.slice(start, end);
        }
        return buffer.toString("utf-8", start, end);
      }
      writeRow(cells) {
        const headers = this.headers === false ? cells.map((value, index) => index) : this.headers;
        const row = cells.reduce((o, cell, index) => {
          const header = headers[index];
          if (header === null)
            return o;
          if (header !== void 0) {
            o[header] = cell;
          } else {
            o[`_${index}`] = cell;
          }
          return o;
        }, {});
        this.push(row);
      }
      _flush(cb) {
        if (this.state.escaped || !this._prev)
          return cb();
        this.parseLine(this._prev, this.state.previousEnd, this._prev.length + 1);
        cb();
      }
      _transform(data, enc, cb) {
        if (typeof data === "string") {
          data = Buffer.from(data);
        }
        const { escape, quote } = this.options;
        let start = 0;
        let buffer = data;
        if (this._prev) {
          start = this._prev.length;
          buffer = Buffer.concat([this._prev, data]);
          this._prev = null;
        }
        const bufferLength = buffer.length;
        for (let i = start; i < bufferLength; i++) {
          const chr = buffer[i];
          const nextChr = i + 1 < bufferLength ? buffer[i + 1] : null;
          this.state.rowLength++;
          if (this.state.rowLength > this.options.maxRowBytes) {
            return cb(new Error("Row exceeds the maximum size"));
          }
          if (!this.state.escaped && chr === escape && nextChr === quote && i !== start) {
            this.state.escaped = true;
            continue;
          } else if (chr === quote) {
            if (this.state.escaped) {
              this.state.escaped = false;
            } else {
              this.state.quoted = !this.state.quoted;
            }
            continue;
          }
          if (!this.state.quoted) {
            if (this.state.first && !this.options.customNewline) {
              if (chr === nl) {
                this.options.newline = nl;
              } else if (chr === cr) {
                if (nextChr !== nl) {
                  this.options.newline = cr;
                }
              }
            }
            if (chr === this.options.newline) {
              this.parseLine(buffer, this.state.previousEnd, i + 1);
              this.state.previousEnd = i + 1;
              this.state.rowLength = 0;
            }
          }
        }
        if (this.state.previousEnd === bufferLength) {
          this.state.previousEnd = 0;
          return cb();
        }
        if (bufferLength - this.state.previousEnd < data.length) {
          this._prev = data;
          this.state.previousEnd -= bufferLength - data.length;
          return cb();
        }
        this._prev = buffer;
        cb();
      }
    };
    module2.exports = (opts) => new CsvParser(opts);
  }
});

// node_modules/graceful-fs/polyfills.js
var require_polyfills = __commonJS({
  "node_modules/graceful-fs/polyfills.js"(exports2, module2) {
    var constants = require("constants");
    var origCwd = process.cwd;
    var cwd = null;
    var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
    process.cwd = function() {
      if (!cwd)
        cwd = origCwd.call(process);
      return cwd;
    };
    try {
      process.cwd();
    } catch (er) {
    }
    if (typeof process.chdir === "function") {
      chdir = process.chdir;
      process.chdir = function(d) {
        cwd = null;
        chdir.call(process, d);
      };
      if (Object.setPrototypeOf)
        Object.setPrototypeOf(process.chdir, chdir);
    }
    var chdir;
    module2.exports = patch;
    function patch(fs2) {
      if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
        patchLchmod(fs2);
      }
      if (!fs2.lutimes) {
        patchLutimes(fs2);
      }
      fs2.chown = chownFix(fs2.chown);
      fs2.fchown = chownFix(fs2.fchown);
      fs2.lchown = chownFix(fs2.lchown);
      fs2.chmod = chmodFix(fs2.chmod);
      fs2.fchmod = chmodFix(fs2.fchmod);
      fs2.lchmod = chmodFix(fs2.lchmod);
      fs2.chownSync = chownFixSync(fs2.chownSync);
      fs2.fchownSync = chownFixSync(fs2.fchownSync);
      fs2.lchownSync = chownFixSync(fs2.lchownSync);
      fs2.chmodSync = chmodFixSync(fs2.chmodSync);
      fs2.fchmodSync = chmodFixSync(fs2.fchmodSync);
      fs2.lchmodSync = chmodFixSync(fs2.lchmodSync);
      fs2.stat = statFix(fs2.stat);
      fs2.fstat = statFix(fs2.fstat);
      fs2.lstat = statFix(fs2.lstat);
      fs2.statSync = statFixSync(fs2.statSync);
      fs2.fstatSync = statFixSync(fs2.fstatSync);
      fs2.lstatSync = statFixSync(fs2.lstatSync);
      if (fs2.chmod && !fs2.lchmod) {
        fs2.lchmod = function(path, mode, cb) {
          if (cb)
            process.nextTick(cb);
        };
        fs2.lchmodSync = function() {
        };
      }
      if (fs2.chown && !fs2.lchown) {
        fs2.lchown = function(path, uid, gid, cb) {
          if (cb)
            process.nextTick(cb);
        };
        fs2.lchownSync = function() {
        };
      }
      if (platform === "win32") {
        fs2.rename = typeof fs2.rename !== "function" ? fs2.rename : function(fs$rename) {
          function rename(from, to, cb) {
            var start = Date.now();
            var backoff = 0;
            fs$rename(from, to, function CB(er) {
              if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 6e4) {
                setTimeout(function() {
                  fs2.stat(to, function(stater, st) {
                    if (stater && stater.code === "ENOENT")
                      fs$rename(from, to, CB);
                    else
                      cb(er);
                  });
                }, backoff);
                if (backoff < 100)
                  backoff += 10;
                return;
              }
              if (cb)
                cb(er);
            });
          }
          if (Object.setPrototypeOf)
            Object.setPrototypeOf(rename, fs$rename);
          return rename;
        }(fs2.rename);
      }
      fs2.read = typeof fs2.read !== "function" ? fs2.read : function(fs$read) {
        function read(fd, buffer, offset, length, position, callback_) {
          var callback;
          if (callback_ && typeof callback_ === "function") {
            var eagCounter = 0;
            callback = function(er, _, __) {
              if (er && er.code === "EAGAIN" && eagCounter < 10) {
                eagCounter++;
                return fs$read.call(fs2, fd, buffer, offset, length, position, callback);
              }
              callback_.apply(this, arguments);
            };
          }
          return fs$read.call(fs2, fd, buffer, offset, length, position, callback);
        }
        if (Object.setPrototypeOf)
          Object.setPrototypeOf(read, fs$read);
        return read;
      }(fs2.read);
      fs2.readSync = typeof fs2.readSync !== "function" ? fs2.readSync : /* @__PURE__ */ function(fs$readSync) {
        return function(fd, buffer, offset, length, position) {
          var eagCounter = 0;
          while (true) {
            try {
              return fs$readSync.call(fs2, fd, buffer, offset, length, position);
            } catch (er) {
              if (er.code === "EAGAIN" && eagCounter < 10) {
                eagCounter++;
                continue;
              }
              throw er;
            }
          }
        };
      }(fs2.readSync);
      function patchLchmod(fs3) {
        fs3.lchmod = function(path, mode, callback) {
          fs3.open(
            path,
            constants.O_WRONLY | constants.O_SYMLINK,
            mode,
            function(err, fd) {
              if (err) {
                if (callback)
                  callback(err);
                return;
              }
              fs3.fchmod(fd, mode, function(err2) {
                fs3.close(fd, function(err22) {
                  if (callback)
                    callback(err2 || err22);
                });
              });
            }
          );
        };
        fs3.lchmodSync = function(path, mode) {
          var fd = fs3.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
          var threw = true;
          var ret;
          try {
            ret = fs3.fchmodSync(fd, mode);
            threw = false;
          } finally {
            if (threw) {
              try {
                fs3.closeSync(fd);
              } catch (er) {
              }
            } else {
              fs3.closeSync(fd);
            }
          }
          return ret;
        };
      }
      function patchLutimes(fs3) {
        if (constants.hasOwnProperty("O_SYMLINK") && fs3.futimes) {
          fs3.lutimes = function(path, at, mt, cb) {
            fs3.open(path, constants.O_SYMLINK, function(er, fd) {
              if (er) {
                if (cb)
                  cb(er);
                return;
              }
              fs3.futimes(fd, at, mt, function(er2) {
                fs3.close(fd, function(er22) {
                  if (cb)
                    cb(er2 || er22);
                });
              });
            });
          };
          fs3.lutimesSync = function(path, at, mt) {
            var fd = fs3.openSync(path, constants.O_SYMLINK);
            var ret;
            var threw = true;
            try {
              ret = fs3.futimesSync(fd, at, mt);
              threw = false;
            } finally {
              if (threw) {
                try {
                  fs3.closeSync(fd);
                } catch (er) {
                }
              } else {
                fs3.closeSync(fd);
              }
            }
            return ret;
          };
        } else if (fs3.futimes) {
          fs3.lutimes = function(_a, _b, _c, cb) {
            if (cb)
              process.nextTick(cb);
          };
          fs3.lutimesSync = function() {
          };
        }
      }
      function chmodFix(orig) {
        if (!orig)
          return orig;
        return function(target, mode, cb) {
          return orig.call(fs2, target, mode, function(er) {
            if (chownErOk(er))
              er = null;
            if (cb)
              cb.apply(this, arguments);
          });
        };
      }
      function chmodFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, mode) {
          try {
            return orig.call(fs2, target, mode);
          } catch (er) {
            if (!chownErOk(er))
              throw er;
          }
        };
      }
      function chownFix(orig) {
        if (!orig)
          return orig;
        return function(target, uid, gid, cb) {
          return orig.call(fs2, target, uid, gid, function(er) {
            if (chownErOk(er))
              er = null;
            if (cb)
              cb.apply(this, arguments);
          });
        };
      }
      function chownFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, uid, gid) {
          try {
            return orig.call(fs2, target, uid, gid);
          } catch (er) {
            if (!chownErOk(er))
              throw er;
          }
        };
      }
      function statFix(orig) {
        if (!orig)
          return orig;
        return function(target, options, cb) {
          if (typeof options === "function") {
            cb = options;
            options = null;
          }
          function callback(er, stats) {
            if (stats) {
              if (stats.uid < 0)
                stats.uid += 4294967296;
              if (stats.gid < 0)
                stats.gid += 4294967296;
            }
            if (cb)
              cb.apply(this, arguments);
          }
          return options ? orig.call(fs2, target, options, callback) : orig.call(fs2, target, callback);
        };
      }
      function statFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, options) {
          var stats = options ? orig.call(fs2, target, options) : orig.call(fs2, target);
          if (stats) {
            if (stats.uid < 0)
              stats.uid += 4294967296;
            if (stats.gid < 0)
              stats.gid += 4294967296;
          }
          return stats;
        };
      }
      function chownErOk(er) {
        if (!er)
          return true;
        if (er.code === "ENOSYS")
          return true;
        var nonroot = !process.getuid || process.getuid() !== 0;
        if (nonroot) {
          if (er.code === "EINVAL" || er.code === "EPERM")
            return true;
        }
        return false;
      }
    }
  }
});

// node_modules/graceful-fs/legacy-streams.js
var require_legacy_streams = __commonJS({
  "node_modules/graceful-fs/legacy-streams.js"(exports2, module2) {
    var Stream = require("stream").Stream;
    module2.exports = legacy;
    function legacy(fs2) {
      return {
        ReadStream,
        WriteStream
      };
      function ReadStream(path, options) {
        if (!(this instanceof ReadStream))
          return new ReadStream(path, options);
        Stream.call(this);
        var self = this;
        this.path = path;
        this.fd = null;
        this.readable = true;
        this.paused = false;
        this.flags = "r";
        this.mode = 438;
        this.bufferSize = 64 * 1024;
        options = options || {};
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
        if (this.encoding)
          this.setEncoding(this.encoding);
        if (this.start !== void 0) {
          if ("number" !== typeof this.start) {
            throw TypeError("start must be a Number");
          }
          if (this.end === void 0) {
            this.end = Infinity;
          } else if ("number" !== typeof this.end) {
            throw TypeError("end must be a Number");
          }
          if (this.start > this.end) {
            throw new Error("start must be <= end");
          }
          this.pos = this.start;
        }
        if (this.fd !== null) {
          process.nextTick(function() {
            self._read();
          });
          return;
        }
        fs2.open(this.path, this.flags, this.mode, function(err, fd) {
          if (err) {
            self.emit("error", err);
            self.readable = false;
            return;
          }
          self.fd = fd;
          self.emit("open", fd);
          self._read();
        });
      }
      function WriteStream(path, options) {
        if (!(this instanceof WriteStream))
          return new WriteStream(path, options);
        Stream.call(this);
        this.path = path;
        this.fd = null;
        this.writable = true;
        this.flags = "w";
        this.encoding = "binary";
        this.mode = 438;
        this.bytesWritten = 0;
        options = options || {};
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
        if (this.start !== void 0) {
          if ("number" !== typeof this.start) {
            throw TypeError("start must be a Number");
          }
          if (this.start < 0) {
            throw new Error("start must be >= zero");
          }
          this.pos = this.start;
        }
        this.busy = false;
        this._queue = [];
        if (this.fd === null) {
          this._open = fs2.open;
          this._queue.push([this._open, this.path, this.flags, this.mode, void 0]);
          this.flush();
        }
      }
    }
  }
});

// node_modules/graceful-fs/clone.js
var require_clone = __commonJS({
  "node_modules/graceful-fs/clone.js"(exports2, module2) {
    "use strict";
    module2.exports = clone;
    var getPrototypeOf = Object.getPrototypeOf || function(obj) {
      return obj.__proto__;
    };
    function clone(obj) {
      if (obj === null || typeof obj !== "object")
        return obj;
      if (obj instanceof Object)
        var copy = { __proto__: getPrototypeOf(obj) };
      else
        var copy = /* @__PURE__ */ Object.create(null);
      Object.getOwnPropertyNames(obj).forEach(function(key) {
        Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
      });
      return copy;
    }
  }
});

// node_modules/graceful-fs/graceful-fs.js
var require_graceful_fs = __commonJS({
  "node_modules/graceful-fs/graceful-fs.js"(exports2, module2) {
    var fs2 = require("fs");
    var polyfills = require_polyfills();
    var legacy = require_legacy_streams();
    var clone = require_clone();
    var util = require("util");
    var gracefulQueue;
    var previousSymbol;
    if (typeof Symbol === "function" && typeof Symbol.for === "function") {
      gracefulQueue = Symbol.for("graceful-fs.queue");
      previousSymbol = Symbol.for("graceful-fs.previous");
    } else {
      gracefulQueue = "___graceful-fs.queue";
      previousSymbol = "___graceful-fs.previous";
    }
    function noop() {
    }
    function publishQueue(context, queue2) {
      Object.defineProperty(context, gracefulQueue, {
        get: function() {
          return queue2;
        }
      });
    }
    var debug = noop;
    if (util.debuglog)
      debug = util.debuglog("gfs4");
    else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
      debug = function() {
        var m = util.format.apply(util, arguments);
        m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
        console.error(m);
      };
    if (!fs2[gracefulQueue]) {
      queue = global[gracefulQueue] || [];
      publishQueue(fs2, queue);
      fs2.close = function(fs$close) {
        function close(fd, cb) {
          return fs$close.call(fs2, fd, function(err) {
            if (!err) {
              resetQueue();
            }
            if (typeof cb === "function")
              cb.apply(this, arguments);
          });
        }
        Object.defineProperty(close, previousSymbol, {
          value: fs$close
        });
        return close;
      }(fs2.close);
      fs2.closeSync = function(fs$closeSync) {
        function closeSync(fd) {
          fs$closeSync.apply(fs2, arguments);
          resetQueue();
        }
        Object.defineProperty(closeSync, previousSymbol, {
          value: fs$closeSync
        });
        return closeSync;
      }(fs2.closeSync);
      if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
        process.on("exit", function() {
          debug(fs2[gracefulQueue]);
          require("assert").equal(fs2[gracefulQueue].length, 0);
        });
      }
    }
    var queue;
    if (!global[gracefulQueue]) {
      publishQueue(global, fs2[gracefulQueue]);
    }
    module2.exports = patch(clone(fs2));
    if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs2.__patched) {
      module2.exports = patch(fs2);
      fs2.__patched = true;
    }
    function patch(fs3) {
      polyfills(fs3);
      fs3.gracefulify = patch;
      fs3.createReadStream = createReadStream2;
      fs3.createWriteStream = createWriteStream;
      var fs$readFile = fs3.readFile;
      fs3.readFile = readFile;
      function readFile(path, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$readFile(path, options, cb);
        function go$readFile(path2, options2, cb2, startTime) {
          return fs$readFile(path2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$readFile, [path2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$writeFile = fs3.writeFile;
      fs3.writeFile = writeFile;
      function writeFile(path, data, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$writeFile(path, data, options, cb);
        function go$writeFile(path2, data2, options2, cb2, startTime) {
          return fs$writeFile(path2, data2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$writeFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$appendFile = fs3.appendFile;
      if (fs$appendFile)
        fs3.appendFile = appendFile;
      function appendFile(path, data, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$appendFile(path, data, options, cb);
        function go$appendFile(path2, data2, options2, cb2, startTime) {
          return fs$appendFile(path2, data2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$appendFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$copyFile = fs3.copyFile;
      if (fs$copyFile)
        fs3.copyFile = copyFile;
      function copyFile(src, dest, flags, cb) {
        if (typeof flags === "function") {
          cb = flags;
          flags = 0;
        }
        return go$copyFile(src, dest, flags, cb);
        function go$copyFile(src2, dest2, flags2, cb2, startTime) {
          return fs$copyFile(src2, dest2, flags2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$readdir = fs3.readdir;
      fs3.readdir = readdir;
      var noReaddirOptionVersions = /^v[0-5]\./;
      function readdir(path, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir2(path2, options2, cb2, startTime) {
          return fs$readdir(path2, fs$readdirCallback(
            path2,
            options2,
            cb2,
            startTime
          ));
        } : function go$readdir2(path2, options2, cb2, startTime) {
          return fs$readdir(path2, options2, fs$readdirCallback(
            path2,
            options2,
            cb2,
            startTime
          ));
        };
        return go$readdir(path, options, cb);
        function fs$readdirCallback(path2, options2, cb2, startTime) {
          return function(err, files) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([
                go$readdir,
                [path2, options2, cb2],
                err,
                startTime || Date.now(),
                Date.now()
              ]);
            else {
              if (files && files.sort)
                files.sort();
              if (typeof cb2 === "function")
                cb2.call(this, err, files);
            }
          };
        }
      }
      if (process.version.substr(0, 4) === "v0.8") {
        var legStreams = legacy(fs3);
        ReadStream = legStreams.ReadStream;
        WriteStream = legStreams.WriteStream;
      }
      var fs$ReadStream = fs3.ReadStream;
      if (fs$ReadStream) {
        ReadStream.prototype = Object.create(fs$ReadStream.prototype);
        ReadStream.prototype.open = ReadStream$open;
      }
      var fs$WriteStream = fs3.WriteStream;
      if (fs$WriteStream) {
        WriteStream.prototype = Object.create(fs$WriteStream.prototype);
        WriteStream.prototype.open = WriteStream$open;
      }
      Object.defineProperty(fs3, "ReadStream", {
        get: function() {
          return ReadStream;
        },
        set: function(val) {
          ReadStream = val;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(fs3, "WriteStream", {
        get: function() {
          return WriteStream;
        },
        set: function(val) {
          WriteStream = val;
        },
        enumerable: true,
        configurable: true
      });
      var FileReadStream = ReadStream;
      Object.defineProperty(fs3, "FileReadStream", {
        get: function() {
          return FileReadStream;
        },
        set: function(val) {
          FileReadStream = val;
        },
        enumerable: true,
        configurable: true
      });
      var FileWriteStream = WriteStream;
      Object.defineProperty(fs3, "FileWriteStream", {
        get: function() {
          return FileWriteStream;
        },
        set: function(val) {
          FileWriteStream = val;
        },
        enumerable: true,
        configurable: true
      });
      function ReadStream(path, options) {
        if (this instanceof ReadStream)
          return fs$ReadStream.apply(this, arguments), this;
        else
          return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
      }
      function ReadStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            if (that.autoClose)
              that.destroy();
            that.emit("error", err);
          } else {
            that.fd = fd;
            that.emit("open", fd);
            that.read();
          }
        });
      }
      function WriteStream(path, options) {
        if (this instanceof WriteStream)
          return fs$WriteStream.apply(this, arguments), this;
        else
          return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
      }
      function WriteStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            that.destroy();
            that.emit("error", err);
          } else {
            that.fd = fd;
            that.emit("open", fd);
          }
        });
      }
      function createReadStream2(path, options) {
        return new fs3.ReadStream(path, options);
      }
      function createWriteStream(path, options) {
        return new fs3.WriteStream(path, options);
      }
      var fs$open = fs3.open;
      fs3.open = open;
      function open(path, flags, mode, cb) {
        if (typeof mode === "function")
          cb = mode, mode = null;
        return go$open(path, flags, mode, cb);
        function go$open(path2, flags2, mode2, cb2, startTime) {
          return fs$open(path2, flags2, mode2, function(err, fd) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$open, [path2, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      return fs3;
    }
    function enqueue(elem) {
      debug("ENQUEUE", elem[0].name, elem[1]);
      fs2[gracefulQueue].push(elem);
      retry();
    }
    var retryTimer;
    function resetQueue() {
      var now = Date.now();
      for (var i = 0; i < fs2[gracefulQueue].length; ++i) {
        if (fs2[gracefulQueue][i].length > 2) {
          fs2[gracefulQueue][i][3] = now;
          fs2[gracefulQueue][i][4] = now;
        }
      }
      retry();
    }
    function retry() {
      clearTimeout(retryTimer);
      retryTimer = void 0;
      if (fs2[gracefulQueue].length === 0)
        return;
      var elem = fs2[gracefulQueue].shift();
      var fn = elem[0];
      var args = elem[1];
      var err = elem[2];
      var startTime = elem[3];
      var lastTime = elem[4];
      if (startTime === void 0) {
        debug("RETRY", fn.name, args);
        fn.apply(null, args);
      } else if (Date.now() - startTime >= 6e4) {
        debug("TIMEOUT", fn.name, args);
        var cb = args.pop();
        if (typeof cb === "function")
          cb.call(null, err);
      } else {
        var sinceAttempt = Date.now() - lastTime;
        var sinceStart = Math.max(lastTime - startTime, 1);
        var desiredDelay = Math.min(sinceStart * 1.2, 100);
        if (sinceAttempt >= desiredDelay) {
          debug("RETRY", fn.name, args);
          fn.apply(null, args.concat([startTime]));
        } else {
          fs2[gracefulQueue].push(elem);
        }
      }
      if (retryTimer === void 0) {
        retryTimer = setTimeout(retry, 0);
      }
    }
  }
});

// node_modules/retry/lib/retry_operation.js
var require_retry_operation = __commonJS({
  "node_modules/retry/lib/retry_operation.js"(exports2, module2) {
    function RetryOperation(timeouts, options) {
      if (typeof options === "boolean") {
        options = { forever: options };
      }
      this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
      this._timeouts = timeouts;
      this._options = options || {};
      this._maxRetryTime = options && options.maxRetryTime || Infinity;
      this._fn = null;
      this._errors = [];
      this._attempts = 1;
      this._operationTimeout = null;
      this._operationTimeoutCb = null;
      this._timeout = null;
      this._operationStart = null;
      if (this._options.forever) {
        this._cachedTimeouts = this._timeouts.slice(0);
      }
    }
    module2.exports = RetryOperation;
    RetryOperation.prototype.reset = function() {
      this._attempts = 1;
      this._timeouts = this._originalTimeouts;
    };
    RetryOperation.prototype.stop = function() {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      this._timeouts = [];
      this._cachedTimeouts = null;
    };
    RetryOperation.prototype.retry = function(err) {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (!err) {
        return false;
      }
      var currentTime = (/* @__PURE__ */ new Date()).getTime();
      if (err && currentTime - this._operationStart >= this._maxRetryTime) {
        this._errors.unshift(new Error("RetryOperation timeout occurred"));
        return false;
      }
      this._errors.push(err);
      var timeout = this._timeouts.shift();
      if (timeout === void 0) {
        if (this._cachedTimeouts) {
          this._errors.splice(this._errors.length - 1, this._errors.length);
          this._timeouts = this._cachedTimeouts.slice(0);
          timeout = this._timeouts.shift();
        } else {
          return false;
        }
      }
      var self = this;
      var timer = setTimeout(function() {
        self._attempts++;
        if (self._operationTimeoutCb) {
          self._timeout = setTimeout(function() {
            self._operationTimeoutCb(self._attempts);
          }, self._operationTimeout);
          if (self._options.unref) {
            self._timeout.unref();
          }
        }
        self._fn(self._attempts);
      }, timeout);
      if (this._options.unref) {
        timer.unref();
      }
      return true;
    };
    RetryOperation.prototype.attempt = function(fn, timeoutOps) {
      this._fn = fn;
      if (timeoutOps) {
        if (timeoutOps.timeout) {
          this._operationTimeout = timeoutOps.timeout;
        }
        if (timeoutOps.cb) {
          this._operationTimeoutCb = timeoutOps.cb;
        }
      }
      var self = this;
      if (this._operationTimeoutCb) {
        this._timeout = setTimeout(function() {
          self._operationTimeoutCb();
        }, self._operationTimeout);
      }
      this._operationStart = (/* @__PURE__ */ new Date()).getTime();
      this._fn(this._attempts);
    };
    RetryOperation.prototype.try = function(fn) {
      console.log("Using RetryOperation.try() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = function(fn) {
      console.log("Using RetryOperation.start() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = RetryOperation.prototype.try;
    RetryOperation.prototype.errors = function() {
      return this._errors;
    };
    RetryOperation.prototype.attempts = function() {
      return this._attempts;
    };
    RetryOperation.prototype.mainError = function() {
      if (this._errors.length === 0) {
        return null;
      }
      var counts = {};
      var mainError = null;
      var mainErrorCount = 0;
      for (var i = 0; i < this._errors.length; i++) {
        var error = this._errors[i];
        var message = error.message;
        var count = (counts[message] || 0) + 1;
        counts[message] = count;
        if (count >= mainErrorCount) {
          mainError = error;
          mainErrorCount = count;
        }
      }
      return mainError;
    };
  }
});

// node_modules/retry/lib/retry.js
var require_retry = __commonJS({
  "node_modules/retry/lib/retry.js"(exports2) {
    var RetryOperation = require_retry_operation();
    exports2.operation = function(options) {
      var timeouts = exports2.timeouts(options);
      return new RetryOperation(timeouts, {
        forever: options && options.forever,
        unref: options && options.unref,
        maxRetryTime: options && options.maxRetryTime
      });
    };
    exports2.timeouts = function(options) {
      if (options instanceof Array) {
        return [].concat(options);
      }
      var opts = {
        retries: 10,
        factor: 2,
        minTimeout: 1 * 1e3,
        maxTimeout: Infinity,
        randomize: false
      };
      for (var key in options) {
        opts[key] = options[key];
      }
      if (opts.minTimeout > opts.maxTimeout) {
        throw new Error("minTimeout is greater than maxTimeout");
      }
      var timeouts = [];
      for (var i = 0; i < opts.retries; i++) {
        timeouts.push(this.createTimeout(i, opts));
      }
      if (options && options.forever && !timeouts.length) {
        timeouts.push(this.createTimeout(i, opts));
      }
      timeouts.sort(function(a, b) {
        return a - b;
      });
      return timeouts;
    };
    exports2.createTimeout = function(attempt, opts) {
      var random = opts.randomize ? Math.random() + 1 : 1;
      var timeout = Math.round(random * opts.minTimeout * Math.pow(opts.factor, attempt));
      timeout = Math.min(timeout, opts.maxTimeout);
      return timeout;
    };
    exports2.wrap = function(obj, options, methods) {
      if (options instanceof Array) {
        methods = options;
        options = null;
      }
      if (!methods) {
        methods = [];
        for (var key in obj) {
          if (typeof obj[key] === "function") {
            methods.push(key);
          }
        }
      }
      for (var i = 0; i < methods.length; i++) {
        var method = methods[i];
        var original = obj[method];
        obj[method] = function retryWrapper(original2) {
          var op = exports2.operation(options);
          var args = Array.prototype.slice.call(arguments, 1);
          var callback = args.pop();
          args.push(function(err) {
            if (op.retry(err)) {
              return;
            }
            if (err) {
              arguments[0] = op.mainError();
            }
            callback.apply(this, arguments);
          });
          op.attempt(function() {
            original2.apply(obj, args);
          });
        }.bind(obj, original);
        obj[method].options = options;
      }
    };
  }
});

// node_modules/retry/index.js
var require_retry2 = __commonJS({
  "node_modules/retry/index.js"(exports2, module2) {
    module2.exports = require_retry();
  }
});

// node_modules/signal-exit/signals.js
var require_signals = __commonJS({
  "node_modules/signal-exit/signals.js"(exports2, module2) {
    module2.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ];
    if (process.platform !== "win32") {
      module2.exports.push(
        "SIGVTALRM",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGUSR2",
        "SIGTRAP",
        "SIGSYS",
        "SIGQUIT",
        "SIGIOT"
        // should detect profiler and enable/disable accordingly.
        // see #21
        // 'SIGPROF'
      );
    }
    if (process.platform === "linux") {
      module2.exports.push(
        "SIGIO",
        "SIGPOLL",
        "SIGPWR",
        "SIGSTKFLT",
        "SIGUNUSED"
      );
    }
  }
});

// node_modules/signal-exit/index.js
var require_signal_exit = __commonJS({
  "node_modules/signal-exit/index.js"(exports2, module2) {
    var process2 = global.process;
    var processOk = function(process3) {
      return process3 && typeof process3 === "object" && typeof process3.removeListener === "function" && typeof process3.emit === "function" && typeof process3.reallyExit === "function" && typeof process3.listeners === "function" && typeof process3.kill === "function" && typeof process3.pid === "number" && typeof process3.on === "function";
    };
    if (!processOk(process2)) {
      module2.exports = function() {
        return function() {
        };
      };
    } else {
      assert = require("assert");
      signals = require_signals();
      isWin = /^win/i.test(process2.platform);
      EE = require("events");
      if (typeof EE !== "function") {
        EE = EE.EventEmitter;
      }
      if (process2.__signal_exit_emitter__) {
        emitter = process2.__signal_exit_emitter__;
      } else {
        emitter = process2.__signal_exit_emitter__ = new EE();
        emitter.count = 0;
        emitter.emitted = {};
      }
      if (!emitter.infinite) {
        emitter.setMaxListeners(Infinity);
        emitter.infinite = true;
      }
      module2.exports = function(cb, opts) {
        if (!processOk(global.process)) {
          return function() {
          };
        }
        assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
        if (loaded === false) {
          load();
        }
        var ev = "exit";
        if (opts && opts.alwaysLast) {
          ev = "afterexit";
        }
        var remove = function() {
          emitter.removeListener(ev, cb);
          if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
            unload();
          }
        };
        emitter.on(ev, cb);
        return remove;
      };
      unload = function unload2() {
        if (!loaded || !processOk(global.process)) {
          return;
        }
        loaded = false;
        signals.forEach(function(sig) {
          try {
            process2.removeListener(sig, sigListeners[sig]);
          } catch (er) {
          }
        });
        process2.emit = originalProcessEmit;
        process2.reallyExit = originalProcessReallyExit;
        emitter.count -= 1;
      };
      module2.exports.unload = unload;
      emit = function emit2(event, code, signal) {
        if (emitter.emitted[event]) {
          return;
        }
        emitter.emitted[event] = true;
        emitter.emit(event, code, signal);
      };
      sigListeners = {};
      signals.forEach(function(sig) {
        sigListeners[sig] = function listener() {
          if (!processOk(global.process)) {
            return;
          }
          var listeners = process2.listeners(sig);
          if (listeners.length === emitter.count) {
            unload();
            emit("exit", null, sig);
            emit("afterexit", null, sig);
            if (isWin && sig === "SIGHUP") {
              sig = "SIGINT";
            }
            process2.kill(process2.pid, sig);
          }
        };
      });
      module2.exports.signals = function() {
        return signals;
      };
      loaded = false;
      load = function load2() {
        if (loaded || !processOk(global.process)) {
          return;
        }
        loaded = true;
        emitter.count += 1;
        signals = signals.filter(function(sig) {
          try {
            process2.on(sig, sigListeners[sig]);
            return true;
          } catch (er) {
            return false;
          }
        });
        process2.emit = processEmit;
        process2.reallyExit = processReallyExit;
      };
      module2.exports.load = load;
      originalProcessReallyExit = process2.reallyExit;
      processReallyExit = function processReallyExit2(code) {
        if (!processOk(global.process)) {
          return;
        }
        process2.exitCode = code || /* istanbul ignore next */
        0;
        emit("exit", process2.exitCode, null);
        emit("afterexit", process2.exitCode, null);
        originalProcessReallyExit.call(process2, process2.exitCode);
      };
      originalProcessEmit = process2.emit;
      processEmit = function processEmit2(ev, arg) {
        if (ev === "exit" && processOk(global.process)) {
          if (arg !== void 0) {
            process2.exitCode = arg;
          }
          var ret = originalProcessEmit.apply(this, arguments);
          emit("exit", process2.exitCode, null);
          emit("afterexit", process2.exitCode, null);
          return ret;
        } else {
          return originalProcessEmit.apply(this, arguments);
        }
      };
    }
    var assert;
    var signals;
    var isWin;
    var EE;
    var emitter;
    var unload;
    var emit;
    var sigListeners;
    var loaded;
    var load;
    var originalProcessReallyExit;
    var processReallyExit;
    var originalProcessEmit;
    var processEmit;
  }
});

// node_modules/proper-lockfile/lib/mtime-precision.js
var require_mtime_precision = __commonJS({
  "node_modules/proper-lockfile/lib/mtime-precision.js"(exports2, module2) {
    "use strict";
    var cacheSymbol = Symbol();
    function probe(file, fs2, callback) {
      const cachedPrecision = fs2[cacheSymbol];
      if (cachedPrecision) {
        return fs2.stat(file, (err, stat) => {
          if (err) {
            return callback(err);
          }
          callback(null, stat.mtime, cachedPrecision);
        });
      }
      const mtime = new Date(Math.ceil(Date.now() / 1e3) * 1e3 + 5);
      fs2.utimes(file, mtime, mtime, (err) => {
        if (err) {
          return callback(err);
        }
        fs2.stat(file, (err2, stat) => {
          if (err2) {
            return callback(err2);
          }
          const precision = stat.mtime.getTime() % 1e3 === 0 ? "s" : "ms";
          Object.defineProperty(fs2, cacheSymbol, { value: precision });
          callback(null, stat.mtime, precision);
        });
      });
    }
    function getMtime(precision) {
      let now = Date.now();
      if (precision === "s") {
        now = Math.ceil(now / 1e3) * 1e3;
      }
      return new Date(now);
    }
    module2.exports.probe = probe;
    module2.exports.getMtime = getMtime;
  }
});

// node_modules/proper-lockfile/lib/lockfile.js
var require_lockfile = __commonJS({
  "node_modules/proper-lockfile/lib/lockfile.js"(exports2, module2) {
    "use strict";
    var path = require("path");
    var fs2 = require_graceful_fs();
    var retry = require_retry2();
    var onExit = require_signal_exit();
    var mtimePrecision = require_mtime_precision();
    var locks = {};
    function getLockFile(file, options) {
      return options.lockfilePath || `${file}.lock`;
    }
    function resolveCanonicalPath(file, options, callback) {
      if (!options.realpath) {
        return callback(null, path.resolve(file));
      }
      options.fs.realpath(file, callback);
    }
    function acquireLock(file, options, callback) {
      const lockfilePath = getLockFile(file, options);
      options.fs.mkdir(lockfilePath, (err) => {
        if (!err) {
          return mtimePrecision.probe(lockfilePath, options.fs, (err2, mtime, mtimePrecision2) => {
            if (err2) {
              options.fs.rmdir(lockfilePath, () => {
              });
              return callback(err2);
            }
            callback(null, mtime, mtimePrecision2);
          });
        }
        if (err.code !== "EEXIST") {
          return callback(err);
        }
        if (options.stale <= 0) {
          return callback(Object.assign(new Error("Lock file is already being held"), { code: "ELOCKED", file }));
        }
        options.fs.stat(lockfilePath, (err2, stat) => {
          if (err2) {
            if (err2.code === "ENOENT") {
              return acquireLock(file, { ...options, stale: 0 }, callback);
            }
            return callback(err2);
          }
          if (!isLockStale(stat, options)) {
            return callback(Object.assign(new Error("Lock file is already being held"), { code: "ELOCKED", file }));
          }
          removeLock(file, options, (err3) => {
            if (err3) {
              return callback(err3);
            }
            acquireLock(file, { ...options, stale: 0 }, callback);
          });
        });
      });
    }
    function isLockStale(stat, options) {
      return stat.mtime.getTime() < Date.now() - options.stale;
    }
    function removeLock(file, options, callback) {
      options.fs.rmdir(getLockFile(file, options), (err) => {
        if (err && err.code !== "ENOENT") {
          return callback(err);
        }
        callback();
      });
    }
    function updateLock(file, options) {
      const lock3 = locks[file];
      if (lock3.updateTimeout) {
        return;
      }
      lock3.updateDelay = lock3.updateDelay || options.update;
      lock3.updateTimeout = setTimeout(() => {
        lock3.updateTimeout = null;
        options.fs.stat(lock3.lockfilePath, (err, stat) => {
          const isOverThreshold = lock3.lastUpdate + options.stale < Date.now();
          if (err) {
            if (err.code === "ENOENT" || isOverThreshold) {
              return setLockAsCompromised(file, lock3, Object.assign(err, { code: "ECOMPROMISED" }));
            }
            lock3.updateDelay = 1e3;
            return updateLock(file, options);
          }
          const isMtimeOurs = lock3.mtime.getTime() === stat.mtime.getTime();
          if (!isMtimeOurs) {
            return setLockAsCompromised(
              file,
              lock3,
              Object.assign(
                new Error("Unable to update lock within the stale threshold"),
                { code: "ECOMPROMISED" }
              )
            );
          }
          const mtime = mtimePrecision.getMtime(lock3.mtimePrecision);
          options.fs.utimes(lock3.lockfilePath, mtime, mtime, (err2) => {
            const isOverThreshold2 = lock3.lastUpdate + options.stale < Date.now();
            if (lock3.released) {
              return;
            }
            if (err2) {
              if (err2.code === "ENOENT" || isOverThreshold2) {
                return setLockAsCompromised(file, lock3, Object.assign(err2, { code: "ECOMPROMISED" }));
              }
              lock3.updateDelay = 1e3;
              return updateLock(file, options);
            }
            lock3.mtime = mtime;
            lock3.lastUpdate = Date.now();
            lock3.updateDelay = null;
            updateLock(file, options);
          });
        });
      }, lock3.updateDelay);
      if (lock3.updateTimeout.unref) {
        lock3.updateTimeout.unref();
      }
    }
    function setLockAsCompromised(file, lock3, err) {
      lock3.released = true;
      if (lock3.updateTimeout) {
        clearTimeout(lock3.updateTimeout);
      }
      if (locks[file] === lock3) {
        delete locks[file];
      }
      lock3.options.onCompromised(err);
    }
    function lock2(file, options, callback) {
      options = {
        stale: 1e4,
        update: null,
        realpath: true,
        retries: 0,
        fs: fs2,
        onCompromised: (err) => {
          throw err;
        },
        ...options
      };
      options.retries = options.retries || 0;
      options.retries = typeof options.retries === "number" ? { retries: options.retries } : options.retries;
      options.stale = Math.max(options.stale || 0, 2e3);
      options.update = options.update == null ? options.stale / 2 : options.update || 0;
      options.update = Math.max(Math.min(options.update, options.stale / 2), 1e3);
      resolveCanonicalPath(file, options, (err, file2) => {
        if (err) {
          return callback(err);
        }
        const operation = retry.operation(options.retries);
        operation.attempt(() => {
          acquireLock(file2, options, (err2, mtime, mtimePrecision2) => {
            if (operation.retry(err2)) {
              return;
            }
            if (err2) {
              return callback(operation.mainError());
            }
            const lock3 = locks[file2] = {
              lockfilePath: getLockFile(file2, options),
              mtime,
              mtimePrecision: mtimePrecision2,
              options,
              lastUpdate: Date.now()
            };
            updateLock(file2, options);
            callback(null, (releasedCallback) => {
              if (lock3.released) {
                return releasedCallback && releasedCallback(Object.assign(new Error("Lock is already released"), { code: "ERELEASED" }));
              }
              unlock(file2, { ...options, realpath: false }, releasedCallback);
            });
          });
        });
      });
    }
    function unlock(file, options, callback) {
      options = {
        fs: fs2,
        realpath: true,
        ...options
      };
      resolveCanonicalPath(file, options, (err, file2) => {
        if (err) {
          return callback(err);
        }
        const lock3 = locks[file2];
        if (!lock3) {
          return callback(Object.assign(new Error("Lock is not acquired/owned by you"), { code: "ENOTACQUIRED" }));
        }
        lock3.updateTimeout && clearTimeout(lock3.updateTimeout);
        lock3.released = true;
        delete locks[file2];
        removeLock(file2, options, callback);
      });
    }
    function check(file, options, callback) {
      options = {
        stale: 1e4,
        realpath: true,
        fs: fs2,
        ...options
      };
      options.stale = Math.max(options.stale || 0, 2e3);
      resolveCanonicalPath(file, options, (err, file2) => {
        if (err) {
          return callback(err);
        }
        options.fs.stat(getLockFile(file2, options), (err2, stat) => {
          if (err2) {
            return err2.code === "ENOENT" ? callback(null, false) : callback(err2);
          }
          return callback(null, !isLockStale(stat, options));
        });
      });
    }
    function getLocks() {
      return locks;
    }
    onExit(() => {
      for (const file in locks) {
        const options = locks[file].options;
        try {
          options.fs.rmdirSync(getLockFile(file, options));
        } catch (e) {
        }
      }
    });
    module2.exports.lock = lock2;
    module2.exports.unlock = unlock;
    module2.exports.check = check;
    module2.exports.getLocks = getLocks;
  }
});

// node_modules/proper-lockfile/lib/adapter.js
var require_adapter = __commonJS({
  "node_modules/proper-lockfile/lib/adapter.js"(exports2, module2) {
    "use strict";
    var fs2 = require_graceful_fs();
    function createSyncFs(fs3) {
      const methods = ["mkdir", "realpath", "stat", "rmdir", "utimes"];
      const newFs = { ...fs3 };
      methods.forEach((method) => {
        newFs[method] = (...args) => {
          const callback = args.pop();
          let ret;
          try {
            ret = fs3[`${method}Sync`](...args);
          } catch (err) {
            return callback(err);
          }
          callback(null, ret);
        };
      });
      return newFs;
    }
    function toPromise(method) {
      return (...args) => new Promise((resolve, reject) => {
        args.push((err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
        method(...args);
      });
    }
    function toSync(method) {
      return (...args) => {
        let err;
        let result;
        args.push((_err, _result) => {
          err = _err;
          result = _result;
        });
        method(...args);
        if (err) {
          throw err;
        }
        return result;
      };
    }
    function toSyncOptions(options) {
      options = { ...options };
      options.fs = createSyncFs(options.fs || fs2);
      if (typeof options.retries === "number" && options.retries > 0 || options.retries && typeof options.retries.retries === "number" && options.retries.retries > 0) {
        throw Object.assign(new Error("Cannot use retries with the sync api"), { code: "ESYNC" });
      }
      return options;
    }
    module2.exports = {
      toPromise,
      toSync,
      toSyncOptions
    };
  }
});

// node_modules/proper-lockfile/index.js
var require_proper_lockfile = __commonJS({
  "node_modules/proper-lockfile/index.js"(exports2, module2) {
    "use strict";
    var lockfile = require_lockfile();
    var { toPromise, toSync, toSyncOptions } = require_adapter();
    async function lock2(file, options) {
      const release = await toPromise(lockfile.lock)(file, options);
      return toPromise(release);
    }
    function lockSync(file, options) {
      const release = toSync(lockfile.lock)(file, toSyncOptions(options));
      return toSync(release);
    }
    function unlock(file, options) {
      return toPromise(lockfile.unlock)(file, options);
    }
    function unlockSync(file, options) {
      return toSync(lockfile.unlock)(file, toSyncOptions(options));
    }
    function check(file, options) {
      return toPromise(lockfile.check)(file, options);
    }
    function checkSync(file, options) {
      return toSync(lockfile.check)(file, toSyncOptions(options));
    }
    module2.exports = lock2;
    module2.exports.lock = lock2;
    module2.exports.unlock = unlock;
    module2.exports.lockSync = lockSync;
    module2.exports.unlockSync = unlockSync;
    module2.exports.check = check;
    module2.exports.checkSync = checkSync;
  }
});

// test/educatr-flows.ts
var educatr_flows_exports = {};
__export(educatr_flows_exports, {
  helloWorld: () => helloWorld
});
module.exports = __toCommonJS(educatr_flows_exports);
var import_test = require("@playwright/test");

// node_modules/dotenv/config.js
(function() {
  require_main().config(
    Object.assign(
      {},
      require_env_options(),
      require_cli_options()(process.argv)
    )
  );
})();

// test/educatr-flows.ts
var fs = __toESM(require("node:fs"));

// test/credManager.ts
var import_csv_parser = __toESM(require_csv_parser());
var import_node_fs = require("node:fs");
var import_proper_lockfile = __toESM(require_proper_lockfile());
async function lockAndUpdateCreds() {
  const release = await (0, import_proper_lockfile.lock)("test/creds.csv", { retries: 5, retryWait: 1e3 });
  try {
    const creds = await new Promise((resolve, reject) => {
      const creds2 = [];
      (0, import_node_fs.createReadStream)("test/creds.csv").pipe((0, import_csv_parser.default)()).on("data", (row) => creds2.push(row)).on("end", () => resolve(creds2)).on("error", (err) => reject(err));
    });
    const availableCreds = creds.find((cred) => cred.inuse === "no");
    if (availableCreds) {
      availableCreds.inuse = "yes";
      const updatedData = ["username,inuse", ...creds.map((cred) => `${cred.username},${cred.inuse}`)].join("\n");
      (0, import_node_fs.writeFileSync)("test/creds.csv", updatedData);
      console.log("Credentials updated for username:", availableCreds.username);
      return availableCreds.username;
    } else {
      console.log("No available credentials.");
      return null;
    }
  } catch (err) {
    console.error("Error during file operation:", err);
    return null;
  } finally {
    release();
  }
}
async function getCredsAndLockFile() {
  let locked = true;
  while (locked) {
    try {
      const username = await lockAndUpdateCreds();
      if (username) {
        return username;
      } else {
        console.log("Waiting for available credentials...");
      }
      locked = false;
    } catch (err) {
      console.log("File is locked, retrying...");
      await new Promise((resolve) => setTimeout(resolve, 1e3));
    }
  }
  return null;
}
async function releaseCreds(username) {
  const release = await (0, import_proper_lockfile.lock)("test/creds.csv", { retries: 5, retryWait: 1e3 });
  try {
    const creds = await new Promise((resolve, reject) => {
      const creds2 = [];
      (0, import_node_fs.createReadStream)("test/creds.csv").pipe((0, import_csv_parser.default)()).on("data", (row) => creds2.push(row)).on("end", () => resolve(creds2)).on("error", (err) => reject(err));
    });
    const userCred = creds.find((cred) => cred.username === username);
    if (userCred) {
      userCred.inuse = "no";
      const updatedData = ["username,inuse", ...creds.map((cred) => `${cred.username},${cred.inuse}`)].join("\n");
      (0, import_node_fs.writeFileSync)("test/creds.csv", updatedData);
      console.log(`Credentials released for username: ${username}`);
      return true;
    } else {
      console.log(`Username not found: ${username}`);
      return false;
    }
  } catch (err) {
    console.error("Error during file operation:", err);
    return false;
  } finally {
    release();
  }
}

// test/educatr-flows.ts
async function helloWorld(page, context, events) {
  page.on("response", (response) => {
    if (response.url().includes("api.educatr.uk")) {
      const time = Date.now() - response.request().timing().startTime;
      events.emit("histogram", `api_response_time`, time);
      events.emit("histogram", `api_response_time_${response.url()}`, time);
      console.log(`Request to ${response.url()} took ${time}ms`);
    }
  });
  await page.goto("https://educatr.uk/");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  let username = await getCredsAndLockFile();
  if (!username)
    return;
  await page.goto("https://educatr.uk/");
  await (0, import_test.expect)(page.locator("#\\:r0\\:")).toBeEditable({ timeout: 2e5 });
  await (0, import_test.expect)(page.locator("#\\:r1\\:")).toBeEditable({ timeout: 2e5 });
  await page.fill("#\\:r0\\:", username);
  await page.fill("#\\:r1\\:", process.env.PERF_TEST_PASSWORD);
  await page.click('button:has-text("Sign in")');
  await page.waitForTimeout(2e3);
  await page.waitForURL("https://educatr.uk/play", { timeout: 2e5 });
  await page.goto("https://educatr.uk/play/ejn9p6bwx5ajl7oeldatdzoa");
  await page.waitForTimeout(2e3);
  await (0, import_test.expect)(page.getByText("Logic Gates")).toBeVisible({ timeout: 2e5 });
  const sampleQuestions = JSON.parse(fs.readFileSync("test/sample.json", "utf8"));
  const randomisedSampleQuestions = sampleQuestions.sort(() => Math.random() - 0.5);
  for (const i in randomisedSampleQuestions) {
    try {
      const question = randomisedSampleQuestions[i];
      if (!["TEXT"].includes(question.answerType.S))
        continue;
      if (!["COMPARE"].includes(question.verificationType.S))
        continue;
      const buttoncat = await page.locator(`#${question.PK.S}`);
      buttoncat.click();
      await page.waitForTimeout(2e3);
      const button = await page.locator(`#${question.SK.S.split("#")[1]}`);
      if (!await button.evaluate((element) => element.classList.contains("Mui-disabled"))) {
        await button.click();
        await page.waitForTimeout(2e3);
        if (question.answerType.S != "PYTHON") {
          await page.locator("input:visible").fill(question.answer.S + "fdsfasfadsfdsa");
          await page.waitForTimeout(1e3);
          await page.locator('button:text("Submit"):visible').click();
          await page.waitForResponse((response) => response.url().includes("/check"), { timeout: 2e4 });
          await page.waitForTimeout(2e3);
          await page.locator("input:visible").fill(question.answer.S + "rrerererwrew");
          await page.waitForTimeout(1e3);
          await page.locator('button:text("Submit"):visible').click();
          await page.waitForResponse((response) => response.url().includes("/check"), { timeout: 2e4 });
          await page.waitForTimeout(2e3);
        } else {
          await page.evaluate(
            ([answer]) => {
              let editor = document.querySelector(".cm-content");
              editor.textContent = `print(${answer}eeeeee);`;
              editor.dispatchEvent(new Event("input", { bubbles: true }));
            },
            [question.answer.S]
          );
          await page.waitForTimeout(1e3);
          await page.locator('button:text("Submit"):visible').click();
          await page.waitForResponse((response) => response.url().includes("/check"), { timeout: 2e4 });
          await page.waitForTimeout(2e3);
          await page.evaluate(
            ([answer]) => {
              let editor = document.querySelector(".cm-content");
              editor.textContent = `print(${answer}ssssss);`;
              editor.dispatchEvent(new Event("input", { bubbles: true }));
            },
            [question.answer.S]
          );
          await page.waitForTimeout(1e3);
          await page.locator('button:text("Submit"):visible').click();
          await page.waitForResponse((response) => response.url().includes("/check"), { timeout: 2e4 });
          await page.waitForTimeout(2e3);
        }
        if (Math.random() < 0.8) {
          console.log(question.answerType.S == "PYTHON");
          if (question.answerType.S == "PYTHON") {
            page.evaluate(
              ([answer]) => {
                let editor = document.querySelector(".cm-content");
                editor.textContent = `print('${answer}');`;
                editor.dispatchEvent(new Event("input", { bubbles: true }));
              },
              [question.answer.S]
            );
          } else {
            await page.locator("input:visible").fill(question.answer.S);
          }
          await page.waitForTimeout(1e3);
          await page.locator('button:text("Submit"):visible').click();
          await page.waitForResponse((response) => response.url().includes("/check"), { timeout: 2e4 });
        } else {
          await page.keyboard.press("Escape");
        }
        await page.waitForTimeout(3e3);
      } else
        console.log("Task already complete");
    } catch (e) {
      await page.keyboard.press("Escape");
    }
  }
  await releaseCreds(username);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  helloWorld
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL2RvdGVudi9wYWNrYWdlLmpzb24iLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2RvdGVudi9saWIvbWFpbi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvZG90ZW52L2xpYi9lbnYtb3B0aW9ucy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvZG90ZW52L2xpYi9jbGktb3B0aW9ucy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvY3N2LXBhcnNlci9pbmRleC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvZ3JhY2VmdWwtZnMvcG9seWZpbGxzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9ncmFjZWZ1bC1mcy9sZWdhY3ktc3RyZWFtcy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvZ3JhY2VmdWwtZnMvY2xvbmUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2dyYWNlZnVsLWZzL2dyYWNlZnVsLWZzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9yZXRyeS9saWIvcmV0cnlfb3BlcmF0aW9uLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9yZXRyeS9saWIvcmV0cnkuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3JldHJ5L2luZGV4LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9zaWduYWwtZXhpdC9zaWduYWxzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9zaWduYWwtZXhpdC9pbmRleC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvcHJvcGVyLWxvY2tmaWxlL2xpYi9tdGltZS1wcmVjaXNpb24uanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3Byb3Blci1sb2NrZmlsZS9saWIvbG9ja2ZpbGUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3Byb3Blci1sb2NrZmlsZS9saWIvYWRhcHRlci5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvcHJvcGVyLWxvY2tmaWxlL2luZGV4LmpzIiwgIi4uL2VkdWNhdHItZmxvd3MudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2RvdGVudi9jb25maWcuanMiLCAiLi4vY3JlZE1hbmFnZXIudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIntcbiAgXCJuYW1lXCI6IFwiZG90ZW52XCIsXG4gIFwidmVyc2lvblwiOiBcIjE2LjQuN1wiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiTG9hZHMgZW52aXJvbm1lbnQgdmFyaWFibGVzIGZyb20gLmVudiBmaWxlXCIsXG4gIFwibWFpblwiOiBcImxpYi9tYWluLmpzXCIsXG4gIFwidHlwZXNcIjogXCJsaWIvbWFpbi5kLnRzXCIsXG4gIFwiZXhwb3J0c1wiOiB7XG4gICAgXCIuXCI6IHtcbiAgICAgIFwidHlwZXNcIjogXCIuL2xpYi9tYWluLmQudHNcIixcbiAgICAgIFwicmVxdWlyZVwiOiBcIi4vbGliL21haW4uanNcIixcbiAgICAgIFwiZGVmYXVsdFwiOiBcIi4vbGliL21haW4uanNcIlxuICAgIH0sXG4gICAgXCIuL2NvbmZpZ1wiOiBcIi4vY29uZmlnLmpzXCIsXG4gICAgXCIuL2NvbmZpZy5qc1wiOiBcIi4vY29uZmlnLmpzXCIsXG4gICAgXCIuL2xpYi9lbnYtb3B0aW9uc1wiOiBcIi4vbGliL2Vudi1vcHRpb25zLmpzXCIsXG4gICAgXCIuL2xpYi9lbnYtb3B0aW9ucy5qc1wiOiBcIi4vbGliL2Vudi1vcHRpb25zLmpzXCIsXG4gICAgXCIuL2xpYi9jbGktb3B0aW9uc1wiOiBcIi4vbGliL2NsaS1vcHRpb25zLmpzXCIsXG4gICAgXCIuL2xpYi9jbGktb3B0aW9ucy5qc1wiOiBcIi4vbGliL2NsaS1vcHRpb25zLmpzXCIsXG4gICAgXCIuL3BhY2thZ2UuanNvblwiOiBcIi4vcGFja2FnZS5qc29uXCJcbiAgfSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImR0cy1jaGVja1wiOiBcInRzYyAtLXByb2plY3QgdGVzdHMvdHlwZXMvdHNjb25maWcuanNvblwiLFxuICAgIFwibGludFwiOiBcInN0YW5kYXJkXCIsXG4gICAgXCJwcmV0ZXN0XCI6IFwibnBtIHJ1biBsaW50ICYmIG5wbSBydW4gZHRzLWNoZWNrXCIsXG4gICAgXCJ0ZXN0XCI6IFwidGFwIHJ1biAtLWFsbG93LWVtcHR5LWNvdmVyYWdlIC0tZGlzYWJsZS1jb3ZlcmFnZSAtLXRpbWVvdXQ9NjAwMDBcIixcbiAgICBcInRlc3Q6Y292ZXJhZ2VcIjogXCJ0YXAgcnVuIC0tc2hvdy1mdWxsLWNvdmVyYWdlIC0tdGltZW91dD02MDAwMCAtLWNvdmVyYWdlLXJlcG9ydD1sY292XCIsXG4gICAgXCJwcmVyZWxlYXNlXCI6IFwibnBtIHRlc3RcIixcbiAgICBcInJlbGVhc2VcIjogXCJzdGFuZGFyZC12ZXJzaW9uXCJcbiAgfSxcbiAgXCJyZXBvc2l0b3J5XCI6IHtcbiAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICBcInVybFwiOiBcImdpdDovL2dpdGh1Yi5jb20vbW90ZG90bGEvZG90ZW52LmdpdFwiXG4gIH0sXG4gIFwiZnVuZGluZ1wiOiBcImh0dHBzOi8vZG90ZW52eC5jb21cIixcbiAgXCJrZXl3b3Jkc1wiOiBbXG4gICAgXCJkb3RlbnZcIixcbiAgICBcImVudlwiLFxuICAgIFwiLmVudlwiLFxuICAgIFwiZW52aXJvbm1lbnRcIixcbiAgICBcInZhcmlhYmxlc1wiLFxuICAgIFwiY29uZmlnXCIsXG4gICAgXCJzZXR0aW5nc1wiXG4gIF0sXG4gIFwicmVhZG1lRmlsZW5hbWVcIjogXCJSRUFETUUubWRcIixcbiAgXCJsaWNlbnNlXCI6IFwiQlNELTItQ2xhdXNlXCIsXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkB0eXBlcy9ub2RlXCI6IFwiXjE4LjExLjNcIixcbiAgICBcImRlY2FjaGVcIjogXCJeNC42LjJcIixcbiAgICBcInNpbm9uXCI6IFwiXjE0LjAuMVwiLFxuICAgIFwic3RhbmRhcmRcIjogXCJeMTcuMC4wXCIsXG4gICAgXCJzdGFuZGFyZC12ZXJzaW9uXCI6IFwiXjkuNS4wXCIsXG4gICAgXCJ0YXBcIjogXCJeMTkuMi4wXCIsXG4gICAgXCJ0eXBlc2NyaXB0XCI6IFwiXjQuOC40XCJcbiAgfSxcbiAgXCJlbmdpbmVzXCI6IHtcbiAgICBcIm5vZGVcIjogXCI+PTEyXCJcbiAgfSxcbiAgXCJicm93c2VyXCI6IHtcbiAgICBcImZzXCI6IGZhbHNlXG4gIH1cbn1cbiIsICJjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKVxuY29uc3QgY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJylcbmNvbnN0IHBhY2thZ2VKc29uID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJylcblxuY29uc3QgdmVyc2lvbiA9IHBhY2thZ2VKc29uLnZlcnNpb25cblxuY29uc3QgTElORSA9IC8oPzpefF4pXFxzKig/OmV4cG9ydFxccyspPyhbXFx3Li1dKykoPzpcXHMqPVxccyo/fDpcXHMrPykoXFxzKicoPzpcXFxcJ3xbXiddKSonfFxccypcIig/OlxcXFxcInxbXlwiXSkqXCJ8XFxzKmAoPzpcXFxcYHxbXmBdKSpgfFteI1xcclxcbl0rKT9cXHMqKD86Iy4qKT8oPzokfCQpL21nXG5cbi8vIFBhcnNlIHNyYyBpbnRvIGFuIE9iamVjdFxuZnVuY3Rpb24gcGFyc2UgKHNyYykge1xuICBjb25zdCBvYmogPSB7fVxuXG4gIC8vIENvbnZlcnQgYnVmZmVyIHRvIHN0cmluZ1xuICBsZXQgbGluZXMgPSBzcmMudG9TdHJpbmcoKVxuXG4gIC8vIENvbnZlcnQgbGluZSBicmVha3MgdG8gc2FtZSBmb3JtYXRcbiAgbGluZXMgPSBsaW5lcy5yZXBsYWNlKC9cXHJcXG4/L21nLCAnXFxuJylcblxuICBsZXQgbWF0Y2hcbiAgd2hpbGUgKChtYXRjaCA9IExJTkUuZXhlYyhsaW5lcykpICE9IG51bGwpIHtcbiAgICBjb25zdCBrZXkgPSBtYXRjaFsxXVxuXG4gICAgLy8gRGVmYXVsdCB1bmRlZmluZWQgb3IgbnVsbCB0byBlbXB0eSBzdHJpbmdcbiAgICBsZXQgdmFsdWUgPSAobWF0Y2hbMl0gfHwgJycpXG5cbiAgICAvLyBSZW1vdmUgd2hpdGVzcGFjZVxuICAgIHZhbHVlID0gdmFsdWUudHJpbSgpXG5cbiAgICAvLyBDaGVjayBpZiBkb3VibGUgcXVvdGVkXG4gICAgY29uc3QgbWF5YmVRdW90ZSA9IHZhbHVlWzBdXG5cbiAgICAvLyBSZW1vdmUgc3Vycm91bmRpbmcgcXVvdGVzXG4gICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9eKFsnXCJgXSkoW1xcc1xcU10qKVxcMSQvbWcsICckMicpXG5cbiAgICAvLyBFeHBhbmQgbmV3bGluZXMgaWYgZG91YmxlIHF1b3RlZFxuICAgIGlmIChtYXliZVF1b3RlID09PSAnXCInKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1xcXFxuL2csICdcXG4nKVxuICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXFxcci9nLCAnXFxyJylcbiAgICB9XG5cbiAgICAvLyBBZGQgdG8gb2JqZWN0XG4gICAgb2JqW2tleV0gPSB2YWx1ZVxuICB9XG5cbiAgcmV0dXJuIG9ialxufVxuXG5mdW5jdGlvbiBfcGFyc2VWYXVsdCAob3B0aW9ucykge1xuICBjb25zdCB2YXVsdFBhdGggPSBfdmF1bHRQYXRoKG9wdGlvbnMpXG5cbiAgLy8gUGFyc2UgLmVudi52YXVsdFxuICBjb25zdCByZXN1bHQgPSBEb3RlbnZNb2R1bGUuY29uZmlnRG90ZW52KHsgcGF0aDogdmF1bHRQYXRoIH0pXG4gIGlmICghcmVzdWx0LnBhcnNlZCkge1xuICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihgTUlTU0lOR19EQVRBOiBDYW5ub3QgcGFyc2UgJHt2YXVsdFBhdGh9IGZvciBhbiB1bmtub3duIHJlYXNvbmApXG4gICAgZXJyLmNvZGUgPSAnTUlTU0lOR19EQVRBJ1xuICAgIHRocm93IGVyclxuICB9XG5cbiAgLy8gaGFuZGxlIHNjZW5hcmlvIGZvciBjb21tYSBzZXBhcmF0ZWQga2V5cyAtIGZvciB1c2Ugd2l0aCBrZXkgcm90YXRpb25cbiAgLy8gZXhhbXBsZTogRE9URU5WX0tFWT1cImRvdGVudjovLzprZXlfMTIzNEBkb3RlbnZ4LmNvbS92YXVsdC8uZW52LnZhdWx0P2Vudmlyb25tZW50PXByb2QsZG90ZW52Oi8vOmtleV83ODkwQGRvdGVudnguY29tL3ZhdWx0Ly5lbnYudmF1bHQ/ZW52aXJvbm1lbnQ9cHJvZFwiXG4gIGNvbnN0IGtleXMgPSBfZG90ZW52S2V5KG9wdGlvbnMpLnNwbGl0KCcsJylcbiAgY29uc3QgbGVuZ3RoID0ga2V5cy5sZW5ndGhcblxuICBsZXQgZGVjcnlwdGVkXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB0cnkge1xuICAgICAgLy8gR2V0IGZ1bGwga2V5XG4gICAgICBjb25zdCBrZXkgPSBrZXlzW2ldLnRyaW0oKVxuXG4gICAgICAvLyBHZXQgaW5zdHJ1Y3Rpb25zIGZvciBkZWNyeXB0XG4gICAgICBjb25zdCBhdHRycyA9IF9pbnN0cnVjdGlvbnMocmVzdWx0LCBrZXkpXG5cbiAgICAgIC8vIERlY3J5cHRcbiAgICAgIGRlY3J5cHRlZCA9IERvdGVudk1vZHVsZS5kZWNyeXB0KGF0dHJzLmNpcGhlcnRleHQsIGF0dHJzLmtleSlcblxuICAgICAgYnJlYWtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gbGFzdCBrZXlcbiAgICAgIGlmIChpICsgMSA+PSBsZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgIH1cbiAgICAgIC8vIHRyeSBuZXh0IGtleVxuICAgIH1cbiAgfVxuXG4gIC8vIFBhcnNlIGRlY3J5cHRlZCAuZW52IHN0cmluZ1xuICByZXR1cm4gRG90ZW52TW9kdWxlLnBhcnNlKGRlY3J5cHRlZClcbn1cblxuZnVuY3Rpb24gX2xvZyAobWVzc2FnZSkge1xuICBjb25zb2xlLmxvZyhgW2RvdGVudkAke3ZlcnNpb259XVtJTkZPXSAke21lc3NhZ2V9YClcbn1cblxuZnVuY3Rpb24gX3dhcm4gKG1lc3NhZ2UpIHtcbiAgY29uc29sZS5sb2coYFtkb3RlbnZAJHt2ZXJzaW9ufV1bV0FSTl0gJHttZXNzYWdlfWApXG59XG5cbmZ1bmN0aW9uIF9kZWJ1ZyAobWVzc2FnZSkge1xuICBjb25zb2xlLmxvZyhgW2RvdGVudkAke3ZlcnNpb259XVtERUJVR10gJHttZXNzYWdlfWApXG59XG5cbmZ1bmN0aW9uIF9kb3RlbnZLZXkgKG9wdGlvbnMpIHtcbiAgLy8gcHJpb3JpdGl6ZSBkZXZlbG9wZXIgZGlyZWN0bHkgc2V0dGluZyBvcHRpb25zLkRPVEVOVl9LRVlcbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5ET1RFTlZfS0VZICYmIG9wdGlvbnMuRE9URU5WX0tFWS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuRE9URU5WX0tFWVxuICB9XG5cbiAgLy8gc2Vjb25kYXJ5IGluZnJhIGFscmVhZHkgY29udGFpbnMgYSBET1RFTlZfS0VZIGVudmlyb25tZW50IHZhcmlhYmxlXG4gIGlmIChwcm9jZXNzLmVudi5ET1RFTlZfS0VZICYmIHByb2Nlc3MuZW52LkRPVEVOVl9LRVkubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5ET1RFTlZfS0VZXG4gIH1cblxuICAvLyBmYWxsYmFjayB0byBlbXB0eSBzdHJpbmdcbiAgcmV0dXJuICcnXG59XG5cbmZ1bmN0aW9uIF9pbnN0cnVjdGlvbnMgKHJlc3VsdCwgZG90ZW52S2V5KSB7XG4gIC8vIFBhcnNlIERPVEVOVl9LRVkuIEZvcm1hdCBpcyBhIFVSSVxuICBsZXQgdXJpXG4gIHRyeSB7XG4gICAgdXJpID0gbmV3IFVSTChkb3RlbnZLZXkpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yLmNvZGUgPT09ICdFUlJfSU5WQUxJRF9VUkwnKSB7XG4gICAgICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoJ0lOVkFMSURfRE9URU5WX0tFWTogV3JvbmcgZm9ybWF0LiBNdXN0IGJlIGluIHZhbGlkIHVyaSBmb3JtYXQgbGlrZSBkb3RlbnY6Ly86a2V5XzEyMzRAZG90ZW52eC5jb20vdmF1bHQvLmVudi52YXVsdD9lbnZpcm9ubWVudD1kZXZlbG9wbWVudCcpXG4gICAgICBlcnIuY29kZSA9ICdJTlZBTElEX0RPVEVOVl9LRVknXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG5cbiAgICB0aHJvdyBlcnJvclxuICB9XG5cbiAgLy8gR2V0IGRlY3J5cHQga2V5XG4gIGNvbnN0IGtleSA9IHVyaS5wYXNzd29yZFxuICBpZiAoIWtleSkge1xuICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcignSU5WQUxJRF9ET1RFTlZfS0VZOiBNaXNzaW5nIGtleSBwYXJ0JylcbiAgICBlcnIuY29kZSA9ICdJTlZBTElEX0RPVEVOVl9LRVknXG4gICAgdGhyb3cgZXJyXG4gIH1cblxuICAvLyBHZXQgZW52aXJvbm1lbnRcbiAgY29uc3QgZW52aXJvbm1lbnQgPSB1cmkuc2VhcmNoUGFyYW1zLmdldCgnZW52aXJvbm1lbnQnKVxuICBpZiAoIWVudmlyb25tZW50KSB7XG4gICAgY29uc3QgZXJyID0gbmV3IEVycm9yKCdJTlZBTElEX0RPVEVOVl9LRVk6IE1pc3NpbmcgZW52aXJvbm1lbnQgcGFydCcpXG4gICAgZXJyLmNvZGUgPSAnSU5WQUxJRF9ET1RFTlZfS0VZJ1xuICAgIHRocm93IGVyclxuICB9XG5cbiAgLy8gR2V0IGNpcGhlcnRleHQgcGF5bG9hZFxuICBjb25zdCBlbnZpcm9ubWVudEtleSA9IGBET1RFTlZfVkFVTFRfJHtlbnZpcm9ubWVudC50b1VwcGVyQ2FzZSgpfWBcbiAgY29uc3QgY2lwaGVydGV4dCA9IHJlc3VsdC5wYXJzZWRbZW52aXJvbm1lbnRLZXldIC8vIERPVEVOVl9WQVVMVF9QUk9EVUNUSU9OXG4gIGlmICghY2lwaGVydGV4dCkge1xuICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihgTk9UX0ZPVU5EX0RPVEVOVl9FTlZJUk9OTUVOVDogQ2Fubm90IGxvY2F0ZSBlbnZpcm9ubWVudCAke2Vudmlyb25tZW50S2V5fSBpbiB5b3VyIC5lbnYudmF1bHQgZmlsZS5gKVxuICAgIGVyci5jb2RlID0gJ05PVF9GT1VORF9ET1RFTlZfRU5WSVJPTk1FTlQnXG4gICAgdGhyb3cgZXJyXG4gIH1cblxuICByZXR1cm4geyBjaXBoZXJ0ZXh0LCBrZXkgfVxufVxuXG5mdW5jdGlvbiBfdmF1bHRQYXRoIChvcHRpb25zKSB7XG4gIGxldCBwb3NzaWJsZVZhdWx0UGF0aCA9IG51bGxcblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnBhdGggJiYgb3B0aW9ucy5wYXRoLmxlbmd0aCA+IDApIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvcHRpb25zLnBhdGgpKSB7XG4gICAgICBmb3IgKGNvbnN0IGZpbGVwYXRoIG9mIG9wdGlvbnMucGF0aCkge1xuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhmaWxlcGF0aCkpIHtcbiAgICAgICAgICBwb3NzaWJsZVZhdWx0UGF0aCA9IGZpbGVwYXRoLmVuZHNXaXRoKCcudmF1bHQnKSA/IGZpbGVwYXRoIDogYCR7ZmlsZXBhdGh9LnZhdWx0YFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc3NpYmxlVmF1bHRQYXRoID0gb3B0aW9ucy5wYXRoLmVuZHNXaXRoKCcudmF1bHQnKSA/IG9wdGlvbnMucGF0aCA6IGAke29wdGlvbnMucGF0aH0udmF1bHRgXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHBvc3NpYmxlVmF1bHRQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICcuZW52LnZhdWx0JylcbiAgfVxuXG4gIGlmIChmcy5leGlzdHNTeW5jKHBvc3NpYmxlVmF1bHRQYXRoKSkge1xuICAgIHJldHVybiBwb3NzaWJsZVZhdWx0UGF0aFxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cblxuZnVuY3Rpb24gX3Jlc29sdmVIb21lIChlbnZQYXRoKSB7XG4gIHJldHVybiBlbnZQYXRoWzBdID09PSAnficgPyBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCBlbnZQYXRoLnNsaWNlKDEpKSA6IGVudlBhdGhcbn1cblxuZnVuY3Rpb24gX2NvbmZpZ1ZhdWx0IChvcHRpb25zKSB7XG4gIF9sb2coJ0xvYWRpbmcgZW52IGZyb20gZW5jcnlwdGVkIC5lbnYudmF1bHQnKVxuXG4gIGNvbnN0IHBhcnNlZCA9IERvdGVudk1vZHVsZS5fcGFyc2VWYXVsdChvcHRpb25zKVxuXG4gIGxldCBwcm9jZXNzRW52ID0gcHJvY2Vzcy5lbnZcbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5wcm9jZXNzRW52ICE9IG51bGwpIHtcbiAgICBwcm9jZXNzRW52ID0gb3B0aW9ucy5wcm9jZXNzRW52XG4gIH1cblxuICBEb3RlbnZNb2R1bGUucG9wdWxhdGUocHJvY2Vzc0VudiwgcGFyc2VkLCBvcHRpb25zKVxuXG4gIHJldHVybiB7IHBhcnNlZCB9XG59XG5cbmZ1bmN0aW9uIGNvbmZpZ0RvdGVudiAob3B0aW9ucykge1xuICBjb25zdCBkb3RlbnZQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICcuZW52JylcbiAgbGV0IGVuY29kaW5nID0gJ3V0ZjgnXG4gIGNvbnN0IGRlYnVnID0gQm9vbGVhbihvcHRpb25zICYmIG9wdGlvbnMuZGVidWcpXG5cbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5lbmNvZGluZykge1xuICAgIGVuY29kaW5nID0gb3B0aW9ucy5lbmNvZGluZ1xuICB9IGVsc2Uge1xuICAgIGlmIChkZWJ1Zykge1xuICAgICAgX2RlYnVnKCdObyBlbmNvZGluZyBpcyBzcGVjaWZpZWQuIFVURi04IGlzIHVzZWQgYnkgZGVmYXVsdCcpXG4gICAgfVxuICB9XG5cbiAgbGV0IG9wdGlvblBhdGhzID0gW2RvdGVudlBhdGhdIC8vIGRlZmF1bHQsIGxvb2sgZm9yIC5lbnZcbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5wYXRoKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KG9wdGlvbnMucGF0aCkpIHtcbiAgICAgIG9wdGlvblBhdGhzID0gW19yZXNvbHZlSG9tZShvcHRpb25zLnBhdGgpXVxuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25QYXRocyA9IFtdIC8vIHJlc2V0IGRlZmF1bHRcbiAgICAgIGZvciAoY29uc3QgZmlsZXBhdGggb2Ygb3B0aW9ucy5wYXRoKSB7XG4gICAgICAgIG9wdGlvblBhdGhzLnB1c2goX3Jlc29sdmVIb21lKGZpbGVwYXRoKSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBCdWlsZCB0aGUgcGFyc2VkIGRhdGEgaW4gYSB0ZW1wb3Jhcnkgb2JqZWN0IChiZWNhdXNlIHdlIG5lZWQgdG8gcmV0dXJuIGl0KS4gIE9uY2Ugd2UgaGF2ZSB0aGUgZmluYWxcbiAgLy8gcGFyc2VkIGRhdGEsIHdlIHdpbGwgY29tYmluZSBpdCB3aXRoIHByb2Nlc3MuZW52IChvciBvcHRpb25zLnByb2Nlc3NFbnYgaWYgcHJvdmlkZWQpLlxuICBsZXQgbGFzdEVycm9yXG4gIGNvbnN0IHBhcnNlZEFsbCA9IHt9XG4gIGZvciAoY29uc3QgcGF0aCBvZiBvcHRpb25QYXRocykge1xuICAgIHRyeSB7XG4gICAgICAvLyBTcGVjaWZ5aW5nIGFuIGVuY29kaW5nIHJldHVybnMgYSBzdHJpbmcgaW5zdGVhZCBvZiBhIGJ1ZmZlclxuICAgICAgY29uc3QgcGFyc2VkID0gRG90ZW52TW9kdWxlLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLCB7IGVuY29kaW5nIH0pKVxuXG4gICAgICBEb3RlbnZNb2R1bGUucG9wdWxhdGUocGFyc2VkQWxsLCBwYXJzZWQsIG9wdGlvbnMpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGRlYnVnKSB7XG4gICAgICAgIF9kZWJ1ZyhgRmFpbGVkIHRvIGxvYWQgJHtwYXRofSAke2UubWVzc2FnZX1gKVxuICAgICAgfVxuICAgICAgbGFzdEVycm9yID0gZVxuICAgIH1cbiAgfVxuXG4gIGxldCBwcm9jZXNzRW52ID0gcHJvY2Vzcy5lbnZcbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5wcm9jZXNzRW52ICE9IG51bGwpIHtcbiAgICBwcm9jZXNzRW52ID0gb3B0aW9ucy5wcm9jZXNzRW52XG4gIH1cblxuICBEb3RlbnZNb2R1bGUucG9wdWxhdGUocHJvY2Vzc0VudiwgcGFyc2VkQWxsLCBvcHRpb25zKVxuXG4gIGlmIChsYXN0RXJyb3IpIHtcbiAgICByZXR1cm4geyBwYXJzZWQ6IHBhcnNlZEFsbCwgZXJyb3I6IGxhc3RFcnJvciB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHsgcGFyc2VkOiBwYXJzZWRBbGwgfVxuICB9XG59XG5cbi8vIFBvcHVsYXRlcyBwcm9jZXNzLmVudiBmcm9tIC5lbnYgZmlsZVxuZnVuY3Rpb24gY29uZmlnIChvcHRpb25zKSB7XG4gIC8vIGZhbGxiYWNrIHRvIG9yaWdpbmFsIGRvdGVudiBpZiBET1RFTlZfS0VZIGlzIG5vdCBzZXRcbiAgaWYgKF9kb3RlbnZLZXkob3B0aW9ucykubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIERvdGVudk1vZHVsZS5jb25maWdEb3RlbnYob3B0aW9ucylcbiAgfVxuXG4gIGNvbnN0IHZhdWx0UGF0aCA9IF92YXVsdFBhdGgob3B0aW9ucylcblxuICAvLyBkb3RlbnZLZXkgZXhpc3RzIGJ1dCAuZW52LnZhdWx0IGZpbGUgZG9lcyBub3QgZXhpc3RcbiAgaWYgKCF2YXVsdFBhdGgpIHtcbiAgICBfd2FybihgWW91IHNldCBET1RFTlZfS0VZIGJ1dCB5b3UgYXJlIG1pc3NpbmcgYSAuZW52LnZhdWx0IGZpbGUgYXQgJHt2YXVsdFBhdGh9LiBEaWQgeW91IGZvcmdldCB0byBidWlsZCBpdD9gKVxuXG4gICAgcmV0dXJuIERvdGVudk1vZHVsZS5jb25maWdEb3RlbnYob3B0aW9ucylcbiAgfVxuXG4gIHJldHVybiBEb3RlbnZNb2R1bGUuX2NvbmZpZ1ZhdWx0KG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGRlY3J5cHQgKGVuY3J5cHRlZCwga2V5U3RyKSB7XG4gIGNvbnN0IGtleSA9IEJ1ZmZlci5mcm9tKGtleVN0ci5zbGljZSgtNjQpLCAnaGV4JylcbiAgbGV0IGNpcGhlcnRleHQgPSBCdWZmZXIuZnJvbShlbmNyeXB0ZWQsICdiYXNlNjQnKVxuXG4gIGNvbnN0IG5vbmNlID0gY2lwaGVydGV4dC5zdWJhcnJheSgwLCAxMilcbiAgY29uc3QgYXV0aFRhZyA9IGNpcGhlcnRleHQuc3ViYXJyYXkoLTE2KVxuICBjaXBoZXJ0ZXh0ID0gY2lwaGVydGV4dC5zdWJhcnJheSgxMiwgLTE2KVxuXG4gIHRyeSB7XG4gICAgY29uc3QgYWVzZ2NtID0gY3J5cHRvLmNyZWF0ZURlY2lwaGVyaXYoJ2Flcy0yNTYtZ2NtJywga2V5LCBub25jZSlcbiAgICBhZXNnY20uc2V0QXV0aFRhZyhhdXRoVGFnKVxuICAgIHJldHVybiBgJHthZXNnY20udXBkYXRlKGNpcGhlcnRleHQpfSR7YWVzZ2NtLmZpbmFsKCl9YFxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IGlzUmFuZ2UgPSBlcnJvciBpbnN0YW5jZW9mIFJhbmdlRXJyb3JcbiAgICBjb25zdCBpbnZhbGlkS2V5TGVuZ3RoID0gZXJyb3IubWVzc2FnZSA9PT0gJ0ludmFsaWQga2V5IGxlbmd0aCdcbiAgICBjb25zdCBkZWNyeXB0aW9uRmFpbGVkID0gZXJyb3IubWVzc2FnZSA9PT0gJ1Vuc3VwcG9ydGVkIHN0YXRlIG9yIHVuYWJsZSB0byBhdXRoZW50aWNhdGUgZGF0YSdcblxuICAgIGlmIChpc1JhbmdlIHx8IGludmFsaWRLZXlMZW5ndGgpIHtcbiAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcignSU5WQUxJRF9ET1RFTlZfS0VZOiBJdCBtdXN0IGJlIDY0IGNoYXJhY3RlcnMgbG9uZyAob3IgbW9yZSknKVxuICAgICAgZXJyLmNvZGUgPSAnSU5WQUxJRF9ET1RFTlZfS0VZJ1xuICAgICAgdGhyb3cgZXJyXG4gICAgfSBlbHNlIGlmIChkZWNyeXB0aW9uRmFpbGVkKSB7XG4gICAgICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoJ0RFQ1JZUFRJT05fRkFJTEVEOiBQbGVhc2UgY2hlY2sgeW91ciBET1RFTlZfS0VZJylcbiAgICAgIGVyci5jb2RlID0gJ0RFQ1JZUFRJT05fRkFJTEVEJ1xuICAgICAgdGhyb3cgZXJyXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGVycm9yXG4gICAgfVxuICB9XG59XG5cbi8vIFBvcHVsYXRlIHByb2Nlc3MuZW52IHdpdGggcGFyc2VkIHZhbHVlc1xuZnVuY3Rpb24gcG9wdWxhdGUgKHByb2Nlc3NFbnYsIHBhcnNlZCwgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IGRlYnVnID0gQm9vbGVhbihvcHRpb25zICYmIG9wdGlvbnMuZGVidWcpXG4gIGNvbnN0IG92ZXJyaWRlID0gQm9vbGVhbihvcHRpb25zICYmIG9wdGlvbnMub3ZlcnJpZGUpXG5cbiAgaWYgKHR5cGVvZiBwYXJzZWQgIT09ICdvYmplY3QnKSB7XG4gICAgY29uc3QgZXJyID0gbmV3IEVycm9yKCdPQkpFQ1RfUkVRVUlSRUQ6IFBsZWFzZSBjaGVjayB0aGUgcHJvY2Vzc0VudiBhcmd1bWVudCBiZWluZyBwYXNzZWQgdG8gcG9wdWxhdGUnKVxuICAgIGVyci5jb2RlID0gJ09CSkVDVF9SRVFVSVJFRCdcbiAgICB0aHJvdyBlcnJcbiAgfVxuXG4gIC8vIFNldCBwcm9jZXNzLmVudlxuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhwYXJzZWQpKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChwcm9jZXNzRW52LCBrZXkpKSB7XG4gICAgICBpZiAob3ZlcnJpZGUgPT09IHRydWUpIHtcbiAgICAgICAgcHJvY2Vzc0VudltrZXldID0gcGFyc2VkW2tleV1cbiAgICAgIH1cblxuICAgICAgaWYgKGRlYnVnKSB7XG4gICAgICAgIGlmIChvdmVycmlkZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIF9kZWJ1ZyhgXCIke2tleX1cIiBpcyBhbHJlYWR5IGRlZmluZWQgYW5kIFdBUyBvdmVyd3JpdHRlbmApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX2RlYnVnKGBcIiR7a2V5fVwiIGlzIGFscmVhZHkgZGVmaW5lZCBhbmQgd2FzIE5PVCBvdmVyd3JpdHRlbmApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcHJvY2Vzc0VudltrZXldID0gcGFyc2VkW2tleV1cbiAgICB9XG4gIH1cbn1cblxuY29uc3QgRG90ZW52TW9kdWxlID0ge1xuICBjb25maWdEb3RlbnYsXG4gIF9jb25maWdWYXVsdCxcbiAgX3BhcnNlVmF1bHQsXG4gIGNvbmZpZyxcbiAgZGVjcnlwdCxcbiAgcGFyc2UsXG4gIHBvcHVsYXRlXG59XG5cbm1vZHVsZS5leHBvcnRzLmNvbmZpZ0RvdGVudiA9IERvdGVudk1vZHVsZS5jb25maWdEb3RlbnZcbm1vZHVsZS5leHBvcnRzLl9jb25maWdWYXVsdCA9IERvdGVudk1vZHVsZS5fY29uZmlnVmF1bHRcbm1vZHVsZS5leHBvcnRzLl9wYXJzZVZhdWx0ID0gRG90ZW52TW9kdWxlLl9wYXJzZVZhdWx0XG5tb2R1bGUuZXhwb3J0cy5jb25maWcgPSBEb3RlbnZNb2R1bGUuY29uZmlnXG5tb2R1bGUuZXhwb3J0cy5kZWNyeXB0ID0gRG90ZW52TW9kdWxlLmRlY3J5cHRcbm1vZHVsZS5leHBvcnRzLnBhcnNlID0gRG90ZW52TW9kdWxlLnBhcnNlXG5tb2R1bGUuZXhwb3J0cy5wb3B1bGF0ZSA9IERvdGVudk1vZHVsZS5wb3B1bGF0ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IERvdGVudk1vZHVsZVxuIiwgIi8vIC4uL2NvbmZpZy5qcyBhY2NlcHRzIG9wdGlvbnMgdmlhIGVudmlyb25tZW50IHZhcmlhYmxlc1xuY29uc3Qgb3B0aW9ucyA9IHt9XG5cbmlmIChwcm9jZXNzLmVudi5ET1RFTlZfQ09ORklHX0VOQ09ESU5HICE9IG51bGwpIHtcbiAgb3B0aW9ucy5lbmNvZGluZyA9IHByb2Nlc3MuZW52LkRPVEVOVl9DT05GSUdfRU5DT0RJTkdcbn1cblxuaWYgKHByb2Nlc3MuZW52LkRPVEVOVl9DT05GSUdfUEFUSCAhPSBudWxsKSB7XG4gIG9wdGlvbnMucGF0aCA9IHByb2Nlc3MuZW52LkRPVEVOVl9DT05GSUdfUEFUSFxufVxuXG5pZiAocHJvY2Vzcy5lbnYuRE9URU5WX0NPTkZJR19ERUJVRyAhPSBudWxsKSB7XG4gIG9wdGlvbnMuZGVidWcgPSBwcm9jZXNzLmVudi5ET1RFTlZfQ09ORklHX0RFQlVHXG59XG5cbmlmIChwcm9jZXNzLmVudi5ET1RFTlZfQ09ORklHX09WRVJSSURFICE9IG51bGwpIHtcbiAgb3B0aW9ucy5vdmVycmlkZSA9IHByb2Nlc3MuZW52LkRPVEVOVl9DT05GSUdfT1ZFUlJJREVcbn1cblxuaWYgKHByb2Nlc3MuZW52LkRPVEVOVl9DT05GSUdfRE9URU5WX0tFWSAhPSBudWxsKSB7XG4gIG9wdGlvbnMuRE9URU5WX0tFWSA9IHByb2Nlc3MuZW52LkRPVEVOVl9DT05GSUdfRE9URU5WX0tFWVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG9wdGlvbnNcbiIsICJjb25zdCByZSA9IC9eZG90ZW52X2NvbmZpZ18oZW5jb2Rpbmd8cGF0aHxkZWJ1Z3xvdmVycmlkZXxET1RFTlZfS0VZKT0oLispJC9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBvcHRpb25NYXRjaGVyIChhcmdzKSB7XG4gIHJldHVybiBhcmdzLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBjdXIpIHtcbiAgICBjb25zdCBtYXRjaGVzID0gY3VyLm1hdGNoKHJlKVxuICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICBhY2NbbWF0Y2hlc1sxXV0gPSBtYXRjaGVzWzJdXG4gICAgfVxuICAgIHJldHVybiBhY2NcbiAgfSwge30pXG59XG4iLCAiY29uc3QgeyBUcmFuc2Zvcm0gfSA9IHJlcXVpcmUoJ3N0cmVhbScpXG5cbmNvbnN0IFtjcl0gPSBCdWZmZXIuZnJvbSgnXFxyJylcbmNvbnN0IFtubF0gPSBCdWZmZXIuZnJvbSgnXFxuJylcbmNvbnN0IGRlZmF1bHRzID0ge1xuICBlc2NhcGU6ICdcIicsXG4gIGhlYWRlcnM6IG51bGwsXG4gIG1hcEhlYWRlcnM6ICh7IGhlYWRlciB9KSA9PiBoZWFkZXIsXG4gIG1hcFZhbHVlczogKHsgdmFsdWUgfSkgPT4gdmFsdWUsXG4gIG5ld2xpbmU6ICdcXG4nLFxuICBxdW90ZTogJ1wiJyxcbiAgcmF3OiBmYWxzZSxcbiAgc2VwYXJhdG9yOiAnLCcsXG4gIHNraXBDb21tZW50czogZmFsc2UsXG4gIHNraXBMaW5lczogbnVsbCxcbiAgbWF4Um93Qnl0ZXM6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSLFxuICBzdHJpY3Q6IGZhbHNlXG59XG5cbmNsYXNzIENzdlBhcnNlciBleHRlbmRzIFRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yIChvcHRzID0ge30pIHtcbiAgICBzdXBlcih7IG9iamVjdE1vZGU6IHRydWUsIGhpZ2hXYXRlck1hcms6IDE2IH0pXG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShvcHRzKSkgb3B0cyA9IHsgaGVhZGVyczogb3B0cyB9XG5cbiAgICBjb25zdCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdHMpXG5cbiAgICBvcHRpb25zLmN1c3RvbU5ld2xpbmUgPSBvcHRpb25zLm5ld2xpbmUgIT09IGRlZmF1bHRzLm5ld2xpbmVcblxuICAgIGZvciAoY29uc3Qga2V5IG9mIFsnbmV3bGluZScsICdxdW90ZScsICdzZXBhcmF0b3InXSkge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zW2tleV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIChbb3B0aW9uc1trZXldXSA9IEJ1ZmZlci5mcm9tKG9wdGlvbnNba2V5XSkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaWYgZXNjYXBlIGlzIG5vdCBkZWZpbmVkIG9uIHRoZSBwYXNzZWQgb3B0aW9ucywgdXNlIHRoZSBlbmQgdmFsdWUgb2YgcXVvdGVcbiAgICBvcHRpb25zLmVzY2FwZSA9IChvcHRzIHx8IHt9KS5lc2NhcGUgPyBCdWZmZXIuZnJvbShvcHRpb25zLmVzY2FwZSlbMF0gOiBvcHRpb25zLnF1b3RlXG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZW1wdHk6IG9wdGlvbnMucmF3ID8gQnVmZmVyLmFsbG9jKDApIDogJycsXG4gICAgICBlc2NhcGVkOiBmYWxzZSxcbiAgICAgIGZpcnN0OiB0cnVlLFxuICAgICAgbGluZU51bWJlcjogMCxcbiAgICAgIHByZXZpb3VzRW5kOiAwLFxuICAgICAgcm93TGVuZ3RoOiAwLFxuICAgICAgcXVvdGVkOiBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuX3ByZXYgPSBudWxsXG5cbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzID09PSBmYWxzZSkge1xuICAgICAgLy8gZW5mb3JjZSwgYXMgdGhlIGNvbHVtbiBsZW5ndGggY2hlY2sgd2lsbCBmYWlsIGlmIGhlYWRlcnM6ZmFsc2VcbiAgICAgIG9wdGlvbnMuc3RyaWN0ID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8IG9wdGlvbnMuaGVhZGVycyA9PT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuc3RhdGUuZmlyc3QgPSBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnNcbiAgfVxuXG4gIHBhcnNlQ2VsbCAoYnVmZmVyLCBzdGFydCwgZW5kKSB7XG4gICAgY29uc3QgeyBlc2NhcGUsIHF1b3RlIH0gPSB0aGlzLm9wdGlvbnNcbiAgICAvLyByZW1vdmUgcXVvdGVzIGZyb20gcXVvdGVkIGNlbGxzXG4gICAgaWYgKGJ1ZmZlcltzdGFydF0gPT09IHF1b3RlICYmIGJ1ZmZlcltlbmQgLSAxXSA9PT0gcXVvdGUpIHtcbiAgICAgIHN0YXJ0KytcbiAgICAgIGVuZC0tXG4gICAgfVxuXG4gICAgbGV0IHkgPSBzdGFydFxuXG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIC8vIGNoZWNrIGZvciBlc2NhcGUgY2hhcmFjdGVycyBhbmQgc2tpcCB0aGVtXG4gICAgICBpZiAoYnVmZmVyW2ldID09PSBlc2NhcGUgJiYgaSArIDEgPCBlbmQgJiYgYnVmZmVyW2kgKyAxXSA9PT0gcXVvdGUpIHtcbiAgICAgICAgaSsrXG4gICAgICB9XG5cbiAgICAgIGlmICh5ICE9PSBpKSB7XG4gICAgICAgIGJ1ZmZlclt5XSA9IGJ1ZmZlcltpXVxuICAgICAgfVxuICAgICAgeSsrXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucGFyc2VWYWx1ZShidWZmZXIsIHN0YXJ0LCB5KVxuICB9XG5cbiAgcGFyc2VMaW5lIChidWZmZXIsIHN0YXJ0LCBlbmQpIHtcbiAgICBjb25zdCB7IGN1c3RvbU5ld2xpbmUsIGVzY2FwZSwgbWFwSGVhZGVycywgbWFwVmFsdWVzLCBxdW90ZSwgc2VwYXJhdG9yLCBza2lwQ29tbWVudHMsIHNraXBMaW5lcyB9ID0gdGhpcy5vcHRpb25zXG5cbiAgICBlbmQtLSAvLyB0cmltIG5ld2xpbmVcbiAgICBpZiAoIWN1c3RvbU5ld2xpbmUgJiYgYnVmZmVyLmxlbmd0aCAmJiBidWZmZXJbZW5kIC0gMV0gPT09IGNyKSB7XG4gICAgICBlbmQtLVxuICAgIH1cblxuICAgIGNvbnN0IGNvbW1hID0gc2VwYXJhdG9yXG4gICAgY29uc3QgY2VsbHMgPSBbXVxuICAgIGxldCBpc1F1b3RlZCA9IGZhbHNlXG4gICAgbGV0IG9mZnNldCA9IHN0YXJ0XG5cbiAgICBpZiAoc2tpcENvbW1lbnRzKSB7XG4gICAgICBjb25zdCBjaGFyID0gdHlwZW9mIHNraXBDb21tZW50cyA9PT0gJ3N0cmluZycgPyBza2lwQ29tbWVudHMgOiAnIydcbiAgICAgIGlmIChidWZmZXJbc3RhcnRdID09PSBCdWZmZXIuZnJvbShjaGFyKVswXSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBtYXBWYWx1ZSA9ICh2YWx1ZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuZmlyc3QpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gY2VsbHMubGVuZ3RoXG4gICAgICBjb25zdCBoZWFkZXIgPSB0aGlzLmhlYWRlcnNbaW5kZXhdXG5cbiAgICAgIHJldHVybiBtYXBWYWx1ZXMoeyBoZWFkZXIsIGluZGV4LCB2YWx1ZSB9KVxuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICBjb25zdCBpc1N0YXJ0aW5nUXVvdGUgPSAhaXNRdW90ZWQgJiYgYnVmZmVyW2ldID09PSBxdW90ZVxuICAgICAgY29uc3QgaXNFbmRpbmdRdW90ZSA9IGlzUXVvdGVkICYmIGJ1ZmZlcltpXSA9PT0gcXVvdGUgJiYgaSArIDEgPD0gZW5kICYmIGJ1ZmZlcltpICsgMV0gPT09IGNvbW1hXG4gICAgICBjb25zdCBpc0VzY2FwZSA9IGlzUXVvdGVkICYmIGJ1ZmZlcltpXSA9PT0gZXNjYXBlICYmIGkgKyAxIDwgZW5kICYmIGJ1ZmZlcltpICsgMV0gPT09IHF1b3RlXG5cbiAgICAgIGlmIChpc1N0YXJ0aW5nUXVvdGUgfHwgaXNFbmRpbmdRdW90ZSkge1xuICAgICAgICBpc1F1b3RlZCA9ICFpc1F1b3RlZFxuICAgICAgICBjb250aW51ZVxuICAgICAgfSBlbHNlIGlmIChpc0VzY2FwZSkge1xuICAgICAgICBpKytcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYgKGJ1ZmZlcltpXSA9PT0gY29tbWEgJiYgIWlzUXVvdGVkKSB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMucGFyc2VDZWxsKGJ1ZmZlciwgb2Zmc2V0LCBpKVxuICAgICAgICB2YWx1ZSA9IG1hcFZhbHVlKHZhbHVlKVxuICAgICAgICBjZWxscy5wdXNoKHZhbHVlKVxuICAgICAgICBvZmZzZXQgPSBpICsgMVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvZmZzZXQgPCBlbmQpIHtcbiAgICAgIGxldCB2YWx1ZSA9IHRoaXMucGFyc2VDZWxsKGJ1ZmZlciwgb2Zmc2V0LCBlbmQpXG4gICAgICB2YWx1ZSA9IG1hcFZhbHVlKHZhbHVlKVxuICAgICAgY2VsbHMucHVzaCh2YWx1ZSlcbiAgICB9XG5cbiAgICBpZiAoYnVmZmVyW2VuZCAtIDFdID09PSBjb21tYSkge1xuICAgICAgY2VsbHMucHVzaChtYXBWYWx1ZSh0aGlzLnN0YXRlLmVtcHR5KSlcbiAgICB9XG5cbiAgICBjb25zdCBza2lwID0gc2tpcExpbmVzICYmIHNraXBMaW5lcyA+IHRoaXMuc3RhdGUubGluZU51bWJlclxuICAgIHRoaXMuc3RhdGUubGluZU51bWJlcisrXG5cbiAgICBpZiAodGhpcy5zdGF0ZS5maXJzdCAmJiAhc2tpcCkge1xuICAgICAgdGhpcy5zdGF0ZS5maXJzdCA9IGZhbHNlXG4gICAgICB0aGlzLmhlYWRlcnMgPSBjZWxscy5tYXAoKGhlYWRlciwgaW5kZXgpID0+IG1hcEhlYWRlcnMoeyBoZWFkZXIsIGluZGV4IH0pKVxuXG4gICAgICB0aGlzLmVtaXQoJ2hlYWRlcnMnLCB0aGlzLmhlYWRlcnMpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoIXNraXAgJiYgdGhpcy5vcHRpb25zLnN0cmljdCAmJiBjZWxscy5sZW5ndGggIT09IHRoaXMuaGVhZGVycy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGUgPSBuZXcgUmFuZ2VFcnJvcignUm93IGxlbmd0aCBkb2VzIG5vdCBtYXRjaCBoZWFkZXJzJylcbiAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXNraXApIHRoaXMud3JpdGVSb3coY2VsbHMpXG4gICAgfVxuICB9XG5cbiAgcGFyc2VWYWx1ZSAoYnVmZmVyLCBzdGFydCwgZW5kKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5yYXcpIHtcbiAgICAgIHJldHVybiBidWZmZXIuc2xpY2Uoc3RhcnQsIGVuZClcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmZmVyLnRvU3RyaW5nKCd1dGYtOCcsIHN0YXJ0LCBlbmQpXG4gIH1cblxuICB3cml0ZVJvdyAoY2VsbHMpIHtcbiAgICBjb25zdCBoZWFkZXJzID0gKHRoaXMuaGVhZGVycyA9PT0gZmFsc2UpID8gY2VsbHMubWFwKCh2YWx1ZSwgaW5kZXgpID0+IGluZGV4KSA6IHRoaXMuaGVhZGVyc1xuXG4gICAgY29uc3Qgcm93ID0gY2VsbHMucmVkdWNlKChvLCBjZWxsLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgaGVhZGVyID0gaGVhZGVyc1tpbmRleF1cbiAgICAgIGlmIChoZWFkZXIgPT09IG51bGwpIHJldHVybiBvIC8vIHNraXAgY29sdW1uc1xuICAgICAgaWYgKGhlYWRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG9baGVhZGVyXSA9IGNlbGxcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9bYF8ke2luZGV4fWBdID0gY2VsbFxuICAgICAgfVxuICAgICAgcmV0dXJuIG9cbiAgICB9LCB7fSlcblxuICAgIHRoaXMucHVzaChyb3cpXG4gIH1cblxuICBfZmx1c2ggKGNiKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuZXNjYXBlZCB8fCAhdGhpcy5fcHJldikgcmV0dXJuIGNiKClcbiAgICB0aGlzLnBhcnNlTGluZSh0aGlzLl9wcmV2LCB0aGlzLnN0YXRlLnByZXZpb3VzRW5kLCB0aGlzLl9wcmV2Lmxlbmd0aCArIDEpIC8vIHBsdXMgc2luY2Ugb25saW5lIC0xc1xuICAgIGNiKClcbiAgfVxuXG4gIF90cmFuc2Zvcm0gKGRhdGEsIGVuYywgY2IpIHtcbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICBkYXRhID0gQnVmZmVyLmZyb20oZGF0YSlcbiAgICB9XG5cbiAgICBjb25zdCB7IGVzY2FwZSwgcXVvdGUgfSA9IHRoaXMub3B0aW9uc1xuICAgIGxldCBzdGFydCA9IDBcbiAgICBsZXQgYnVmZmVyID0gZGF0YVxuXG4gICAgaWYgKHRoaXMuX3ByZXYpIHtcbiAgICAgIHN0YXJ0ID0gdGhpcy5fcHJldi5sZW5ndGhcbiAgICAgIGJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW3RoaXMuX3ByZXYsIGRhdGFdKVxuICAgICAgdGhpcy5fcHJldiA9IG51bGxcbiAgICB9XG5cbiAgICBjb25zdCBidWZmZXJMZW5ndGggPSBidWZmZXIubGVuZ3RoXG5cbiAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBidWZmZXJMZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hyID0gYnVmZmVyW2ldXG4gICAgICBjb25zdCBuZXh0Q2hyID0gaSArIDEgPCBidWZmZXJMZW5ndGggPyBidWZmZXJbaSArIDFdIDogbnVsbFxuXG4gICAgICB0aGlzLnN0YXRlLnJvd0xlbmd0aCsrXG4gICAgICBpZiAodGhpcy5zdGF0ZS5yb3dMZW5ndGggPiB0aGlzLm9wdGlvbnMubWF4Um93Qnl0ZXMpIHtcbiAgICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignUm93IGV4Y2VlZHMgdGhlIG1heGltdW0gc2l6ZScpKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuc3RhdGUuZXNjYXBlZCAmJiBjaHIgPT09IGVzY2FwZSAmJiBuZXh0Q2hyID09PSBxdW90ZSAmJiBpICE9PSBzdGFydCkge1xuICAgICAgICB0aGlzLnN0YXRlLmVzY2FwZWQgPSB0cnVlXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9IGVsc2UgaWYgKGNociA9PT0gcXVvdGUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXNjYXBlZCkge1xuICAgICAgICAgIHRoaXMuc3RhdGUuZXNjYXBlZCA9IGZhbHNlXG4gICAgICAgICAgLy8gbm9uLWVzY2FwZWQgcXVvdGUgKHF1b3RpbmcgdGhlIGNlbGwpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zdGF0ZS5xdW90ZWQgPSAhdGhpcy5zdGF0ZS5xdW90ZWRcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuc3RhdGUucXVvdGVkKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZpcnN0ICYmICF0aGlzLm9wdGlvbnMuY3VzdG9tTmV3bGluZSkge1xuICAgICAgICAgIGlmIChjaHIgPT09IG5sKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMubmV3bGluZSA9IG5sXG4gICAgICAgICAgfSBlbHNlIGlmIChjaHIgPT09IGNyKSB7XG4gICAgICAgICAgICBpZiAobmV4dENociAhPT0gbmwpIHtcbiAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLm5ld2xpbmUgPSBjclxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaHIgPT09IHRoaXMub3B0aW9ucy5uZXdsaW5lKSB7XG4gICAgICAgICAgdGhpcy5wYXJzZUxpbmUoYnVmZmVyLCB0aGlzLnN0YXRlLnByZXZpb3VzRW5kLCBpICsgMSlcbiAgICAgICAgICB0aGlzLnN0YXRlLnByZXZpb3VzRW5kID0gaSArIDFcbiAgICAgICAgICB0aGlzLnN0YXRlLnJvd0xlbmd0aCA9IDBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YXRlLnByZXZpb3VzRW5kID09PSBidWZmZXJMZW5ndGgpIHtcbiAgICAgIHRoaXMuc3RhdGUucHJldmlvdXNFbmQgPSAwXG4gICAgICByZXR1cm4gY2IoKVxuICAgIH1cblxuICAgIGlmIChidWZmZXJMZW5ndGggLSB0aGlzLnN0YXRlLnByZXZpb3VzRW5kIDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX3ByZXYgPSBkYXRhXG4gICAgICB0aGlzLnN0YXRlLnByZXZpb3VzRW5kIC09IChidWZmZXJMZW5ndGggLSBkYXRhLmxlbmd0aClcbiAgICAgIHJldHVybiBjYigpXG4gICAgfVxuXG4gICAgdGhpcy5fcHJldiA9IGJ1ZmZlclxuICAgIGNiKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IChvcHRzKSA9PiBuZXcgQ3N2UGFyc2VyKG9wdHMpXG4iLCAidmFyIGNvbnN0YW50cyA9IHJlcXVpcmUoJ2NvbnN0YW50cycpXG5cbnZhciBvcmlnQ3dkID0gcHJvY2Vzcy5jd2RcbnZhciBjd2QgPSBudWxsXG5cbnZhciBwbGF0Zm9ybSA9IHByb2Nlc3MuZW52LkdSQUNFRlVMX0ZTX1BMQVRGT1JNIHx8IHByb2Nlc3MucGxhdGZvcm1cblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFjd2QpXG4gICAgY3dkID0gb3JpZ0N3ZC5jYWxsKHByb2Nlc3MpXG4gIHJldHVybiBjd2Rcbn1cbnRyeSB7XG4gIHByb2Nlc3MuY3dkKClcbn0gY2F0Y2ggKGVyKSB7fVxuXG4vLyBUaGlzIGNoZWNrIGlzIG5lZWRlZCB1bnRpbCBub2RlLmpzIDEyIGlzIHJlcXVpcmVkXG5pZiAodHlwZW9mIHByb2Nlc3MuY2hkaXIgPT09ICdmdW5jdGlvbicpIHtcbiAgdmFyIGNoZGlyID0gcHJvY2Vzcy5jaGRpclxuICBwcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGQpIHtcbiAgICBjd2QgPSBudWxsXG4gICAgY2hkaXIuY2FsbChwcm9jZXNzLCBkKVxuICB9XG4gIGlmIChPYmplY3Quc2V0UHJvdG90eXBlT2YpIE9iamVjdC5zZXRQcm90b3R5cGVPZihwcm9jZXNzLmNoZGlyLCBjaGRpcilcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwYXRjaFxuXG5mdW5jdGlvbiBwYXRjaCAoZnMpIHtcbiAgLy8gKHJlLSlpbXBsZW1lbnQgc29tZSB0aGluZ3MgdGhhdCBhcmUga25vd24gYnVzdGVkIG9yIG1pc3NpbmcuXG5cbiAgLy8gbGNobW9kLCBicm9rZW4gcHJpb3IgdG8gMC42LjJcbiAgLy8gYmFjay1wb3J0IHRoZSBmaXggaGVyZS5cbiAgaWYgKGNvbnN0YW50cy5oYXNPd25Qcm9wZXJ0eSgnT19TWU1MSU5LJykgJiZcbiAgICAgIHByb2Nlc3MudmVyc2lvbi5tYXRjaCgvXnYwXFwuNlxcLlswLTJdfF52MFxcLjVcXC4vKSkge1xuICAgIHBhdGNoTGNobW9kKGZzKVxuICB9XG5cbiAgLy8gbHV0aW1lcyBpbXBsZW1lbnRhdGlvbiwgb3Igbm8tb3BcbiAgaWYgKCFmcy5sdXRpbWVzKSB7XG4gICAgcGF0Y2hMdXRpbWVzKGZzKVxuICB9XG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2lzYWFjcy9ub2RlLWdyYWNlZnVsLWZzL2lzc3Vlcy80XG4gIC8vIENob3duIHNob3VsZCBub3QgZmFpbCBvbiBlaW52YWwgb3IgZXBlcm0gaWYgbm9uLXJvb3QuXG4gIC8vIEl0IHNob3VsZCBub3QgZmFpbCBvbiBlbm9zeXMgZXZlciwgYXMgdGhpcyBqdXN0IGluZGljYXRlc1xuICAvLyB0aGF0IGEgZnMgZG9lc24ndCBzdXBwb3J0IHRoZSBpbnRlbmRlZCBvcGVyYXRpb24uXG5cbiAgZnMuY2hvd24gPSBjaG93bkZpeChmcy5jaG93bilcbiAgZnMuZmNob3duID0gY2hvd25GaXgoZnMuZmNob3duKVxuICBmcy5sY2hvd24gPSBjaG93bkZpeChmcy5sY2hvd24pXG5cbiAgZnMuY2htb2QgPSBjaG1vZEZpeChmcy5jaG1vZClcbiAgZnMuZmNobW9kID0gY2htb2RGaXgoZnMuZmNobW9kKVxuICBmcy5sY2htb2QgPSBjaG1vZEZpeChmcy5sY2htb2QpXG5cbiAgZnMuY2hvd25TeW5jID0gY2hvd25GaXhTeW5jKGZzLmNob3duU3luYylcbiAgZnMuZmNob3duU3luYyA9IGNob3duRml4U3luYyhmcy5mY2hvd25TeW5jKVxuICBmcy5sY2hvd25TeW5jID0gY2hvd25GaXhTeW5jKGZzLmxjaG93blN5bmMpXG5cbiAgZnMuY2htb2RTeW5jID0gY2htb2RGaXhTeW5jKGZzLmNobW9kU3luYylcbiAgZnMuZmNobW9kU3luYyA9IGNobW9kRml4U3luYyhmcy5mY2htb2RTeW5jKVxuICBmcy5sY2htb2RTeW5jID0gY2htb2RGaXhTeW5jKGZzLmxjaG1vZFN5bmMpXG5cbiAgZnMuc3RhdCA9IHN0YXRGaXgoZnMuc3RhdClcbiAgZnMuZnN0YXQgPSBzdGF0Rml4KGZzLmZzdGF0KVxuICBmcy5sc3RhdCA9IHN0YXRGaXgoZnMubHN0YXQpXG5cbiAgZnMuc3RhdFN5bmMgPSBzdGF0Rml4U3luYyhmcy5zdGF0U3luYylcbiAgZnMuZnN0YXRTeW5jID0gc3RhdEZpeFN5bmMoZnMuZnN0YXRTeW5jKVxuICBmcy5sc3RhdFN5bmMgPSBzdGF0Rml4U3luYyhmcy5sc3RhdFN5bmMpXG5cbiAgLy8gaWYgbGNobW9kL2xjaG93biBkbyBub3QgZXhpc3QsIHRoZW4gbWFrZSB0aGVtIG5vLW9wc1xuICBpZiAoZnMuY2htb2QgJiYgIWZzLmxjaG1vZCkge1xuICAgIGZzLmxjaG1vZCA9IGZ1bmN0aW9uIChwYXRoLCBtb2RlLCBjYikge1xuICAgICAgaWYgKGNiKSBwcm9jZXNzLm5leHRUaWNrKGNiKVxuICAgIH1cbiAgICBmcy5sY2htb2RTeW5jID0gZnVuY3Rpb24gKCkge31cbiAgfVxuICBpZiAoZnMuY2hvd24gJiYgIWZzLmxjaG93bikge1xuICAgIGZzLmxjaG93biA9IGZ1bmN0aW9uIChwYXRoLCB1aWQsIGdpZCwgY2IpIHtcbiAgICAgIGlmIChjYikgcHJvY2Vzcy5uZXh0VGljayhjYilcbiAgICB9XG4gICAgZnMubGNob3duU3luYyA9IGZ1bmN0aW9uICgpIHt9XG4gIH1cblxuICAvLyBvbiBXaW5kb3dzLCBBL1Ygc29mdHdhcmUgY2FuIGxvY2sgdGhlIGRpcmVjdG9yeSwgY2F1c2luZyB0aGlzXG4gIC8vIHRvIGZhaWwgd2l0aCBhbiBFQUNDRVMgb3IgRVBFUk0gaWYgdGhlIGRpcmVjdG9yeSBjb250YWlucyBuZXdseVxuICAvLyBjcmVhdGVkIGZpbGVzLiAgVHJ5IGFnYWluIG9uIGZhaWx1cmUsIGZvciB1cCB0byA2MCBzZWNvbmRzLlxuXG4gIC8vIFNldCB0aGUgdGltZW91dCB0aGlzIGxvbmcgYmVjYXVzZSBzb21lIFdpbmRvd3MgQW50aS1WaXJ1cywgc3VjaCBhcyBQYXJpdHlcbiAgLy8gYml0OSwgbWF5IGxvY2sgZmlsZXMgZm9yIHVwIHRvIGEgbWludXRlLCBjYXVzaW5nIG5wbSBwYWNrYWdlIGluc3RhbGxcbiAgLy8gZmFpbHVyZXMuIEFsc28sIHRha2UgY2FyZSB0byB5aWVsZCB0aGUgc2NoZWR1bGVyLiBXaW5kb3dzIHNjaGVkdWxpbmcgZ2l2ZXNcbiAgLy8gQ1BVIHRvIGEgYnVzeSBsb29waW5nIHByb2Nlc3MsIHdoaWNoIGNhbiBjYXVzZSB0aGUgcHJvZ3JhbSBjYXVzaW5nIHRoZSBsb2NrXG4gIC8vIGNvbnRlbnRpb24gdG8gYmUgc3RhcnZlZCBvZiBDUFUgYnkgbm9kZSwgc28gdGhlIGNvbnRlbnRpb24gZG9lc24ndCByZXNvbHZlLlxuICBpZiAocGxhdGZvcm0gPT09IFwid2luMzJcIikge1xuICAgIGZzLnJlbmFtZSA9IHR5cGVvZiBmcy5yZW5hbWUgIT09ICdmdW5jdGlvbicgPyBmcy5yZW5hbWVcbiAgICA6IChmdW5jdGlvbiAoZnMkcmVuYW1lKSB7XG4gICAgICBmdW5jdGlvbiByZW5hbWUgKGZyb20sIHRvLCBjYikge1xuICAgICAgICB2YXIgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgICAgIHZhciBiYWNrb2ZmID0gMDtcbiAgICAgICAgZnMkcmVuYW1lKGZyb20sIHRvLCBmdW5jdGlvbiBDQiAoZXIpIHtcbiAgICAgICAgICBpZiAoZXJcbiAgICAgICAgICAgICAgJiYgKGVyLmNvZGUgPT09IFwiRUFDQ0VTXCIgfHwgZXIuY29kZSA9PT0gXCJFUEVSTVwiIHx8IGVyLmNvZGUgPT09IFwiRUJVU1lcIilcbiAgICAgICAgICAgICAgJiYgRGF0ZS5ub3coKSAtIHN0YXJ0IDwgNjAwMDApIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGZzLnN0YXQodG8sIGZ1bmN0aW9uIChzdGF0ZXIsIHN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlciAmJiBzdGF0ZXIuY29kZSA9PT0gXCJFTk9FTlRcIilcbiAgICAgICAgICAgICAgICAgIGZzJHJlbmFtZShmcm9tLCB0bywgQ0IpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIGNiKGVyKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSwgYmFja29mZilcbiAgICAgICAgICAgIGlmIChiYWNrb2ZmIDwgMTAwKVxuICAgICAgICAgICAgICBiYWNrb2ZmICs9IDEwO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2IpIGNiKGVyKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikgT2JqZWN0LnNldFByb3RvdHlwZU9mKHJlbmFtZSwgZnMkcmVuYW1lKVxuICAgICAgcmV0dXJuIHJlbmFtZVxuICAgIH0pKGZzLnJlbmFtZSlcbiAgfVxuXG4gIC8vIGlmIHJlYWQoKSByZXR1cm5zIEVBR0FJTiwgdGhlbiBqdXN0IHRyeSBpdCBhZ2Fpbi5cbiAgZnMucmVhZCA9IHR5cGVvZiBmcy5yZWFkICE9PSAnZnVuY3Rpb24nID8gZnMucmVhZFxuICA6IChmdW5jdGlvbiAoZnMkcmVhZCkge1xuICAgIGZ1bmN0aW9uIHJlYWQgKGZkLCBidWZmZXIsIG9mZnNldCwgbGVuZ3RoLCBwb3NpdGlvbiwgY2FsbGJhY2tfKSB7XG4gICAgICB2YXIgY2FsbGJhY2tcbiAgICAgIGlmIChjYWxsYmFja18gJiYgdHlwZW9mIGNhbGxiYWNrXyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgZWFnQ291bnRlciA9IDBcbiAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAoZXIsIF8sIF9fKSB7XG4gICAgICAgICAgaWYgKGVyICYmIGVyLmNvZGUgPT09ICdFQUdBSU4nICYmIGVhZ0NvdW50ZXIgPCAxMCkge1xuICAgICAgICAgICAgZWFnQ291bnRlciArK1xuICAgICAgICAgICAgcmV0dXJuIGZzJHJlYWQuY2FsbChmcywgZmQsIGJ1ZmZlciwgb2Zmc2V0LCBsZW5ndGgsIHBvc2l0aW9uLCBjYWxsYmFjaylcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FsbGJhY2tfLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZzJHJlYWQuY2FsbChmcywgZmQsIGJ1ZmZlciwgb2Zmc2V0LCBsZW5ndGgsIHBvc2l0aW9uLCBjYWxsYmFjaylcbiAgICB9XG5cbiAgICAvLyBUaGlzIGVuc3VyZXMgYHV0aWwucHJvbWlzaWZ5YCB3b3JrcyBhcyBpdCBkb2VzIGZvciBuYXRpdmUgYGZzLnJlYWRgLlxuICAgIGlmIChPYmplY3Quc2V0UHJvdG90eXBlT2YpIE9iamVjdC5zZXRQcm90b3R5cGVPZihyZWFkLCBmcyRyZWFkKVxuICAgIHJldHVybiByZWFkXG4gIH0pKGZzLnJlYWQpXG5cbiAgZnMucmVhZFN5bmMgPSB0eXBlb2YgZnMucmVhZFN5bmMgIT09ICdmdW5jdGlvbicgPyBmcy5yZWFkU3luY1xuICA6IChmdW5jdGlvbiAoZnMkcmVhZFN5bmMpIHsgcmV0dXJuIGZ1bmN0aW9uIChmZCwgYnVmZmVyLCBvZmZzZXQsIGxlbmd0aCwgcG9zaXRpb24pIHtcbiAgICB2YXIgZWFnQ291bnRlciA9IDBcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGZzJHJlYWRTeW5jLmNhbGwoZnMsIGZkLCBidWZmZXIsIG9mZnNldCwgbGVuZ3RoLCBwb3NpdGlvbilcbiAgICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICAgIGlmIChlci5jb2RlID09PSAnRUFHQUlOJyAmJiBlYWdDb3VudGVyIDwgMTApIHtcbiAgICAgICAgICBlYWdDb3VudGVyICsrXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlclxuICAgICAgfVxuICAgIH1cbiAgfX0pKGZzLnJlYWRTeW5jKVxuXG4gIGZ1bmN0aW9uIHBhdGNoTGNobW9kIChmcykge1xuICAgIGZzLmxjaG1vZCA9IGZ1bmN0aW9uIChwYXRoLCBtb2RlLCBjYWxsYmFjaykge1xuICAgICAgZnMub3BlbiggcGF0aFxuICAgICAgICAgICAgICwgY29uc3RhbnRzLk9fV1JPTkxZIHwgY29uc3RhbnRzLk9fU1lNTElOS1xuICAgICAgICAgICAgICwgbW9kZVxuICAgICAgICAgICAgICwgZnVuY3Rpb24gKGVyciwgZmQpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZXJyKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIC8vIHByZWZlciB0byByZXR1cm4gdGhlIGNobW9kIGVycm9yLCBpZiBvbmUgb2NjdXJzLFxuICAgICAgICAvLyBidXQgc3RpbGwgdHJ5IHRvIGNsb3NlLCBhbmQgcmVwb3J0IGNsb3NpbmcgZXJyb3JzIGlmIHRoZXkgb2NjdXIuXG4gICAgICAgIGZzLmZjaG1vZChmZCwgbW9kZSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgIGZzLmNsb3NlKGZkLCBmdW5jdGlvbihlcnIyKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKGVyciB8fCBlcnIyKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cblxuICAgIGZzLmxjaG1vZFN5bmMgPSBmdW5jdGlvbiAocGF0aCwgbW9kZSkge1xuICAgICAgdmFyIGZkID0gZnMub3BlblN5bmMocGF0aCwgY29uc3RhbnRzLk9fV1JPTkxZIHwgY29uc3RhbnRzLk9fU1lNTElOSywgbW9kZSlcblxuICAgICAgLy8gcHJlZmVyIHRvIHJldHVybiB0aGUgY2htb2QgZXJyb3IsIGlmIG9uZSBvY2N1cnMsXG4gICAgICAvLyBidXQgc3RpbGwgdHJ5IHRvIGNsb3NlLCBhbmQgcmVwb3J0IGNsb3NpbmcgZXJyb3JzIGlmIHRoZXkgb2NjdXIuXG4gICAgICB2YXIgdGhyZXcgPSB0cnVlXG4gICAgICB2YXIgcmV0XG4gICAgICB0cnkge1xuICAgICAgICByZXQgPSBmcy5mY2htb2RTeW5jKGZkLCBtb2RlKVxuICAgICAgICB0aHJldyA9IGZhbHNlXG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAodGhyZXcpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMuY2xvc2VTeW5jKGZkKVxuICAgICAgICAgIH0gY2F0Y2ggKGVyKSB7fVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZzLmNsb3NlU3luYyhmZClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJldFxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhdGNoTHV0aW1lcyAoZnMpIHtcbiAgICBpZiAoY29uc3RhbnRzLmhhc093blByb3BlcnR5KFwiT19TWU1MSU5LXCIpICYmIGZzLmZ1dGltZXMpIHtcbiAgICAgIGZzLmx1dGltZXMgPSBmdW5jdGlvbiAocGF0aCwgYXQsIG10LCBjYikge1xuICAgICAgICBmcy5vcGVuKHBhdGgsIGNvbnN0YW50cy5PX1NZTUxJTkssIGZ1bmN0aW9uIChlciwgZmQpIHtcbiAgICAgICAgICBpZiAoZXIpIHtcbiAgICAgICAgICAgIGlmIChjYikgY2IoZXIpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgZnMuZnV0aW1lcyhmZCwgYXQsIG10LCBmdW5jdGlvbiAoZXIpIHtcbiAgICAgICAgICAgIGZzLmNsb3NlKGZkLCBmdW5jdGlvbiAoZXIyKSB7XG4gICAgICAgICAgICAgIGlmIChjYikgY2IoZXIgfHwgZXIyKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBmcy5sdXRpbWVzU3luYyA9IGZ1bmN0aW9uIChwYXRoLCBhdCwgbXQpIHtcbiAgICAgICAgdmFyIGZkID0gZnMub3BlblN5bmMocGF0aCwgY29uc3RhbnRzLk9fU1lNTElOSylcbiAgICAgICAgdmFyIHJldFxuICAgICAgICB2YXIgdGhyZXcgPSB0cnVlXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0ID0gZnMuZnV0aW1lc1N5bmMoZmQsIGF0LCBtdClcbiAgICAgICAgICB0aHJldyA9IGZhbHNlXG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKHRocmV3KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBmcy5jbG9zZVN5bmMoZmQpXG4gICAgICAgICAgICB9IGNhdGNoIChlcikge31cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnMuY2xvc2VTeW5jKGZkKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0XG4gICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKGZzLmZ1dGltZXMpIHtcbiAgICAgIGZzLmx1dGltZXMgPSBmdW5jdGlvbiAoX2EsIF9iLCBfYywgY2IpIHsgaWYgKGNiKSBwcm9jZXNzLm5leHRUaWNrKGNiKSB9XG4gICAgICBmcy5sdXRpbWVzU3luYyA9IGZ1bmN0aW9uICgpIHt9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2htb2RGaXggKG9yaWcpIHtcbiAgICBpZiAoIW9yaWcpIHJldHVybiBvcmlnXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG1vZGUsIGNiKSB7XG4gICAgICByZXR1cm4gb3JpZy5jYWxsKGZzLCB0YXJnZXQsIG1vZGUsIGZ1bmN0aW9uIChlcikge1xuICAgICAgICBpZiAoY2hvd25Fck9rKGVyKSkgZXIgPSBudWxsXG4gICAgICAgIGlmIChjYikgY2IuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaG1vZEZpeFN5bmMgKG9yaWcpIHtcbiAgICBpZiAoIW9yaWcpIHJldHVybiBvcmlnXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG1vZGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBvcmlnLmNhbGwoZnMsIHRhcmdldCwgbW9kZSlcbiAgICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICAgIGlmICghY2hvd25Fck9rKGVyKSkgdGhyb3cgZXJcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIGZ1bmN0aW9uIGNob3duRml4IChvcmlnKSB7XG4gICAgaWYgKCFvcmlnKSByZXR1cm4gb3JpZ1xuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCB1aWQsIGdpZCwgY2IpIHtcbiAgICAgIHJldHVybiBvcmlnLmNhbGwoZnMsIHRhcmdldCwgdWlkLCBnaWQsIGZ1bmN0aW9uIChlcikge1xuICAgICAgICBpZiAoY2hvd25Fck9rKGVyKSkgZXIgPSBudWxsXG4gICAgICAgIGlmIChjYikgY2IuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaG93bkZpeFN5bmMgKG9yaWcpIHtcbiAgICBpZiAoIW9yaWcpIHJldHVybiBvcmlnXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIHVpZCwgZ2lkKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gb3JpZy5jYWxsKGZzLCB0YXJnZXQsIHVpZCwgZ2lkKVxuICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgaWYgKCFjaG93bkVyT2soZXIpKSB0aHJvdyBlclxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXRGaXggKG9yaWcpIHtcbiAgICBpZiAoIW9yaWcpIHJldHVybiBvcmlnXG4gICAgLy8gT2xkZXIgdmVyc2lvbnMgb2YgTm9kZSBlcnJvbmVvdXNseSByZXR1cm5lZCBzaWduZWQgaW50ZWdlcnMgZm9yXG4gICAgLy8gdWlkICsgZ2lkLlxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBvcHRpb25zLCBjYikge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNiID0gb3B0aW9uc1xuICAgICAgICBvcHRpb25zID0gbnVsbFxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gY2FsbGJhY2sgKGVyLCBzdGF0cykge1xuICAgICAgICBpZiAoc3RhdHMpIHtcbiAgICAgICAgICBpZiAoc3RhdHMudWlkIDwgMCkgc3RhdHMudWlkICs9IDB4MTAwMDAwMDAwXG4gICAgICAgICAgaWYgKHN0YXRzLmdpZCA8IDApIHN0YXRzLmdpZCArPSAweDEwMDAwMDAwMFxuICAgICAgICB9XG4gICAgICAgIGlmIChjYikgY2IuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9wdGlvbnMgPyBvcmlnLmNhbGwoZnMsIHRhcmdldCwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgICAgIDogb3JpZy5jYWxsKGZzLCB0YXJnZXQsIGNhbGxiYWNrKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXRGaXhTeW5jIChvcmlnKSB7XG4gICAgaWYgKCFvcmlnKSByZXR1cm4gb3JpZ1xuICAgIC8vIE9sZGVyIHZlcnNpb25zIG9mIE5vZGUgZXJyb25lb3VzbHkgcmV0dXJuZWQgc2lnbmVkIGludGVnZXJzIGZvclxuICAgIC8vIHVpZCArIGdpZC5cbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgb3B0aW9ucykge1xuICAgICAgdmFyIHN0YXRzID0gb3B0aW9ucyA/IG9yaWcuY2FsbChmcywgdGFyZ2V0LCBvcHRpb25zKVxuICAgICAgICA6IG9yaWcuY2FsbChmcywgdGFyZ2V0KVxuICAgICAgaWYgKHN0YXRzKSB7XG4gICAgICAgIGlmIChzdGF0cy51aWQgPCAwKSBzdGF0cy51aWQgKz0gMHgxMDAwMDAwMDBcbiAgICAgICAgaWYgKHN0YXRzLmdpZCA8IDApIHN0YXRzLmdpZCArPSAweDEwMDAwMDAwMFxuICAgICAgfVxuICAgICAgcmV0dXJuIHN0YXRzO1xuICAgIH1cbiAgfVxuXG4gIC8vIEVOT1NZUyBtZWFucyB0aGF0IHRoZSBmcyBkb2Vzbid0IHN1cHBvcnQgdGhlIG9wLiBKdXN0IGlnbm9yZVxuICAvLyB0aGF0LCBiZWNhdXNlIGl0IGRvZXNuJ3QgbWF0dGVyLlxuICAvL1xuICAvLyBpZiB0aGVyZSdzIG5vIGdldHVpZCwgb3IgaWYgZ2V0dWlkKCkgaXMgc29tZXRoaW5nIG90aGVyXG4gIC8vIHRoYW4gMCwgYW5kIHRoZSBlcnJvciBpcyBFSU5WQUwgb3IgRVBFUk0sIHRoZW4ganVzdCBpZ25vcmVcbiAgLy8gaXQuXG4gIC8vXG4gIC8vIFRoaXMgc3BlY2lmaWMgY2FzZSBpcyBhIHNpbGVudCBmYWlsdXJlIGluIGNwLCBpbnN0YWxsLCB0YXIsXG4gIC8vIGFuZCBtb3N0IG90aGVyIHVuaXggdG9vbHMgdGhhdCBtYW5hZ2UgcGVybWlzc2lvbnMuXG4gIC8vXG4gIC8vIFdoZW4gcnVubmluZyBhcyByb290LCBvciBpZiBvdGhlciB0eXBlcyBvZiBlcnJvcnMgYXJlXG4gIC8vIGVuY291bnRlcmVkLCB0aGVuIGl0J3Mgc3RyaWN0LlxuICBmdW5jdGlvbiBjaG93bkVyT2sgKGVyKSB7XG4gICAgaWYgKCFlcilcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBpZiAoZXIuY29kZSA9PT0gXCJFTk9TWVNcIilcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICB2YXIgbm9ucm9vdCA9ICFwcm9jZXNzLmdldHVpZCB8fCBwcm9jZXNzLmdldHVpZCgpICE9PSAwXG4gICAgaWYgKG5vbnJvb3QpIHtcbiAgICAgIGlmIChlci5jb2RlID09PSBcIkVJTlZBTFwiIHx8IGVyLmNvZGUgPT09IFwiRVBFUk1cIilcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuIiwgInZhciBTdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKS5TdHJlYW1cblxubW9kdWxlLmV4cG9ydHMgPSBsZWdhY3lcblxuZnVuY3Rpb24gbGVnYWN5IChmcykge1xuICByZXR1cm4ge1xuICAgIFJlYWRTdHJlYW06IFJlYWRTdHJlYW0sXG4gICAgV3JpdGVTdHJlYW06IFdyaXRlU3RyZWFtXG4gIH1cblxuICBmdW5jdGlvbiBSZWFkU3RyZWFtIChwYXRoLCBvcHRpb25zKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJlYWRTdHJlYW0pKSByZXR1cm4gbmV3IFJlYWRTdHJlYW0ocGF0aCwgb3B0aW9ucyk7XG5cbiAgICBTdHJlYW0uY2FsbCh0aGlzKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgdGhpcy5mZCA9IG51bGw7XG4gICAgdGhpcy5yZWFkYWJsZSA9IHRydWU7XG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuZmxhZ3MgPSAncic7XG4gICAgdGhpcy5tb2RlID0gNDM4OyAvKj0wNjY2Ki9cbiAgICB0aGlzLmJ1ZmZlclNpemUgPSA2NCAqIDEwMjQ7XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIC8vIE1peGluIG9wdGlvbnMgaW50byB0aGlzXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvcHRpb25zKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaW5kZXhdO1xuICAgICAgdGhpc1trZXldID0gb3B0aW9uc1trZXldO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmVuY29kaW5nKSB0aGlzLnNldEVuY29kaW5nKHRoaXMuZW5jb2RpbmcpO1xuXG4gICAgaWYgKHRoaXMuc3RhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCdudW1iZXInICE9PSB0eXBlb2YgdGhpcy5zdGFydCkge1xuICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ3N0YXJ0IG11c3QgYmUgYSBOdW1iZXInKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmVuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuZW5kID0gSW5maW5pdHk7XG4gICAgICB9IGVsc2UgaWYgKCdudW1iZXInICE9PSB0eXBlb2YgdGhpcy5lbmQpIHtcbiAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdlbmQgbXVzdCBiZSBhIE51bWJlcicpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zdGFydCA+IHRoaXMuZW5kKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignc3RhcnQgbXVzdCBiZSA8PSBlbmQnKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wb3MgPSB0aGlzLnN0YXJ0O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmZkICE9PSBudWxsKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLl9yZWFkKCk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmcy5vcGVuKHRoaXMucGF0aCwgdGhpcy5mbGFncywgdGhpcy5tb2RlLCBmdW5jdGlvbiAoZXJyLCBmZCkge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBzZWxmLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgc2VsZi5yZWFkYWJsZSA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuZmQgPSBmZDtcbiAgICAgIHNlbGYuZW1pdCgnb3BlbicsIGZkKTtcbiAgICAgIHNlbGYuX3JlYWQoKTtcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gV3JpdGVTdHJlYW0gKHBhdGgsIG9wdGlvbnMpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgV3JpdGVTdHJlYW0pKSByZXR1cm4gbmV3IFdyaXRlU3RyZWFtKHBhdGgsIG9wdGlvbnMpO1xuXG4gICAgU3RyZWFtLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgIHRoaXMuZmQgPSBudWxsO1xuICAgIHRoaXMud3JpdGFibGUgPSB0cnVlO1xuXG4gICAgdGhpcy5mbGFncyA9ICd3JztcbiAgICB0aGlzLmVuY29kaW5nID0gJ2JpbmFyeSc7XG4gICAgdGhpcy5tb2RlID0gNDM4OyAvKj0wNjY2Ki9cbiAgICB0aGlzLmJ5dGVzV3JpdHRlbiA9IDA7XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIC8vIE1peGluIG9wdGlvbnMgaW50byB0aGlzXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvcHRpb25zKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaW5kZXhdO1xuICAgICAgdGhpc1trZXldID0gb3B0aW9uc1trZXldO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICgnbnVtYmVyJyAhPT0gdHlwZW9mIHRoaXMuc3RhcnQpIHtcbiAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdzdGFydCBtdXN0IGJlIGEgTnVtYmVyJyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zdGFydCA8IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzdGFydCBtdXN0IGJlID49IHplcm8nKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wb3MgPSB0aGlzLnN0YXJ0O1xuICAgIH1cblxuICAgIHRoaXMuYnVzeSA9IGZhbHNlO1xuICAgIHRoaXMuX3F1ZXVlID0gW107XG5cbiAgICBpZiAodGhpcy5mZCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5fb3BlbiA9IGZzLm9wZW47XG4gICAgICB0aGlzLl9xdWV1ZS5wdXNoKFt0aGlzLl9vcGVuLCB0aGlzLnBhdGgsIHRoaXMuZmxhZ3MsIHRoaXMubW9kZSwgdW5kZWZpbmVkXSk7XG4gICAgICB0aGlzLmZsdXNoKCk7XG4gICAgfVxuICB9XG59XG4iLCAiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVcblxudmFyIGdldFByb3RvdHlwZU9mID0gT2JqZWN0LmdldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iai5fX3Byb3RvX19cbn1cblxuZnVuY3Rpb24gY2xvbmUgKG9iaikge1xuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogIT09ICdvYmplY3QnKVxuICAgIHJldHVybiBvYmpcblxuICBpZiAob2JqIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgIHZhciBjb3B5ID0geyBfX3Byb3RvX186IGdldFByb3RvdHlwZU9mKG9iaikgfVxuICBlbHNlXG4gICAgdmFyIGNvcHkgPSBPYmplY3QuY3JlYXRlKG51bGwpXG5cbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29weSwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KSlcbiAgfSlcblxuICByZXR1cm4gY29weVxufVxuIiwgInZhciBmcyA9IHJlcXVpcmUoJ2ZzJylcbnZhciBwb2x5ZmlsbHMgPSByZXF1aXJlKCcuL3BvbHlmaWxscy5qcycpXG52YXIgbGVnYWN5ID0gcmVxdWlyZSgnLi9sZWdhY3ktc3RyZWFtcy5qcycpXG52YXIgY2xvbmUgPSByZXF1aXJlKCcuL2Nsb25lLmpzJylcblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJylcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgLSBub2RlIDAueCBwb2x5ZmlsbCAqL1xudmFyIGdyYWNlZnVsUXVldWVcbnZhciBwcmV2aW91c1N5bWJvbFxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAtIG5vZGUgMC54IHBvbHlmaWxsICovXG5pZiAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgU3ltYm9sLmZvciA9PT0gJ2Z1bmN0aW9uJykge1xuICBncmFjZWZ1bFF1ZXVlID0gU3ltYm9sLmZvcignZ3JhY2VmdWwtZnMucXVldWUnKVxuICAvLyBUaGlzIGlzIHVzZWQgaW4gdGVzdGluZyBieSBmdXR1cmUgdmVyc2lvbnNcbiAgcHJldmlvdXNTeW1ib2wgPSBTeW1ib2wuZm9yKCdncmFjZWZ1bC1mcy5wcmV2aW91cycpXG59IGVsc2Uge1xuICBncmFjZWZ1bFF1ZXVlID0gJ19fX2dyYWNlZnVsLWZzLnF1ZXVlJ1xuICBwcmV2aW91c1N5bWJvbCA9ICdfX19ncmFjZWZ1bC1mcy5wcmV2aW91cydcbn1cblxuZnVuY3Rpb24gbm9vcCAoKSB7fVxuXG5mdW5jdGlvbiBwdWJsaXNoUXVldWUoY29udGV4dCwgcXVldWUpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnRleHQsIGdyYWNlZnVsUXVldWUsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHF1ZXVlXG4gICAgfVxuICB9KVxufVxuXG52YXIgZGVidWcgPSBub29wXG5pZiAodXRpbC5kZWJ1Z2xvZylcbiAgZGVidWcgPSB1dGlsLmRlYnVnbG9nKCdnZnM0JylcbmVsc2UgaWYgKC9cXGJnZnM0XFxiL2kudGVzdChwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnKSlcbiAgZGVidWcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbSA9IHV0aWwuZm9ybWF0LmFwcGx5KHV0aWwsIGFyZ3VtZW50cylcbiAgICBtID0gJ0dGUzQ6ICcgKyBtLnNwbGl0KC9cXG4vKS5qb2luKCdcXG5HRlM0OiAnKVxuICAgIGNvbnNvbGUuZXJyb3IobSlcbiAgfVxuXG4vLyBPbmNlIHRpbWUgaW5pdGlhbGl6YXRpb25cbmlmICghZnNbZ3JhY2VmdWxRdWV1ZV0pIHtcbiAgLy8gVGhpcyBxdWV1ZSBjYW4gYmUgc2hhcmVkIGJ5IG11bHRpcGxlIGxvYWRlZCBpbnN0YW5jZXNcbiAgdmFyIHF1ZXVlID0gZ2xvYmFsW2dyYWNlZnVsUXVldWVdIHx8IFtdXG4gIHB1Ymxpc2hRdWV1ZShmcywgcXVldWUpXG5cbiAgLy8gUGF0Y2ggZnMuY2xvc2UvY2xvc2VTeW5jIHRvIHNoYXJlZCBxdWV1ZSB2ZXJzaW9uLCBiZWNhdXNlIHdlIG5lZWRcbiAgLy8gdG8gcmV0cnkoKSB3aGVuZXZlciBhIGNsb3NlIGhhcHBlbnMgKmFueXdoZXJlKiBpbiB0aGUgcHJvZ3JhbS5cbiAgLy8gVGhpcyBpcyBlc3NlbnRpYWwgd2hlbiBtdWx0aXBsZSBncmFjZWZ1bC1mcyBpbnN0YW5jZXMgYXJlXG4gIC8vIGluIHBsYXkgYXQgdGhlIHNhbWUgdGltZS5cbiAgZnMuY2xvc2UgPSAoZnVuY3Rpb24gKGZzJGNsb3NlKSB7XG4gICAgZnVuY3Rpb24gY2xvc2UgKGZkLCBjYikge1xuICAgICAgcmV0dXJuIGZzJGNsb3NlLmNhbGwoZnMsIGZkLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIC8vIFRoaXMgZnVuY3Rpb24gdXNlcyB0aGUgZ3JhY2VmdWwtZnMgc2hhcmVkIHF1ZXVlXG4gICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgcmVzZXRRdWV1ZSgpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgIGNiLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNsb3NlLCBwcmV2aW91c1N5bWJvbCwge1xuICAgICAgdmFsdWU6IGZzJGNsb3NlXG4gICAgfSlcbiAgICByZXR1cm4gY2xvc2VcbiAgfSkoZnMuY2xvc2UpXG5cbiAgZnMuY2xvc2VTeW5jID0gKGZ1bmN0aW9uIChmcyRjbG9zZVN5bmMpIHtcbiAgICBmdW5jdGlvbiBjbG9zZVN5bmMgKGZkKSB7XG4gICAgICAvLyBUaGlzIGZ1bmN0aW9uIHVzZXMgdGhlIGdyYWNlZnVsLWZzIHNoYXJlZCBxdWV1ZVxuICAgICAgZnMkY2xvc2VTeW5jLmFwcGx5KGZzLCBhcmd1bWVudHMpXG4gICAgICByZXNldFF1ZXVlKClcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xvc2VTeW5jLCBwcmV2aW91c1N5bWJvbCwge1xuICAgICAgdmFsdWU6IGZzJGNsb3NlU3luY1xuICAgIH0pXG4gICAgcmV0dXJuIGNsb3NlU3luY1xuICB9KShmcy5jbG9zZVN5bmMpXG5cbiAgaWYgKC9cXGJnZnM0XFxiL2kudGVzdChwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnKSkge1xuICAgIHByb2Nlc3Mub24oJ2V4aXQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKGZzW2dyYWNlZnVsUXVldWVdKVxuICAgICAgcmVxdWlyZSgnYXNzZXJ0JykuZXF1YWwoZnNbZ3JhY2VmdWxRdWV1ZV0ubGVuZ3RoLCAwKVxuICAgIH0pXG4gIH1cbn1cblxuaWYgKCFnbG9iYWxbZ3JhY2VmdWxRdWV1ZV0pIHtcbiAgcHVibGlzaFF1ZXVlKGdsb2JhbCwgZnNbZ3JhY2VmdWxRdWV1ZV0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGNoKGNsb25lKGZzKSlcbmlmIChwcm9jZXNzLmVudi5URVNUX0dSQUNFRlVMX0ZTX0dMT0JBTF9QQVRDSCAmJiAhZnMuX19wYXRjaGVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBwYXRjaChmcylcbiAgICBmcy5fX3BhdGNoZWQgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBwYXRjaCAoZnMpIHtcbiAgLy8gRXZlcnl0aGluZyB0aGF0IHJlZmVyZW5jZXMgdGhlIG9wZW4oKSBmdW5jdGlvbiBuZWVkcyB0byBiZSBpbiBoZXJlXG4gIHBvbHlmaWxscyhmcylcbiAgZnMuZ3JhY2VmdWxpZnkgPSBwYXRjaFxuXG4gIGZzLmNyZWF0ZVJlYWRTdHJlYW0gPSBjcmVhdGVSZWFkU3RyZWFtXG4gIGZzLmNyZWF0ZVdyaXRlU3RyZWFtID0gY3JlYXRlV3JpdGVTdHJlYW1cbiAgdmFyIGZzJHJlYWRGaWxlID0gZnMucmVhZEZpbGVcbiAgZnMucmVhZEZpbGUgPSByZWFkRmlsZVxuICBmdW5jdGlvbiByZWFkRmlsZSAocGF0aCwgb3B0aW9ucywgY2IpIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpXG4gICAgICBjYiA9IG9wdGlvbnMsIG9wdGlvbnMgPSBudWxsXG5cbiAgICByZXR1cm4gZ28kcmVhZEZpbGUocGF0aCwgb3B0aW9ucywgY2IpXG5cbiAgICBmdW5jdGlvbiBnbyRyZWFkRmlsZSAocGF0aCwgb3B0aW9ucywgY2IsIHN0YXJ0VGltZSkge1xuICAgICAgcmV0dXJuIGZzJHJlYWRGaWxlKHBhdGgsIG9wdGlvbnMsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgaWYgKGVyciAmJiAoZXJyLmNvZGUgPT09ICdFTUZJTEUnIHx8IGVyci5jb2RlID09PSAnRU5GSUxFJykpXG4gICAgICAgICAgZW5xdWV1ZShbZ28kcmVhZEZpbGUsIFtwYXRoLCBvcHRpb25zLCBjYl0sIGVyciwgc3RhcnRUaW1lIHx8IERhdGUubm93KCksIERhdGUubm93KCldKVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgY2IuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHZhciBmcyR3cml0ZUZpbGUgPSBmcy53cml0ZUZpbGVcbiAgZnMud3JpdGVGaWxlID0gd3JpdGVGaWxlXG4gIGZ1bmN0aW9uIHdyaXRlRmlsZSAocGF0aCwgZGF0YSwgb3B0aW9ucywgY2IpIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpXG4gICAgICBjYiA9IG9wdGlvbnMsIG9wdGlvbnMgPSBudWxsXG5cbiAgICByZXR1cm4gZ28kd3JpdGVGaWxlKHBhdGgsIGRhdGEsIG9wdGlvbnMsIGNiKVxuXG4gICAgZnVuY3Rpb24gZ28kd3JpdGVGaWxlIChwYXRoLCBkYXRhLCBvcHRpb25zLCBjYiwgc3RhcnRUaW1lKSB7XG4gICAgICByZXR1cm4gZnMkd3JpdGVGaWxlKHBhdGgsIGRhdGEsIG9wdGlvbnMsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgaWYgKGVyciAmJiAoZXJyLmNvZGUgPT09ICdFTUZJTEUnIHx8IGVyci5jb2RlID09PSAnRU5GSUxFJykpXG4gICAgICAgICAgZW5xdWV1ZShbZ28kd3JpdGVGaWxlLCBbcGF0aCwgZGF0YSwgb3B0aW9ucywgY2JdLCBlcnIsIHN0YXJ0VGltZSB8fCBEYXRlLm5vdygpLCBEYXRlLm5vdygpXSlcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIGNiLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICB2YXIgZnMkYXBwZW5kRmlsZSA9IGZzLmFwcGVuZEZpbGVcbiAgaWYgKGZzJGFwcGVuZEZpbGUpXG4gICAgZnMuYXBwZW5kRmlsZSA9IGFwcGVuZEZpbGVcbiAgZnVuY3Rpb24gYXBwZW5kRmlsZSAocGF0aCwgZGF0YSwgb3B0aW9ucywgY2IpIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpXG4gICAgICBjYiA9IG9wdGlvbnMsIG9wdGlvbnMgPSBudWxsXG5cbiAgICByZXR1cm4gZ28kYXBwZW5kRmlsZShwYXRoLCBkYXRhLCBvcHRpb25zLCBjYilcblxuICAgIGZ1bmN0aW9uIGdvJGFwcGVuZEZpbGUgKHBhdGgsIGRhdGEsIG9wdGlvbnMsIGNiLCBzdGFydFRpbWUpIHtcbiAgICAgIHJldHVybiBmcyRhcHBlbmRGaWxlKHBhdGgsIGRhdGEsIG9wdGlvbnMsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgaWYgKGVyciAmJiAoZXJyLmNvZGUgPT09ICdFTUZJTEUnIHx8IGVyci5jb2RlID09PSAnRU5GSUxFJykpXG4gICAgICAgICAgZW5xdWV1ZShbZ28kYXBwZW5kRmlsZSwgW3BhdGgsIGRhdGEsIG9wdGlvbnMsIGNiXSwgZXJyLCBzdGFydFRpbWUgfHwgRGF0ZS5ub3coKSwgRGF0ZS5ub3coKV0pXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICBjYi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgdmFyIGZzJGNvcHlGaWxlID0gZnMuY29weUZpbGVcbiAgaWYgKGZzJGNvcHlGaWxlKVxuICAgIGZzLmNvcHlGaWxlID0gY29weUZpbGVcbiAgZnVuY3Rpb24gY29weUZpbGUgKHNyYywgZGVzdCwgZmxhZ3MsIGNiKSB7XG4gICAgaWYgKHR5cGVvZiBmbGFncyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2IgPSBmbGFnc1xuICAgICAgZmxhZ3MgPSAwXG4gICAgfVxuICAgIHJldHVybiBnbyRjb3B5RmlsZShzcmMsIGRlc3QsIGZsYWdzLCBjYilcblxuICAgIGZ1bmN0aW9uIGdvJGNvcHlGaWxlIChzcmMsIGRlc3QsIGZsYWdzLCBjYiwgc3RhcnRUaW1lKSB7XG4gICAgICByZXR1cm4gZnMkY29weUZpbGUoc3JjLCBkZXN0LCBmbGFncywgZnVuY3Rpb24gKGVycikge1xuICAgICAgICBpZiAoZXJyICYmIChlcnIuY29kZSA9PT0gJ0VNRklMRScgfHwgZXJyLmNvZGUgPT09ICdFTkZJTEUnKSlcbiAgICAgICAgICBlbnF1ZXVlKFtnbyRjb3B5RmlsZSwgW3NyYywgZGVzdCwgZmxhZ3MsIGNiXSwgZXJyLCBzdGFydFRpbWUgfHwgRGF0ZS5ub3coKSwgRGF0ZS5ub3coKV0pXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICBjYi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgdmFyIGZzJHJlYWRkaXIgPSBmcy5yZWFkZGlyXG4gIGZzLnJlYWRkaXIgPSByZWFkZGlyXG4gIHZhciBub1JlYWRkaXJPcHRpb25WZXJzaW9ucyA9IC9edlswLTVdXFwuL1xuICBmdW5jdGlvbiByZWFkZGlyIChwYXRoLCBvcHRpb25zLCBjYikge1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgIGNiID0gb3B0aW9ucywgb3B0aW9ucyA9IG51bGxcblxuICAgIHZhciBnbyRyZWFkZGlyID0gbm9SZWFkZGlyT3B0aW9uVmVyc2lvbnMudGVzdChwcm9jZXNzLnZlcnNpb24pXG4gICAgICA/IGZ1bmN0aW9uIGdvJHJlYWRkaXIgKHBhdGgsIG9wdGlvbnMsIGNiLCBzdGFydFRpbWUpIHtcbiAgICAgICAgcmV0dXJuIGZzJHJlYWRkaXIocGF0aCwgZnMkcmVhZGRpckNhbGxiYWNrKFxuICAgICAgICAgIHBhdGgsIG9wdGlvbnMsIGNiLCBzdGFydFRpbWVcbiAgICAgICAgKSlcbiAgICAgIH1cbiAgICAgIDogZnVuY3Rpb24gZ28kcmVhZGRpciAocGF0aCwgb3B0aW9ucywgY2IsIHN0YXJ0VGltZSkge1xuICAgICAgICByZXR1cm4gZnMkcmVhZGRpcihwYXRoLCBvcHRpb25zLCBmcyRyZWFkZGlyQ2FsbGJhY2soXG4gICAgICAgICAgcGF0aCwgb3B0aW9ucywgY2IsIHN0YXJ0VGltZVxuICAgICAgICApKVxuICAgICAgfVxuXG4gICAgcmV0dXJuIGdvJHJlYWRkaXIocGF0aCwgb3B0aW9ucywgY2IpXG5cbiAgICBmdW5jdGlvbiBmcyRyZWFkZGlyQ2FsbGJhY2sgKHBhdGgsIG9wdGlvbnMsIGNiLCBzdGFydFRpbWUpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXJyLCBmaWxlcykge1xuICAgICAgICBpZiAoZXJyICYmIChlcnIuY29kZSA9PT0gJ0VNRklMRScgfHwgZXJyLmNvZGUgPT09ICdFTkZJTEUnKSlcbiAgICAgICAgICBlbnF1ZXVlKFtcbiAgICAgICAgICAgIGdvJHJlYWRkaXIsXG4gICAgICAgICAgICBbcGF0aCwgb3B0aW9ucywgY2JdLFxuICAgICAgICAgICAgZXJyLFxuICAgICAgICAgICAgc3RhcnRUaW1lIHx8IERhdGUubm93KCksXG4gICAgICAgICAgICBEYXRlLm5vdygpXG4gICAgICAgICAgXSlcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKGZpbGVzICYmIGZpbGVzLnNvcnQpXG4gICAgICAgICAgICBmaWxlcy5zb3J0KClcblxuICAgICAgICAgIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICBjYi5jYWxsKHRoaXMsIGVyciwgZmlsZXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAocHJvY2Vzcy52ZXJzaW9uLnN1YnN0cigwLCA0KSA9PT0gJ3YwLjgnKSB7XG4gICAgdmFyIGxlZ1N0cmVhbXMgPSBsZWdhY3koZnMpXG4gICAgUmVhZFN0cmVhbSA9IGxlZ1N0cmVhbXMuUmVhZFN0cmVhbVxuICAgIFdyaXRlU3RyZWFtID0gbGVnU3RyZWFtcy5Xcml0ZVN0cmVhbVxuICB9XG5cbiAgdmFyIGZzJFJlYWRTdHJlYW0gPSBmcy5SZWFkU3RyZWFtXG4gIGlmIChmcyRSZWFkU3RyZWFtKSB7XG4gICAgUmVhZFN0cmVhbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKGZzJFJlYWRTdHJlYW0ucHJvdG90eXBlKVxuICAgIFJlYWRTdHJlYW0ucHJvdG90eXBlLm9wZW4gPSBSZWFkU3RyZWFtJG9wZW5cbiAgfVxuXG4gIHZhciBmcyRXcml0ZVN0cmVhbSA9IGZzLldyaXRlU3RyZWFtXG4gIGlmIChmcyRXcml0ZVN0cmVhbSkge1xuICAgIFdyaXRlU3RyZWFtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoZnMkV3JpdGVTdHJlYW0ucHJvdG90eXBlKVxuICAgIFdyaXRlU3RyZWFtLnByb3RvdHlwZS5vcGVuID0gV3JpdGVTdHJlYW0kb3BlblxuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGZzLCAnUmVhZFN0cmVhbScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSZWFkU3RyZWFtXG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIFJlYWRTdHJlYW0gPSB2YWxcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmcywgJ1dyaXRlU3RyZWFtJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFdyaXRlU3RyZWFtXG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIFdyaXRlU3RyZWFtID0gdmFsXG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KVxuXG4gIC8vIGxlZ2FjeSBuYW1lc1xuICB2YXIgRmlsZVJlYWRTdHJlYW0gPSBSZWFkU3RyZWFtXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmcywgJ0ZpbGVSZWFkU3RyZWFtJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIEZpbGVSZWFkU3RyZWFtXG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIEZpbGVSZWFkU3RyZWFtID0gdmFsXG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KVxuICB2YXIgRmlsZVdyaXRlU3RyZWFtID0gV3JpdGVTdHJlYW1cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGZzLCAnRmlsZVdyaXRlU3RyZWFtJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIEZpbGVXcml0ZVN0cmVhbVxuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICBGaWxlV3JpdGVTdHJlYW0gPSB2YWxcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pXG5cbiAgZnVuY3Rpb24gUmVhZFN0cmVhbSAocGF0aCwgb3B0aW9ucykge1xuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgUmVhZFN0cmVhbSlcbiAgICAgIHJldHVybiBmcyRSZWFkU3RyZWFtLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksIHRoaXNcbiAgICBlbHNlXG4gICAgICByZXR1cm4gUmVhZFN0cmVhbS5hcHBseShPYmplY3QuY3JlYXRlKFJlYWRTdHJlYW0ucHJvdG90eXBlKSwgYXJndW1lbnRzKVxuICB9XG5cbiAgZnVuY3Rpb24gUmVhZFN0cmVhbSRvcGVuICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICBvcGVuKHRoYXQucGF0aCwgdGhhdC5mbGFncywgdGhhdC5tb2RlLCBmdW5jdGlvbiAoZXJyLCBmZCkge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBpZiAodGhhdC5hdXRvQ2xvc2UpXG4gICAgICAgICAgdGhhdC5kZXN0cm95KClcblxuICAgICAgICB0aGF0LmVtaXQoJ2Vycm9yJywgZXJyKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhhdC5mZCA9IGZkXG4gICAgICAgIHRoYXQuZW1pdCgnb3BlbicsIGZkKVxuICAgICAgICB0aGF0LnJlYWQoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBXcml0ZVN0cmVhbSAocGF0aCwgb3B0aW9ucykge1xuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgV3JpdGVTdHJlYW0pXG4gICAgICByZXR1cm4gZnMkV3JpdGVTdHJlYW0uYXBwbHkodGhpcywgYXJndW1lbnRzKSwgdGhpc1xuICAgIGVsc2VcbiAgICAgIHJldHVybiBXcml0ZVN0cmVhbS5hcHBseShPYmplY3QuY3JlYXRlKFdyaXRlU3RyZWFtLnByb3RvdHlwZSksIGFyZ3VtZW50cylcbiAgfVxuXG4gIGZ1bmN0aW9uIFdyaXRlU3RyZWFtJG9wZW4gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIG9wZW4odGhhdC5wYXRoLCB0aGF0LmZsYWdzLCB0aGF0Lm1vZGUsIGZ1bmN0aW9uIChlcnIsIGZkKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHRoYXQuZGVzdHJveSgpXG4gICAgICAgIHRoYXQuZW1pdCgnZXJyb3InLCBlcnIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGF0LmZkID0gZmRcbiAgICAgICAgdGhhdC5lbWl0KCdvcGVuJywgZmQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJlYWRTdHJlYW0gKHBhdGgsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IGZzLlJlYWRTdHJlYW0ocGF0aCwgb3B0aW9ucylcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVdyaXRlU3RyZWFtIChwYXRoLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBmcy5Xcml0ZVN0cmVhbShwYXRoLCBvcHRpb25zKVxuICB9XG5cbiAgdmFyIGZzJG9wZW4gPSBmcy5vcGVuXG4gIGZzLm9wZW4gPSBvcGVuXG4gIGZ1bmN0aW9uIG9wZW4gKHBhdGgsIGZsYWdzLCBtb2RlLCBjYikge1xuICAgIGlmICh0eXBlb2YgbW9kZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgIGNiID0gbW9kZSwgbW9kZSA9IG51bGxcblxuICAgIHJldHVybiBnbyRvcGVuKHBhdGgsIGZsYWdzLCBtb2RlLCBjYilcblxuICAgIGZ1bmN0aW9uIGdvJG9wZW4gKHBhdGgsIGZsYWdzLCBtb2RlLCBjYiwgc3RhcnRUaW1lKSB7XG4gICAgICByZXR1cm4gZnMkb3BlbihwYXRoLCBmbGFncywgbW9kZSwgZnVuY3Rpb24gKGVyciwgZmQpIHtcbiAgICAgICAgaWYgKGVyciAmJiAoZXJyLmNvZGUgPT09ICdFTUZJTEUnIHx8IGVyci5jb2RlID09PSAnRU5GSUxFJykpXG4gICAgICAgICAgZW5xdWV1ZShbZ28kb3BlbiwgW3BhdGgsIGZsYWdzLCBtb2RlLCBjYl0sIGVyciwgc3RhcnRUaW1lIHx8IERhdGUubm93KCksIERhdGUubm93KCldKVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgY2IuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmc1xufVxuXG5mdW5jdGlvbiBlbnF1ZXVlIChlbGVtKSB7XG4gIGRlYnVnKCdFTlFVRVVFJywgZWxlbVswXS5uYW1lLCBlbGVtWzFdKVxuICBmc1tncmFjZWZ1bFF1ZXVlXS5wdXNoKGVsZW0pXG4gIHJldHJ5KClcbn1cblxuLy8ga2VlcCB0cmFjayBvZiB0aGUgdGltZW91dCBiZXR3ZWVuIHJldHJ5KCkgY2FsbHNcbnZhciByZXRyeVRpbWVyXG5cbi8vIHJlc2V0IHRoZSBzdGFydFRpbWUgYW5kIGxhc3RUaW1lIHRvIG5vd1xuLy8gdGhpcyByZXNldHMgdGhlIHN0YXJ0IG9mIHRoZSA2MCBzZWNvbmQgb3ZlcmFsbCB0aW1lb3V0IGFzIHdlbGwgYXMgdGhlXG4vLyBkZWxheSBiZXR3ZWVuIGF0dGVtcHRzIHNvIHRoYXQgd2UnbGwgcmV0cnkgdGhlc2Ugam9icyBzb29uZXJcbmZ1bmN0aW9uIHJlc2V0UXVldWUgKCkge1xuICB2YXIgbm93ID0gRGF0ZS5ub3coKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGZzW2dyYWNlZnVsUXVldWVdLmxlbmd0aDsgKytpKSB7XG4gICAgLy8gZW50cmllcyB0aGF0IGFyZSBvbmx5IGEgbGVuZ3RoIG9mIDIgYXJlIGZyb20gYW4gb2xkZXIgdmVyc2lvbiwgZG9uJ3RcbiAgICAvLyBib3RoZXIgbW9kaWZ5aW5nIHRob3NlIHNpbmNlIHRoZXknbGwgYmUgcmV0cmllZCBhbnl3YXkuXG4gICAgaWYgKGZzW2dyYWNlZnVsUXVldWVdW2ldLmxlbmd0aCA+IDIpIHtcbiAgICAgIGZzW2dyYWNlZnVsUXVldWVdW2ldWzNdID0gbm93IC8vIHN0YXJ0VGltZVxuICAgICAgZnNbZ3JhY2VmdWxRdWV1ZV1baV1bNF0gPSBub3cgLy8gbGFzdFRpbWVcbiAgICB9XG4gIH1cbiAgLy8gY2FsbCByZXRyeSB0byBtYWtlIHN1cmUgd2UncmUgYWN0aXZlbHkgcHJvY2Vzc2luZyB0aGUgcXVldWVcbiAgcmV0cnkoKVxufVxuXG5mdW5jdGlvbiByZXRyeSAoKSB7XG4gIC8vIGNsZWFyIHRoZSB0aW1lciBhbmQgcmVtb3ZlIGl0IHRvIGhlbHAgcHJldmVudCB1bmludGVuZGVkIGNvbmN1cnJlbmN5XG4gIGNsZWFyVGltZW91dChyZXRyeVRpbWVyKVxuICByZXRyeVRpbWVyID0gdW5kZWZpbmVkXG5cbiAgaWYgKGZzW2dyYWNlZnVsUXVldWVdLmxlbmd0aCA9PT0gMClcbiAgICByZXR1cm5cblxuICB2YXIgZWxlbSA9IGZzW2dyYWNlZnVsUXVldWVdLnNoaWZ0KClcbiAgdmFyIGZuID0gZWxlbVswXVxuICB2YXIgYXJncyA9IGVsZW1bMV1cbiAgLy8gdGhlc2UgaXRlbXMgbWF5IGJlIHVuc2V0IGlmIHRoZXkgd2VyZSBhZGRlZCBieSBhbiBvbGRlciBncmFjZWZ1bC1mc1xuICB2YXIgZXJyID0gZWxlbVsyXVxuICB2YXIgc3RhcnRUaW1lID0gZWxlbVszXVxuICB2YXIgbGFzdFRpbWUgPSBlbGVtWzRdXG5cbiAgLy8gaWYgd2UgZG9uJ3QgaGF2ZSBhIHN0YXJ0VGltZSB3ZSBoYXZlIG5vIHdheSBvZiBrbm93aW5nIGlmIHdlJ3ZlIHdhaXRlZFxuICAvLyBsb25nIGVub3VnaCwgc28gZ28gYWhlYWQgYW5kIHJldHJ5IHRoaXMgaXRlbSBub3dcbiAgaWYgKHN0YXJ0VGltZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZGVidWcoJ1JFVFJZJywgZm4ubmFtZSwgYXJncylcbiAgICBmbi5hcHBseShudWxsLCBhcmdzKVxuICB9IGVsc2UgaWYgKERhdGUubm93KCkgLSBzdGFydFRpbWUgPj0gNjAwMDApIHtcbiAgICAvLyBpdCdzIGJlZW4gbW9yZSB0aGFuIDYwIHNlY29uZHMgdG90YWwsIGJhaWwgbm93XG4gICAgZGVidWcoJ1RJTUVPVVQnLCBmbi5uYW1lLCBhcmdzKVxuICAgIHZhciBjYiA9IGFyZ3MucG9wKClcbiAgICBpZiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKVxuICAgICAgY2IuY2FsbChudWxsLCBlcnIpXG4gIH0gZWxzZSB7XG4gICAgLy8gdGhlIGFtb3VudCBvZiB0aW1lIGJldHdlZW4gdGhlIGxhc3QgYXR0ZW1wdCBhbmQgcmlnaHQgbm93XG4gICAgdmFyIHNpbmNlQXR0ZW1wdCA9IERhdGUubm93KCkgLSBsYXN0VGltZVxuICAgIC8vIHRoZSBhbW91bnQgb2YgdGltZSBiZXR3ZWVuIHdoZW4gd2UgZmlyc3QgdHJpZWQsIGFuZCB3aGVuIHdlIGxhc3QgdHJpZWRcbiAgICAvLyByb3VuZGVkIHVwIHRvIGF0IGxlYXN0IDFcbiAgICB2YXIgc2luY2VTdGFydCA9IE1hdGgubWF4KGxhc3RUaW1lIC0gc3RhcnRUaW1lLCAxKVxuICAgIC8vIGJhY2tvZmYuIHdhaXQgbG9uZ2VyIHRoYW4gdGhlIHRvdGFsIHRpbWUgd2UndmUgYmVlbiByZXRyeWluZywgYnV0IG9ubHlcbiAgICAvLyB1cCB0byBhIG1heGltdW0gb2YgMTAwbXNcbiAgICB2YXIgZGVzaXJlZERlbGF5ID0gTWF0aC5taW4oc2luY2VTdGFydCAqIDEuMiwgMTAwKVxuICAgIC8vIGl0J3MgYmVlbiBsb25nIGVub3VnaCBzaW5jZSB0aGUgbGFzdCByZXRyeSwgZG8gaXQgYWdhaW5cbiAgICBpZiAoc2luY2VBdHRlbXB0ID49IGRlc2lyZWREZWxheSkge1xuICAgICAgZGVidWcoJ1JFVFJZJywgZm4ubmFtZSwgYXJncylcbiAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtzdGFydFRpbWVdKSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaWYgd2UgY2FuJ3QgZG8gdGhpcyBqb2IgeWV0LCBwdXNoIGl0IHRvIHRoZSBlbmQgb2YgdGhlIHF1ZXVlXG4gICAgICAvLyBhbmQgbGV0IHRoZSBuZXh0IGl0ZXJhdGlvbiBjaGVjayBhZ2FpblxuICAgICAgZnNbZ3JhY2VmdWxRdWV1ZV0ucHVzaChlbGVtKVxuICAgIH1cbiAgfVxuXG4gIC8vIHNjaGVkdWxlIG91ciBuZXh0IHJ1biBpZiBvbmUgaXNuJ3QgYWxyZWFkeSBzY2hlZHVsZWRcbiAgaWYgKHJldHJ5VGltZXIgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHJ5VGltZXIgPSBzZXRUaW1lb3V0KHJldHJ5LCAwKVxuICB9XG59XG4iLCAiZnVuY3Rpb24gUmV0cnlPcGVyYXRpb24odGltZW91dHMsIG9wdGlvbnMpIHtcbiAgLy8gQ29tcGF0aWJpbGl0eSBmb3IgdGhlIG9sZCAodGltZW91dHMsIHJldHJ5Rm9yZXZlcikgc2lnbmF0dXJlXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgb3B0aW9ucyA9IHsgZm9yZXZlcjogb3B0aW9ucyB9O1xuICB9XG5cbiAgdGhpcy5fb3JpZ2luYWxUaW1lb3V0cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGltZW91dHMpKTtcbiAgdGhpcy5fdGltZW91dHMgPSB0aW1lb3V0cztcbiAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMuX21heFJldHJ5VGltZSA9IG9wdGlvbnMgJiYgb3B0aW9ucy5tYXhSZXRyeVRpbWUgfHwgSW5maW5pdHk7XG4gIHRoaXMuX2ZuID0gbnVsbDtcbiAgdGhpcy5fZXJyb3JzID0gW107XG4gIHRoaXMuX2F0dGVtcHRzID0gMTtcbiAgdGhpcy5fb3BlcmF0aW9uVGltZW91dCA9IG51bGw7XG4gIHRoaXMuX29wZXJhdGlvblRpbWVvdXRDYiA9IG51bGw7XG4gIHRoaXMuX3RpbWVvdXQgPSBudWxsO1xuICB0aGlzLl9vcGVyYXRpb25TdGFydCA9IG51bGw7XG5cbiAgaWYgKHRoaXMuX29wdGlvbnMuZm9yZXZlcikge1xuICAgIHRoaXMuX2NhY2hlZFRpbWVvdXRzID0gdGhpcy5fdGltZW91dHMuc2xpY2UoMCk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gUmV0cnlPcGVyYXRpb247XG5cblJldHJ5T3BlcmF0aW9uLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9hdHRlbXB0cyA9IDE7XG4gIHRoaXMuX3RpbWVvdXRzID0gdGhpcy5fb3JpZ2luYWxUaW1lb3V0cztcbn1cblxuUmV0cnlPcGVyYXRpb24ucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuX3RpbWVvdXQpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dCk7XG4gIH1cblxuICB0aGlzLl90aW1lb3V0cyAgICAgICA9IFtdO1xuICB0aGlzLl9jYWNoZWRUaW1lb3V0cyA9IG51bGw7XG59O1xuXG5SZXRyeU9wZXJhdGlvbi5wcm90b3R5cGUucmV0cnkgPSBmdW5jdGlvbihlcnIpIHtcbiAgaWYgKHRoaXMuX3RpbWVvdXQpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dCk7XG4gIH1cblxuICBpZiAoIWVycikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgY3VycmVudFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgaWYgKGVyciAmJiBjdXJyZW50VGltZSAtIHRoaXMuX29wZXJhdGlvblN0YXJ0ID49IHRoaXMuX21heFJldHJ5VGltZSkge1xuICAgIHRoaXMuX2Vycm9ycy51bnNoaWZ0KG5ldyBFcnJvcignUmV0cnlPcGVyYXRpb24gdGltZW91dCBvY2N1cnJlZCcpKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB0aGlzLl9lcnJvcnMucHVzaChlcnIpO1xuXG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dHMuc2hpZnQoKTtcbiAgaWYgKHRpbWVvdXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGlmICh0aGlzLl9jYWNoZWRUaW1lb3V0cykge1xuICAgICAgLy8gcmV0cnkgZm9yZXZlciwgb25seSBrZWVwIGxhc3QgZXJyb3JcbiAgICAgIHRoaXMuX2Vycm9ycy5zcGxpY2UodGhpcy5fZXJyb3JzLmxlbmd0aCAtIDEsIHRoaXMuX2Vycm9ycy5sZW5ndGgpO1xuICAgICAgdGhpcy5fdGltZW91dHMgPSB0aGlzLl9jYWNoZWRUaW1lb3V0cy5zbGljZSgwKTtcbiAgICAgIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0cy5zaGlmdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIHNlbGYuX2F0dGVtcHRzKys7XG5cbiAgICBpZiAoc2VsZi5fb3BlcmF0aW9uVGltZW91dENiKSB7XG4gICAgICBzZWxmLl90aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5fb3BlcmF0aW9uVGltZW91dENiKHNlbGYuX2F0dGVtcHRzKTtcbiAgICAgIH0sIHNlbGYuX29wZXJhdGlvblRpbWVvdXQpO1xuXG4gICAgICBpZiAoc2VsZi5fb3B0aW9ucy51bnJlZikge1xuICAgICAgICAgIHNlbGYuX3RpbWVvdXQudW5yZWYoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxmLl9mbihzZWxmLl9hdHRlbXB0cyk7XG4gIH0sIHRpbWVvdXQpO1xuXG4gIGlmICh0aGlzLl9vcHRpb25zLnVucmVmKSB7XG4gICAgICB0aW1lci51bnJlZigpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5SZXRyeU9wZXJhdGlvbi5wcm90b3R5cGUuYXR0ZW1wdCA9IGZ1bmN0aW9uKGZuLCB0aW1lb3V0T3BzKSB7XG4gIHRoaXMuX2ZuID0gZm47XG5cbiAgaWYgKHRpbWVvdXRPcHMpIHtcbiAgICBpZiAodGltZW91dE9wcy50aW1lb3V0KSB7XG4gICAgICB0aGlzLl9vcGVyYXRpb25UaW1lb3V0ID0gdGltZW91dE9wcy50aW1lb3V0O1xuICAgIH1cbiAgICBpZiAodGltZW91dE9wcy5jYikge1xuICAgICAgdGhpcy5fb3BlcmF0aW9uVGltZW91dENiID0gdGltZW91dE9wcy5jYjtcbiAgICB9XG4gIH1cblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmICh0aGlzLl9vcGVyYXRpb25UaW1lb3V0Q2IpIHtcbiAgICB0aGlzLl90aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuX29wZXJhdGlvblRpbWVvdXRDYigpO1xuICAgIH0sIHNlbGYuX29wZXJhdGlvblRpbWVvdXQpO1xuICB9XG5cbiAgdGhpcy5fb3BlcmF0aW9uU3RhcnQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICB0aGlzLl9mbih0aGlzLl9hdHRlbXB0cyk7XG59O1xuXG5SZXRyeU9wZXJhdGlvbi5wcm90b3R5cGUudHJ5ID0gZnVuY3Rpb24oZm4pIHtcbiAgY29uc29sZS5sb2coJ1VzaW5nIFJldHJ5T3BlcmF0aW9uLnRyeSgpIGlzIGRlcHJlY2F0ZWQnKTtcbiAgdGhpcy5hdHRlbXB0KGZuKTtcbn07XG5cblJldHJ5T3BlcmF0aW9uLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKGZuKSB7XG4gIGNvbnNvbGUubG9nKCdVc2luZyBSZXRyeU9wZXJhdGlvbi5zdGFydCgpIGlzIGRlcHJlY2F0ZWQnKTtcbiAgdGhpcy5hdHRlbXB0KGZuKTtcbn07XG5cblJldHJ5T3BlcmF0aW9uLnByb3RvdHlwZS5zdGFydCA9IFJldHJ5T3BlcmF0aW9uLnByb3RvdHlwZS50cnk7XG5cblJldHJ5T3BlcmF0aW9uLnByb3RvdHlwZS5lcnJvcnMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX2Vycm9ycztcbn07XG5cblJldHJ5T3BlcmF0aW9uLnByb3RvdHlwZS5hdHRlbXB0cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fYXR0ZW1wdHM7XG59O1xuXG5SZXRyeU9wZXJhdGlvbi5wcm90b3R5cGUubWFpbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLl9lcnJvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgY291bnRzID0ge307XG4gIHZhciBtYWluRXJyb3IgPSBudWxsO1xuICB2YXIgbWFpbkVycm9yQ291bnQgPSAwO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZXJyb3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGVycm9yID0gdGhpcy5fZXJyb3JzW2ldO1xuICAgIHZhciBtZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcbiAgICB2YXIgY291bnQgPSAoY291bnRzW21lc3NhZ2VdIHx8IDApICsgMTtcblxuICAgIGNvdW50c1ttZXNzYWdlXSA9IGNvdW50O1xuXG4gICAgaWYgKGNvdW50ID49IG1haW5FcnJvckNvdW50KSB7XG4gICAgICBtYWluRXJyb3IgPSBlcnJvcjtcbiAgICAgIG1haW5FcnJvckNvdW50ID0gY291bnQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1haW5FcnJvcjtcbn07XG4iLCAidmFyIFJldHJ5T3BlcmF0aW9uID0gcmVxdWlyZSgnLi9yZXRyeV9vcGVyYXRpb24nKTtcblxuZXhwb3J0cy5vcGVyYXRpb24gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciB0aW1lb3V0cyA9IGV4cG9ydHMudGltZW91dHMob3B0aW9ucyk7XG4gIHJldHVybiBuZXcgUmV0cnlPcGVyYXRpb24odGltZW91dHMsIHtcbiAgICAgIGZvcmV2ZXI6IG9wdGlvbnMgJiYgb3B0aW9ucy5mb3JldmVyLFxuICAgICAgdW5yZWY6IG9wdGlvbnMgJiYgb3B0aW9ucy51bnJlZixcbiAgICAgIG1heFJldHJ5VGltZTogb3B0aW9ucyAmJiBvcHRpb25zLm1heFJldHJ5VGltZVxuICB9KTtcbn07XG5cbmV4cG9ydHMudGltZW91dHMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICByZXR1cm4gW10uY29uY2F0KG9wdGlvbnMpO1xuICB9XG5cbiAgdmFyIG9wdHMgPSB7XG4gICAgcmV0cmllczogMTAsXG4gICAgZmFjdG9yOiAyLFxuICAgIG1pblRpbWVvdXQ6IDEgKiAxMDAwLFxuICAgIG1heFRpbWVvdXQ6IEluZmluaXR5LFxuICAgIHJhbmRvbWl6ZTogZmFsc2VcbiAgfTtcbiAgZm9yICh2YXIga2V5IGluIG9wdGlvbnMpIHtcbiAgICBvcHRzW2tleV0gPSBvcHRpb25zW2tleV07XG4gIH1cblxuICBpZiAob3B0cy5taW5UaW1lb3V0ID4gb3B0cy5tYXhUaW1lb3V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtaW5UaW1lb3V0IGlzIGdyZWF0ZXIgdGhhbiBtYXhUaW1lb3V0Jyk7XG4gIH1cblxuICB2YXIgdGltZW91dHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcHRzLnJldHJpZXM7IGkrKykge1xuICAgIHRpbWVvdXRzLnB1c2godGhpcy5jcmVhdGVUaW1lb3V0KGksIG9wdHMpKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZm9yZXZlciAmJiAhdGltZW91dHMubGVuZ3RoKSB7XG4gICAgdGltZW91dHMucHVzaCh0aGlzLmNyZWF0ZVRpbWVvdXQoaSwgb3B0cykpO1xuICB9XG5cbiAgLy8gc29ydCB0aGUgYXJyYXkgbnVtZXJpY2FsbHkgYXNjZW5kaW5nXG4gIHRpbWVvdXRzLnNvcnQoZnVuY3Rpb24oYSxiKSB7XG4gICAgcmV0dXJuIGEgLSBiO1xuICB9KTtcblxuICByZXR1cm4gdGltZW91dHM7XG59O1xuXG5leHBvcnRzLmNyZWF0ZVRpbWVvdXQgPSBmdW5jdGlvbihhdHRlbXB0LCBvcHRzKSB7XG4gIHZhciByYW5kb20gPSAob3B0cy5yYW5kb21pemUpXG4gICAgPyAoTWF0aC5yYW5kb20oKSArIDEpXG4gICAgOiAxO1xuXG4gIHZhciB0aW1lb3V0ID0gTWF0aC5yb3VuZChyYW5kb20gKiBvcHRzLm1pblRpbWVvdXQgKiBNYXRoLnBvdyhvcHRzLmZhY3RvciwgYXR0ZW1wdCkpO1xuICB0aW1lb3V0ID0gTWF0aC5taW4odGltZW91dCwgb3B0cy5tYXhUaW1lb3V0KTtcblxuICByZXR1cm4gdGltZW91dDtcbn07XG5cbmV4cG9ydHMud3JhcCA9IGZ1bmN0aW9uKG9iaiwgb3B0aW9ucywgbWV0aG9kcykge1xuICBpZiAob3B0aW9ucyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgbWV0aG9kcyA9IG9wdGlvbnM7XG4gICAgb3B0aW9ucyA9IG51bGw7XG4gIH1cblxuICBpZiAoIW1ldGhvZHMpIHtcbiAgICBtZXRob2RzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBtZXRob2RzLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1ldGhvZHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbWV0aG9kICAgPSBtZXRob2RzW2ldO1xuICAgIHZhciBvcmlnaW5hbCA9IG9ialttZXRob2RdO1xuXG4gICAgb2JqW21ldGhvZF0gPSBmdW5jdGlvbiByZXRyeVdyYXBwZXIob3JpZ2luYWwpIHtcbiAgICAgIHZhciBvcCAgICAgICA9IGV4cG9ydHMub3BlcmF0aW9uKG9wdGlvbnMpO1xuICAgICAgdmFyIGFyZ3MgICAgID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG5cbiAgICAgIGFyZ3MucHVzaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgaWYgKG9wLnJldHJ5KGVycikpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGFyZ3VtZW50c1swXSA9IG9wLm1haW5FcnJvcigpO1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9KTtcblxuICAgICAgb3AuYXR0ZW1wdChmdW5jdGlvbigpIHtcbiAgICAgICAgb3JpZ2luYWwuYXBwbHkob2JqLCBhcmdzKTtcbiAgICAgIH0pO1xuICAgIH0uYmluZChvYmosIG9yaWdpbmFsKTtcbiAgICBvYmpbbWV0aG9kXS5vcHRpb25zID0gb3B0aW9ucztcbiAgfVxufTtcbiIsICJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL3JldHJ5Jyk7IiwgIi8vIFRoaXMgaXMgbm90IHRoZSBzZXQgb2YgYWxsIHBvc3NpYmxlIHNpZ25hbHMuXG4vL1xuLy8gSXQgSVMsIGhvd2V2ZXIsIHRoZSBzZXQgb2YgYWxsIHNpZ25hbHMgdGhhdCB0cmlnZ2VyXG4vLyBhbiBleGl0IG9uIGVpdGhlciBMaW51eCBvciBCU0Qgc3lzdGVtcy4gIExpbnV4IGlzIGFcbi8vIHN1cGVyc2V0IG9mIHRoZSBzaWduYWwgbmFtZXMgc3VwcG9ydGVkIG9uIEJTRCwgYW5kXG4vLyB0aGUgdW5rbm93biBzaWduYWxzIGp1c3QgZmFpbCB0byByZWdpc3Rlciwgc28gd2UgY2FuXG4vLyBjYXRjaCB0aGF0IGVhc2lseSBlbm91Z2guXG4vL1xuLy8gRG9uJ3QgYm90aGVyIHdpdGggU0lHS0lMTC4gIEl0J3MgdW5jYXRjaGFibGUsIHdoaWNoXG4vLyBtZWFucyB0aGF0IHdlIGNhbid0IGZpcmUgYW55IGNhbGxiYWNrcyBhbnl3YXkuXG4vL1xuLy8gSWYgYSB1c2VyIGRvZXMgaGFwcGVuIHRvIHJlZ2lzdGVyIGEgaGFuZGxlciBvbiBhIG5vbi1cbi8vIGZhdGFsIHNpZ25hbCBsaWtlIFNJR1dJTkNIIG9yIHNvbWV0aGluZywgYW5kIHRoZW5cbi8vIGV4aXQsIGl0J2xsIGVuZCB1cCBmaXJpbmcgYHByb2Nlc3MuZW1pdCgnZXhpdCcpYCwgc29cbi8vIHRoZSBoYW5kbGVyIHdpbGwgYmUgZmlyZWQgYW55d2F5LlxuLy9cbi8vIFNJR0JVUywgU0lHRlBFLCBTSUdTRUdWIGFuZCBTSUdJTEwsIHdoZW4gbm90IHJhaXNlZFxuLy8gYXJ0aWZpY2lhbGx5LCBpbmhlcmVudGx5IGxlYXZlIHRoZSBwcm9jZXNzIGluIGFcbi8vIHN0YXRlIGZyb20gd2hpY2ggaXQgaXMgbm90IHNhZmUgdG8gdHJ5IGFuZCBlbnRlciBKU1xuLy8gbGlzdGVuZXJzLlxubW9kdWxlLmV4cG9ydHMgPSBbXG4gICdTSUdBQlJUJyxcbiAgJ1NJR0FMUk0nLFxuICAnU0lHSFVQJyxcbiAgJ1NJR0lOVCcsXG4gICdTSUdURVJNJ1xuXVxuXG5pZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ3dpbjMyJykge1xuICBtb2R1bGUuZXhwb3J0cy5wdXNoKFxuICAgICdTSUdWVEFMUk0nLFxuICAgICdTSUdYQ1BVJyxcbiAgICAnU0lHWEZTWicsXG4gICAgJ1NJR1VTUjInLFxuICAgICdTSUdUUkFQJyxcbiAgICAnU0lHU1lTJyxcbiAgICAnU0lHUVVJVCcsXG4gICAgJ1NJR0lPVCdcbiAgICAvLyBzaG91bGQgZGV0ZWN0IHByb2ZpbGVyIGFuZCBlbmFibGUvZGlzYWJsZSBhY2NvcmRpbmdseS5cbiAgICAvLyBzZWUgIzIxXG4gICAgLy8gJ1NJR1BST0YnXG4gIClcbn1cblxuaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdsaW51eCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMucHVzaChcbiAgICAnU0lHSU8nLFxuICAgICdTSUdQT0xMJyxcbiAgICAnU0lHUFdSJyxcbiAgICAnU0lHU1RLRkxUJyxcbiAgICAnU0lHVU5VU0VEJ1xuICApXG59XG4iLCAiLy8gTm90ZTogc2luY2UgbnljIHVzZXMgdGhpcyBtb2R1bGUgdG8gb3V0cHV0IGNvdmVyYWdlLCBhbnkgbGluZXNcbi8vIHRoYXQgYXJlIGluIHRoZSBkaXJlY3Qgc3luYyBmbG93IG9mIG55YydzIG91dHB1dENvdmVyYWdlIGFyZVxuLy8gaWdub3JlZCwgc2luY2Ugd2UgY2FuIG5ldmVyIGdldCBjb3ZlcmFnZSBmb3IgdGhlbS5cbi8vIGdyYWIgYSByZWZlcmVuY2UgdG8gbm9kZSdzIHJlYWwgcHJvY2VzcyBvYmplY3QgcmlnaHQgYXdheVxudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2Vzc1xuXG5jb25zdCBwcm9jZXNzT2sgPSBmdW5jdGlvbiAocHJvY2Vzcykge1xuICByZXR1cm4gcHJvY2VzcyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3MuZW1pdCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLnJlYWxseUV4aXQgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5saXN0ZW5lcnMgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5raWxsID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3MucGlkID09PSAnbnVtYmVyJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLm9uID09PSAnZnVuY3Rpb24nXG59XG5cbi8vIHNvbWUga2luZCBvZiBub24tbm9kZSBlbnZpcm9ubWVudCwganVzdCBuby1vcFxuLyogaXN0YW5idWwgaWdub3JlIGlmICovXG5pZiAoIXByb2Nlc3NPayhwcm9jZXNzKSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge31cbiAgfVxufSBlbHNlIHtcbiAgdmFyIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpXG4gIHZhciBzaWduYWxzID0gcmVxdWlyZSgnLi9zaWduYWxzLmpzJylcbiAgdmFyIGlzV2luID0gL153aW4vaS50ZXN0KHByb2Nlc3MucGxhdGZvcm0pXG5cbiAgdmFyIEVFID0gcmVxdWlyZSgnZXZlbnRzJylcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICh0eXBlb2YgRUUgIT09ICdmdW5jdGlvbicpIHtcbiAgICBFRSA9IEVFLkV2ZW50RW1pdHRlclxuICB9XG5cbiAgdmFyIGVtaXR0ZXJcbiAgaWYgKHByb2Nlc3MuX19zaWduYWxfZXhpdF9lbWl0dGVyX18pIHtcbiAgICBlbWl0dGVyID0gcHJvY2Vzcy5fX3NpZ25hbF9leGl0X2VtaXR0ZXJfX1xuICB9IGVsc2Uge1xuICAgIGVtaXR0ZXIgPSBwcm9jZXNzLl9fc2lnbmFsX2V4aXRfZW1pdHRlcl9fID0gbmV3IEVFKClcbiAgICBlbWl0dGVyLmNvdW50ID0gMFxuICAgIGVtaXR0ZXIuZW1pdHRlZCA9IHt9XG4gIH1cblxuICAvLyBCZWNhdXNlIHRoaXMgZW1pdHRlciBpcyBhIGdsb2JhbCwgd2UgaGF2ZSB0byBjaGVjayB0byBzZWUgaWYgYVxuICAvLyBwcmV2aW91cyB2ZXJzaW9uIG9mIHRoaXMgbGlicmFyeSBmYWlsZWQgdG8gZW5hYmxlIGluZmluaXRlIGxpc3RlbmVycy5cbiAgLy8gSSBrbm93IHdoYXQgeW91J3JlIGFib3V0IHRvIHNheS4gIEJ1dCBsaXRlcmFsbHkgZXZlcnl0aGluZyBhYm91dFxuICAvLyBzaWduYWwtZXhpdCBpcyBhIGNvbXByb21pc2Ugd2l0aCBldmlsLiAgR2V0IHVzZWQgdG8gaXQuXG4gIGlmICghZW1pdHRlci5pbmZpbml0ZSkge1xuICAgIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKEluZmluaXR5KVxuICAgIGVtaXR0ZXIuaW5maW5pdGUgPSB0cnVlXG4gIH1cblxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjYiwgb3B0cykge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHt9XG4gICAgfVxuICAgIGFzc2VydC5lcXVhbCh0eXBlb2YgY2IsICdmdW5jdGlvbicsICdhIGNhbGxiYWNrIG11c3QgYmUgcHJvdmlkZWQgZm9yIGV4aXQgaGFuZGxlcicpXG5cbiAgICBpZiAobG9hZGVkID09PSBmYWxzZSkge1xuICAgICAgbG9hZCgpXG4gICAgfVxuXG4gICAgdmFyIGV2ID0gJ2V4aXQnXG4gICAgaWYgKG9wdHMgJiYgb3B0cy5hbHdheXNMYXN0KSB7XG4gICAgICBldiA9ICdhZnRlcmV4aXQnXG4gICAgfVxuXG4gICAgdmFyIHJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoZXYsIGNiKVxuICAgICAgaWYgKGVtaXR0ZXIubGlzdGVuZXJzKCdleGl0JykubGVuZ3RoID09PSAwICYmXG4gICAgICAgICAgZW1pdHRlci5saXN0ZW5lcnMoJ2FmdGVyZXhpdCcpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB1bmxvYWQoKVxuICAgICAgfVxuICAgIH1cbiAgICBlbWl0dGVyLm9uKGV2LCBjYilcblxuICAgIHJldHVybiByZW1vdmVcbiAgfVxuXG4gIHZhciB1bmxvYWQgPSBmdW5jdGlvbiB1bmxvYWQgKCkge1xuICAgIGlmICghbG9hZGVkIHx8ICFwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbG9hZGVkID0gZmFsc2VcblxuICAgIHNpZ25hbHMuZm9yRWFjaChmdW5jdGlvbiAoc2lnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBwcm9jZXNzLnJlbW92ZUxpc3RlbmVyKHNpZywgc2lnTGlzdGVuZXJzW3NpZ10pXG4gICAgICB9IGNhdGNoIChlcikge31cbiAgICB9KVxuICAgIHByb2Nlc3MuZW1pdCA9IG9yaWdpbmFsUHJvY2Vzc0VtaXRcbiAgICBwcm9jZXNzLnJlYWxseUV4aXQgPSBvcmlnaW5hbFByb2Nlc3NSZWFsbHlFeGl0XG4gICAgZW1pdHRlci5jb3VudCAtPSAxXG4gIH1cbiAgbW9kdWxlLmV4cG9ydHMudW5sb2FkID0gdW5sb2FkXG5cbiAgdmFyIGVtaXQgPSBmdW5jdGlvbiBlbWl0IChldmVudCwgY29kZSwgc2lnbmFsKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKGVtaXR0ZXIuZW1pdHRlZFtldmVudF0pIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBlbWl0dGVyLmVtaXR0ZWRbZXZlbnRdID0gdHJ1ZVxuICAgIGVtaXR0ZXIuZW1pdChldmVudCwgY29kZSwgc2lnbmFsKVxuICB9XG5cbiAgLy8geyA8c2lnbmFsPjogPGxpc3RlbmVyIGZuPiwgLi4uIH1cbiAgdmFyIHNpZ0xpc3RlbmVycyA9IHt9XG4gIHNpZ25hbHMuZm9yRWFjaChmdW5jdGlvbiAoc2lnKSB7XG4gICAgc2lnTGlzdGVuZXJzW3NpZ10gPSBmdW5jdGlvbiBsaXN0ZW5lciAoKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmICghcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBvdGhlciBsaXN0ZW5lcnMsIGFuIGV4aXQgaXMgY29taW5nIVxuICAgICAgLy8gU2ltcGxlc3Qgd2F5OiByZW1vdmUgdXMgYW5kIHRoZW4gcmUtc2VuZCB0aGUgc2lnbmFsLlxuICAgICAgLy8gV2Uga25vdyB0aGF0IHRoaXMgd2lsbCBraWxsIHRoZSBwcm9jZXNzLCBzbyB3ZSBjYW5cbiAgICAgIC8vIHNhZmVseSBlbWl0IG5vdy5cbiAgICAgIHZhciBsaXN0ZW5lcnMgPSBwcm9jZXNzLmxpc3RlbmVycyhzaWcpXG4gICAgICBpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gZW1pdHRlci5jb3VudCkge1xuICAgICAgICB1bmxvYWQoKVxuICAgICAgICBlbWl0KCdleGl0JywgbnVsbCwgc2lnKVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBlbWl0KCdhZnRlcmV4aXQnLCBudWxsLCBzaWcpXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGlmIChpc1dpbiAmJiBzaWcgPT09ICdTSUdIVVAnKSB7XG4gICAgICAgICAgLy8gXCJTSUdIVVBcIiB0aHJvd3MgYW4gYEVOT1NZU2AgZXJyb3Igb24gV2luZG93cyxcbiAgICAgICAgICAvLyBzbyB1c2UgYSBzdXBwb3J0ZWQgc2lnbmFsIGluc3RlYWRcbiAgICAgICAgICBzaWcgPSAnU0lHSU5UJ1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHByb2Nlc3Mua2lsbChwcm9jZXNzLnBpZCwgc2lnKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICBtb2R1bGUuZXhwb3J0cy5zaWduYWxzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBzaWduYWxzXG4gIH1cblxuICB2YXIgbG9hZGVkID0gZmFsc2VcblxuICB2YXIgbG9hZCA9IGZ1bmN0aW9uIGxvYWQgKCkge1xuICAgIGlmIChsb2FkZWQgfHwgIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsb2FkZWQgPSB0cnVlXG5cbiAgICAvLyBUaGlzIGlzIHRoZSBudW1iZXIgb2Ygb25TaWduYWxFeGl0J3MgdGhhdCBhcmUgaW4gcGxheS5cbiAgICAvLyBJdCdzIGltcG9ydGFudCBzbyB0aGF0IHdlIGNhbiBjb3VudCB0aGUgY29ycmVjdCBudW1iZXIgb2ZcbiAgICAvLyBsaXN0ZW5lcnMgb24gc2lnbmFscywgYW5kIGRvbid0IHdhaXQgZm9yIHRoZSBvdGhlciBvbmUgdG9cbiAgICAvLyBoYW5kbGUgaXQgaW5zdGVhZCBvZiB1cy5cbiAgICBlbWl0dGVyLmNvdW50ICs9IDFcblxuICAgIHNpZ25hbHMgPSBzaWduYWxzLmZpbHRlcihmdW5jdGlvbiAoc2lnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBwcm9jZXNzLm9uKHNpZywgc2lnTGlzdGVuZXJzW3NpZ10pXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcHJvY2Vzcy5lbWl0ID0gcHJvY2Vzc0VtaXRcbiAgICBwcm9jZXNzLnJlYWxseUV4aXQgPSBwcm9jZXNzUmVhbGx5RXhpdFxuICB9XG4gIG1vZHVsZS5leHBvcnRzLmxvYWQgPSBsb2FkXG5cbiAgdmFyIG9yaWdpbmFsUHJvY2Vzc1JlYWxseUV4aXQgPSBwcm9jZXNzLnJlYWxseUV4aXRcbiAgdmFyIHByb2Nlc3NSZWFsbHlFeGl0ID0gZnVuY3Rpb24gcHJvY2Vzc1JlYWxseUV4aXQgKGNvZGUpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gY29kZSB8fCAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqLyAwXG4gICAgZW1pdCgnZXhpdCcsIHByb2Nlc3MuZXhpdENvZGUsIG51bGwpXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBlbWl0KCdhZnRlcmV4aXQnLCBwcm9jZXNzLmV4aXRDb2RlLCBudWxsKVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgb3JpZ2luYWxQcm9jZXNzUmVhbGx5RXhpdC5jYWxsKHByb2Nlc3MsIHByb2Nlc3MuZXhpdENvZGUpXG4gIH1cblxuICB2YXIgb3JpZ2luYWxQcm9jZXNzRW1pdCA9IHByb2Nlc3MuZW1pdFxuICB2YXIgcHJvY2Vzc0VtaXQgPSBmdW5jdGlvbiBwcm9jZXNzRW1pdCAoZXYsIGFyZykge1xuICAgIGlmIChldiA9PT0gJ2V4aXQnICYmIHByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICBpZiAoYXJnICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IGFyZ1xuICAgICAgfVxuICAgICAgdmFyIHJldCA9IG9yaWdpbmFsUHJvY2Vzc0VtaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIGVtaXQoJ2V4aXQnLCBwcm9jZXNzLmV4aXRDb2RlLCBudWxsKVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIGVtaXQoJ2FmdGVyZXhpdCcsIHByb2Nlc3MuZXhpdENvZGUsIG51bGwpXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgcmV0dXJuIHJldFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb3JpZ2luYWxQcm9jZXNzRW1pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgfVxuICB9XG59XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBjYWNoZVN5bWJvbCA9IFN5bWJvbCgpO1xuXG5mdW5jdGlvbiBwcm9iZShmaWxlLCBmcywgY2FsbGJhY2spIHtcbiAgICBjb25zdCBjYWNoZWRQcmVjaXNpb24gPSBmc1tjYWNoZVN5bWJvbF07XG5cbiAgICBpZiAoY2FjaGVkUHJlY2lzaW9uKSB7XG4gICAgICAgIHJldHVybiBmcy5zdGF0KGZpbGUsIChlcnIsIHN0YXQpID0+IHtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBzdGF0Lm10aW1lLCBjYWNoZWRQcmVjaXNpb24pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBTZXQgbXRpbWUgYnkgY2VpbGluZyBEYXRlLm5vdygpIHRvIHNlY29uZHMgKyA1bXMgc28gdGhhdCBpdCdzIFwibm90IG9uIHRoZSBzZWNvbmRcIlxuICAgIGNvbnN0IG10aW1lID0gbmV3IERhdGUoKE1hdGguY2VpbChEYXRlLm5vdygpIC8gMTAwMCkgKiAxMDAwKSArIDUpO1xuXG4gICAgZnMudXRpbWVzKGZpbGUsIG10aW1lLCBtdGltZSwgKGVycikgPT4ge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICBmcy5zdGF0KGZpbGUsIChlcnIsIHN0YXQpID0+IHtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwcmVjaXNpb24gPSBzdGF0Lm10aW1lLmdldFRpbWUoKSAlIDEwMDAgPT09IDAgPyAncycgOiAnbXMnO1xuXG4gICAgICAgICAgICAvLyBDYWNoZSB0aGUgcHJlY2lzaW9uIGluIGEgbm9uLWVudW1lcmFibGUgd2F5XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZnMsIGNhY2hlU3ltYm9sLCB7IHZhbHVlOiBwcmVjaXNpb24gfSk7XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHN0YXQubXRpbWUsIHByZWNpc2lvbik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRNdGltZShwcmVjaXNpb24pIHtcbiAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcblxuICAgIGlmIChwcmVjaXNpb24gPT09ICdzJykge1xuICAgICAgICBub3cgPSBNYXRoLmNlaWwobm93IC8gMTAwMCkgKiAxMDAwO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgRGF0ZShub3cpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5wcm9iZSA9IHByb2JlO1xubW9kdWxlLmV4cG9ydHMuZ2V0TXRpbWUgPSBnZXRNdGltZTtcbiIsICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2dyYWNlZnVsLWZzJyk7XG5jb25zdCByZXRyeSA9IHJlcXVpcmUoJ3JldHJ5Jyk7XG5jb25zdCBvbkV4aXQgPSByZXF1aXJlKCdzaWduYWwtZXhpdCcpO1xuY29uc3QgbXRpbWVQcmVjaXNpb24gPSByZXF1aXJlKCcuL210aW1lLXByZWNpc2lvbicpO1xuXG5jb25zdCBsb2NrcyA9IHt9O1xuXG5mdW5jdGlvbiBnZXRMb2NrRmlsZShmaWxlLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMubG9ja2ZpbGVQYXRoIHx8IGAke2ZpbGV9LmxvY2tgO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlQ2Fub25pY2FsUGF0aChmaWxlLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIGlmICghb3B0aW9ucy5yZWFscGF0aCkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgcGF0aC5yZXNvbHZlKGZpbGUpKTtcbiAgICB9XG5cbiAgICAvLyBVc2UgcmVhbHBhdGggdG8gcmVzb2x2ZSBzeW1saW5rc1xuICAgIC8vIEl0IGFsc28gcmVzb2x2ZXMgcmVsYXRpdmUgcGF0aHNcbiAgICBvcHRpb25zLmZzLnJlYWxwYXRoKGZpbGUsIGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gYWNxdWlyZUxvY2soZmlsZSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBjb25zdCBsb2NrZmlsZVBhdGggPSBnZXRMb2NrRmlsZShmaWxlLCBvcHRpb25zKTtcblxuICAgIC8vIFVzZSBta2RpciB0byBjcmVhdGUgdGhlIGxvY2tmaWxlIChhdG9taWMgb3BlcmF0aW9uKVxuICAgIG9wdGlvbnMuZnMubWtkaXIobG9ja2ZpbGVQYXRoLCAoZXJyKSA9PiB7XG4gICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgICAvLyBBdCB0aGlzIHBvaW50LCB3ZSBhY3F1aXJlZCB0aGUgbG9jayFcbiAgICAgICAgICAgIC8vIFByb2JlIHRoZSBtdGltZSBwcmVjaXNpb25cbiAgICAgICAgICAgIHJldHVybiBtdGltZVByZWNpc2lvbi5wcm9iZShsb2NrZmlsZVBhdGgsIG9wdGlvbnMuZnMsIChlcnIsIG10aW1lLCBtdGltZVByZWNpc2lvbikgPT4ge1xuICAgICAgICAgICAgICAgIC8vIElmIGl0IGZhaWxlZCwgdHJ5IHRvIHJlbW92ZSB0aGUgbG9jay4uXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmZzLnJtZGlyKGxvY2tmaWxlUGF0aCwgKCkgPT4ge30pO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIG10aW1lLCBtdGltZVByZWNpc2lvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIGVycm9yIGlzIG5vdCBFRVhJU1QgdGhlbiBzb21lIG90aGVyIGVycm9yIG9jY3VycmVkIHdoaWxlIGxvY2tpbmdcbiAgICAgICAgaWYgKGVyci5jb2RlICE9PSAnRUVYSVNUJykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPdGhlcndpc2UsIGNoZWNrIGlmIGxvY2sgaXMgc3RhbGUgYnkgYW5hbHl6aW5nIHRoZSBmaWxlIG10aW1lXG4gICAgICAgIGlmIChvcHRpb25zLnN0YWxlIDw9IDApIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhPYmplY3QuYXNzaWduKG5ldyBFcnJvcignTG9jayBmaWxlIGlzIGFscmVhZHkgYmVpbmcgaGVsZCcpLCB7IGNvZGU6ICdFTE9DS0VEJywgZmlsZSB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBvcHRpb25zLmZzLnN0YXQobG9ja2ZpbGVQYXRoLCAoZXJyLCBzdGF0KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgLy8gUmV0cnkgaWYgdGhlIGxvY2tmaWxlIGhhcyBiZWVuIHJlbW92ZWQgKG1lYW53aGlsZSlcbiAgICAgICAgICAgICAgICAvLyBTa2lwIHN0YWxlIGNoZWNrIHRvIGF2b2lkIHJlY3Vyc2l2ZW5lc3NcbiAgICAgICAgICAgICAgICBpZiAoZXJyLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhY3F1aXJlTG9jayhmaWxlLCB7IC4uLm9wdGlvbnMsIHN0YWxlOiAwIH0sIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFpc0xvY2tTdGFsZShzdGF0LCBvcHRpb25zKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhPYmplY3QuYXNzaWduKG5ldyBFcnJvcignTG9jayBmaWxlIGlzIGFscmVhZHkgYmVpbmcgaGVsZCcpLCB7IGNvZGU6ICdFTE9DS0VEJywgZmlsZSB9KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIGl0J3Mgc3RhbGUsIHJlbW92ZSBpdCBhbmQgdHJ5IGFnYWluIVxuICAgICAgICAgICAgLy8gU2tpcCBzdGFsZSBjaGVjayB0byBhdm9pZCByZWN1cnNpdmVuZXNzXG4gICAgICAgICAgICByZW1vdmVMb2NrKGZpbGUsIG9wdGlvbnMsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGFjcXVpcmVMb2NrKGZpbGUsIHsgLi4ub3B0aW9ucywgc3RhbGU6IDAgfSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBpc0xvY2tTdGFsZShzdGF0LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHN0YXQubXRpbWUuZ2V0VGltZSgpIDwgRGF0ZS5ub3coKSAtIG9wdGlvbnMuc3RhbGU7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUxvY2soZmlsZSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICAvLyBSZW1vdmUgbG9ja2ZpbGUsIGlnbm9yaW5nIEVOT0VOVCBlcnJvcnNcbiAgICBvcHRpb25zLmZzLnJtZGlyKGdldExvY2tGaWxlKGZpbGUsIG9wdGlvbnMpLCAoZXJyKSA9PiB7XG4gICAgICAgIGlmIChlcnIgJiYgZXJyLmNvZGUgIT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUxvY2soZmlsZSwgb3B0aW9ucykge1xuICAgIGNvbnN0IGxvY2sgPSBsb2Nrc1tmaWxlXTtcblxuICAgIC8vIEp1c3QgZm9yIHNhZmV0eSwgc2hvdWxkIG5ldmVyIGhhcHBlblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChsb2NrLnVwZGF0ZVRpbWVvdXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxvY2sudXBkYXRlRGVsYXkgPSBsb2NrLnVwZGF0ZURlbGF5IHx8IG9wdGlvbnMudXBkYXRlO1xuICAgIGxvY2sudXBkYXRlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBsb2NrLnVwZGF0ZVRpbWVvdXQgPSBudWxsO1xuXG4gICAgICAgIC8vIFN0YXQgdGhlIGZpbGUgdG8gY2hlY2sgaWYgbXRpbWUgaXMgc3RpbGwgb3Vyc1xuICAgICAgICAvLyBJZiBpdCBpcywgd2UgY2FuIHN0aWxsIHJlY292ZXIgZnJvbSBhIHN5c3RlbSBzbGVlcCBvciBhIGJ1c3kgZXZlbnQgbG9vcFxuICAgICAgICBvcHRpb25zLmZzLnN0YXQobG9jay5sb2NrZmlsZVBhdGgsIChlcnIsIHN0YXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzT3ZlclRocmVzaG9sZCA9IGxvY2subGFzdFVwZGF0ZSArIG9wdGlvbnMuc3RhbGUgPCBEYXRlLm5vdygpO1xuXG4gICAgICAgICAgICAvLyBJZiBpdCBmYWlsZWQgdG8gdXBkYXRlIHRoZSBsb2NrZmlsZSwga2VlcCB0cnlpbmcgdW5sZXNzXG4gICAgICAgICAgICAvLyB0aGUgbG9ja2ZpbGUgd2FzIGRlbGV0ZWQgb3Igd2UgYXJlIG92ZXIgdGhlIHRocmVzaG9sZFxuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIuY29kZSA9PT0gJ0VOT0VOVCcgfHwgaXNPdmVyVGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRMb2NrQXNDb21wcm9taXNlZChmaWxlLCBsb2NrLCBPYmplY3QuYXNzaWduKGVyciwgeyBjb2RlOiAnRUNPTVBST01JU0VEJyB9KSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbG9jay51cGRhdGVEZWxheSA9IDEwMDA7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdXBkYXRlTG9jayhmaWxlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgaXNNdGltZU91cnMgPSBsb2NrLm10aW1lLmdldFRpbWUoKSA9PT0gc3RhdC5tdGltZS5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgIGlmICghaXNNdGltZU91cnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0TG9ja0FzQ29tcHJvbWlzZWQoXG4gICAgICAgICAgICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgICAgICAgICAgIGxvY2ssXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3IoJ1VuYWJsZSB0byB1cGRhdGUgbG9jayB3aXRoaW4gdGhlIHN0YWxlIHRocmVzaG9sZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjb2RlOiAnRUNPTVBST01JU0VEJyB9XG4gICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBtdGltZSA9IG10aW1lUHJlY2lzaW9uLmdldE10aW1lKGxvY2subXRpbWVQcmVjaXNpb24pO1xuXG4gICAgICAgICAgICBvcHRpb25zLmZzLnV0aW1lcyhsb2NrLmxvY2tmaWxlUGF0aCwgbXRpbWUsIG10aW1lLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXNPdmVyVGhyZXNob2xkID0gbG9jay5sYXN0VXBkYXRlICsgb3B0aW9ucy5zdGFsZSA8IERhdGUubm93KCk7XG5cbiAgICAgICAgICAgICAgICAvLyBJZ25vcmUgaWYgdGhlIGxvY2sgd2FzIHJlbGVhc2VkXG4gICAgICAgICAgICAgICAgaWYgKGxvY2sucmVsZWFzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIElmIGl0IGZhaWxlZCB0byB1cGRhdGUgdGhlIGxvY2tmaWxlLCBrZWVwIHRyeWluZyB1bmxlc3NcbiAgICAgICAgICAgICAgICAvLyB0aGUgbG9ja2ZpbGUgd2FzIGRlbGV0ZWQgb3Igd2UgYXJlIG92ZXIgdGhlIHRocmVzaG9sZFxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5jb2RlID09PSAnRU5PRU5UJyB8fCBpc092ZXJUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRMb2NrQXNDb21wcm9taXNlZChmaWxlLCBsb2NrLCBPYmplY3QuYXNzaWduKGVyciwgeyBjb2RlOiAnRUNPTVBST01JU0VEJyB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsb2NrLnVwZGF0ZURlbGF5ID0gMTAwMDtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXBkYXRlTG9jayhmaWxlLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBBbGwgb2ssIGtlZXAgdXBkYXRpbmcuLlxuICAgICAgICAgICAgICAgIGxvY2subXRpbWUgPSBtdGltZTtcbiAgICAgICAgICAgICAgICBsb2NrLmxhc3RVcGRhdGUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIGxvY2sudXBkYXRlRGVsYXkgPSBudWxsO1xuICAgICAgICAgICAgICAgIHVwZGF0ZUxvY2soZmlsZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSwgbG9jay51cGRhdGVEZWxheSk7XG5cbiAgICAvLyBVbnJlZiB0aGUgdGltZXIgc28gdGhhdCB0aGUgbm9kZWpzIHByb2Nlc3MgY2FuIGV4aXQgZnJlZWx5XG4gICAgLy8gVGhpcyBpcyBzYWZlIGJlY2F1c2UgYWxsIGFjcXVpcmVkIGxvY2tzIHdpbGwgYmUgYXV0b21hdGljYWxseSByZWxlYXNlZFxuICAgIC8vIG9uIHByb2Nlc3MgZXhpdFxuXG4gICAgLy8gV2UgZmlyc3QgY2hlY2sgdGhhdCBgbG9jay51cGRhdGVUaW1lb3V0LnVucmVmYCBleGlzdHMgYmVjYXVzZSBzb21lIHVzZXJzXG4gICAgLy8gbWF5IGJlIHVzaW5nIHRoaXMgbW9kdWxlIG91dHNpZGUgb2YgTm9kZUpTIChlLmcuLCBpbiBhbiBlbGVjdHJvbiBhcHApLFxuICAgIC8vIGFuZCBpbiB0aG9zZSBjYXNlcyBgc2V0VGltZW91dGAgcmV0dXJuIGFuIGludGVnZXIuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAobG9jay51cGRhdGVUaW1lb3V0LnVucmVmKSB7XG4gICAgICAgIGxvY2sudXBkYXRlVGltZW91dC51bnJlZigpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2V0TG9ja0FzQ29tcHJvbWlzZWQoZmlsZSwgbG9jaywgZXJyKSB7XG4gICAgLy8gU2lnbmFsIHRoZSBsb2NrIGhhcyBiZWVuIHJlbGVhc2VkXG4gICAgbG9jay5yZWxlYXNlZCA9IHRydWU7XG5cbiAgICAvLyBDYW5jZWwgbG9jayBtdGltZSB1cGRhdGVcbiAgICAvLyBKdXN0IGZvciBzYWZldHksIGF0IHRoaXMgcG9pbnQgdXBkYXRlVGltZW91dCBzaG91bGQgYmUgbnVsbFxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChsb2NrLnVwZGF0ZVRpbWVvdXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGxvY2sudXBkYXRlVGltZW91dCk7XG4gICAgfVxuXG4gICAgaWYgKGxvY2tzW2ZpbGVdID09PSBsb2NrKSB7XG4gICAgICAgIGRlbGV0ZSBsb2Nrc1tmaWxlXTtcbiAgICB9XG5cbiAgICBsb2NrLm9wdGlvbnMub25Db21wcm9taXNlZChlcnIpO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIGxvY2soZmlsZSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIG9wdGlvbnMgPSB7XG4gICAgICAgIHN0YWxlOiAxMDAwMCxcbiAgICAgICAgdXBkYXRlOiBudWxsLFxuICAgICAgICByZWFscGF0aDogdHJ1ZSxcbiAgICAgICAgcmV0cmllczogMCxcbiAgICAgICAgZnMsXG4gICAgICAgIG9uQ29tcHJvbWlzZWQ6IChlcnIpID0+IHsgdGhyb3cgZXJyOyB9LFxuICAgICAgICAuLi5vcHRpb25zLFxuICAgIH07XG5cbiAgICBvcHRpb25zLnJldHJpZXMgPSBvcHRpb25zLnJldHJpZXMgfHwgMDtcbiAgICBvcHRpb25zLnJldHJpZXMgPSB0eXBlb2Ygb3B0aW9ucy5yZXRyaWVzID09PSAnbnVtYmVyJyA/IHsgcmV0cmllczogb3B0aW9ucy5yZXRyaWVzIH0gOiBvcHRpb25zLnJldHJpZXM7XG4gICAgb3B0aW9ucy5zdGFsZSA9IE1hdGgubWF4KG9wdGlvbnMuc3RhbGUgfHwgMCwgMjAwMCk7XG4gICAgb3B0aW9ucy51cGRhdGUgPSBvcHRpb25zLnVwZGF0ZSA9PSBudWxsID8gb3B0aW9ucy5zdGFsZSAvIDIgOiBvcHRpb25zLnVwZGF0ZSB8fCAwO1xuICAgIG9wdGlvbnMudXBkYXRlID0gTWF0aC5tYXgoTWF0aC5taW4ob3B0aW9ucy51cGRhdGUsIG9wdGlvbnMuc3RhbGUgLyAyKSwgMTAwMCk7XG5cbiAgICAvLyBSZXNvbHZlIHRvIGEgY2Fub25pY2FsIGZpbGUgcGF0aFxuICAgIHJlc29sdmVDYW5vbmljYWxQYXRoKGZpbGUsIG9wdGlvbnMsIChlcnIsIGZpbGUpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBdHRlbXB0IHRvIGFjcXVpcmUgdGhlIGxvY2tcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gcmV0cnkub3BlcmF0aW9uKG9wdGlvbnMucmV0cmllcyk7XG5cbiAgICAgICAgb3BlcmF0aW9uLmF0dGVtcHQoKCkgPT4ge1xuICAgICAgICAgICAgYWNxdWlyZUxvY2soZmlsZSwgb3B0aW9ucywgKGVyciwgbXRpbWUsIG10aW1lUHJlY2lzaW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG9wZXJhdGlvbi5yZXRyeShlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhvcGVyYXRpb24ubWFpbkVycm9yKCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFdlIG5vdyBvd24gdGhlIGxvY2tcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NrID0gbG9ja3NbZmlsZV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2tmaWxlUGF0aDogZ2V0TG9ja0ZpbGUoZmlsZSwgb3B0aW9ucyksXG4gICAgICAgICAgICAgICAgICAgIG10aW1lLFxuICAgICAgICAgICAgICAgICAgICBtdGltZVByZWNpc2lvbixcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVwZGF0ZTogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8gV2UgbXVzdCBrZWVwIHRoZSBsb2NrIGZyZXNoIHRvIGF2b2lkIHN0YWxlbmVzc1xuICAgICAgICAgICAgICAgIHVwZGF0ZUxvY2soZmlsZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCAocmVsZWFzZWRDYWxsYmFjaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9jay5yZWxlYXNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbGVhc2VkQ2FsbGJhY2sgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxlYXNlZENhbGxiYWNrKE9iamVjdC5hc3NpZ24obmV3IEVycm9yKCdMb2NrIGlzIGFscmVhZHkgcmVsZWFzZWQnKSwgeyBjb2RlOiAnRVJFTEVBU0VEJyB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBOb3QgbmVjZXNzYXJ5IHRvIHVzZSByZWFscGF0aCB0d2ljZSB3aGVuIHVubG9ja2luZ1xuICAgICAgICAgICAgICAgICAgICB1bmxvY2soZmlsZSwgeyAuLi5vcHRpb25zLCByZWFscGF0aDogZmFsc2UgfSwgcmVsZWFzZWRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHVubG9jayhmaWxlLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIG9wdGlvbnMgPSB7XG4gICAgICAgIGZzLFxuICAgICAgICByZWFscGF0aDogdHJ1ZSxcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICB9O1xuXG4gICAgLy8gUmVzb2x2ZSB0byBhIGNhbm9uaWNhbCBmaWxlIHBhdGhcbiAgICByZXNvbHZlQ2Fub25pY2FsUGF0aChmaWxlLCBvcHRpb25zLCAoZXJyLCBmaWxlKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2tpcCBpZiB0aGUgbG9jayBpcyBub3QgYWNxdWlyZWRcbiAgICAgICAgY29uc3QgbG9jayA9IGxvY2tzW2ZpbGVdO1xuXG4gICAgICAgIGlmICghbG9jaykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKE9iamVjdC5hc3NpZ24obmV3IEVycm9yKCdMb2NrIGlzIG5vdCBhY3F1aXJlZC9vd25lZCBieSB5b3UnKSwgeyBjb2RlOiAnRU5PVEFDUVVJUkVEJyB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2NrLnVwZGF0ZVRpbWVvdXQgJiYgY2xlYXJUaW1lb3V0KGxvY2sudXBkYXRlVGltZW91dCk7IC8vIENhbmNlbCBsb2NrIG10aW1lIHVwZGF0ZVxuICAgICAgICBsb2NrLnJlbGVhc2VkID0gdHJ1ZTsgLy8gU2lnbmFsIHRoZSBsb2NrIGhhcyBiZWVuIHJlbGVhc2VkXG4gICAgICAgIGRlbGV0ZSBsb2Nrc1tmaWxlXTsgLy8gRGVsZXRlIGZyb20gbG9ja3NcblxuICAgICAgICByZW1vdmVMb2NrKGZpbGUsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY2hlY2soZmlsZSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBvcHRpb25zID0ge1xuICAgICAgICBzdGFsZTogMTAwMDAsXG4gICAgICAgIHJlYWxwYXRoOiB0cnVlLFxuICAgICAgICBmcyxcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICB9O1xuXG4gICAgb3B0aW9ucy5zdGFsZSA9IE1hdGgubWF4KG9wdGlvbnMuc3RhbGUgfHwgMCwgMjAwMCk7XG5cbiAgICAvLyBSZXNvbHZlIHRvIGEgY2Fub25pY2FsIGZpbGUgcGF0aFxuICAgIHJlc29sdmVDYW5vbmljYWxQYXRoKGZpbGUsIG9wdGlvbnMsIChlcnIsIGZpbGUpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBpZiBsb2NrZmlsZSBleGlzdHNcbiAgICAgICAgb3B0aW9ucy5mcy5zdGF0KGdldExvY2tGaWxlKGZpbGUsIG9wdGlvbnMpLCAoZXJyLCBzdGF0KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgZG9lcyBub3QgZXhpc3QsIGZpbGUgaXMgbm90IGxvY2tlZC4gT3RoZXJ3aXNlLCBjYWxsYmFjayB3aXRoIGVycm9yXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVyci5jb2RlID09PSAnRU5PRU5UJyA/IGNhbGxiYWNrKG51bGwsIGZhbHNlKSA6IGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgY2hlY2sgaWYgbG9jayBpcyBzdGFsZSBieSBhbmFseXppbmcgdGhlIGZpbGUgbXRpbWVcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCAhaXNMb2NrU3RhbGUoc3RhdCwgb3B0aW9ucykpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TG9ja3MoKSB7XG4gICAgcmV0dXJuIGxvY2tzO1xufVxuXG4vLyBSZW1vdmUgYWNxdWlyZWQgbG9ja3Mgb24gZXhpdFxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbm9uRXhpdCgoKSA9PiB7XG4gICAgZm9yIChjb25zdCBmaWxlIGluIGxvY2tzKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBsb2Nrc1tmaWxlXS5vcHRpb25zO1xuXG4gICAgICAgIHRyeSB7IG9wdGlvbnMuZnMucm1kaXJTeW5jKGdldExvY2tGaWxlKGZpbGUsIG9wdGlvbnMpKTsgfSBjYXRjaCAoZSkgeyAvKiBFbXB0eSAqLyB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzLmxvY2sgPSBsb2NrO1xubW9kdWxlLmV4cG9ydHMudW5sb2NrID0gdW5sb2NrO1xubW9kdWxlLmV4cG9ydHMuY2hlY2sgPSBjaGVjaztcbm1vZHVsZS5leHBvcnRzLmdldExvY2tzID0gZ2V0TG9ja3M7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2dyYWNlZnVsLWZzJyk7XG5cbmZ1bmN0aW9uIGNyZWF0ZVN5bmNGcyhmcykge1xuICAgIGNvbnN0IG1ldGhvZHMgPSBbJ21rZGlyJywgJ3JlYWxwYXRoJywgJ3N0YXQnLCAncm1kaXInLCAndXRpbWVzJ107XG4gICAgY29uc3QgbmV3RnMgPSB7IC4uLmZzIH07XG5cbiAgICBtZXRob2RzLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICAgICAgICBuZXdGc1ttZXRob2RdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIGxldCByZXQ7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0ID0gZnNbYCR7bWV0aG9kfVN5bmNgXSguLi5hcmdzKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXQpO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ld0ZzO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIHRvUHJvbWlzZShtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgYXJncy5wdXNoKChlcnIsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1ldGhvZCguLi5hcmdzKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gdG9TeW5jKG1ldGhvZCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICBsZXQgZXJyO1xuICAgICAgICBsZXQgcmVzdWx0O1xuXG4gICAgICAgIGFyZ3MucHVzaCgoX2VyciwgX3Jlc3VsdCkgPT4ge1xuICAgICAgICAgICAgZXJyID0gX2VycjtcbiAgICAgICAgICAgIHJlc3VsdCA9IF9yZXN1bHQ7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1ldGhvZCguLi5hcmdzKTtcblxuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIHRvU3luY09wdGlvbnMob3B0aW9ucykge1xuICAgIC8vIFNoYWxsb3cgY2xvbmUgb3B0aW9ucyBiZWNhdXNlIHdlIGFyZSBvZ2luZyB0byBtdXRhdGUgdGhlbVxuICAgIG9wdGlvbnMgPSB7IC4uLm9wdGlvbnMgfTtcblxuICAgIC8vIFRyYW5zZm9ybSBmcyB0byB1c2UgdGhlIHN5bmMgbWV0aG9kcyBpbnN0ZWFkXG4gICAgb3B0aW9ucy5mcyA9IGNyZWF0ZVN5bmNGcyhvcHRpb25zLmZzIHx8IGZzKTtcblxuICAgIC8vIFJldHJpZXMgYXJlIG5vdCBhbGxvd2VkIGJlY2F1c2UgaXQgcmVxdWlyZXMgdGhlIGZsb3cgdG8gYmUgc3luY1xuICAgIGlmIChcbiAgICAgICAgKHR5cGVvZiBvcHRpb25zLnJldHJpZXMgPT09ICdudW1iZXInICYmIG9wdGlvbnMucmV0cmllcyA+IDApIHx8XG4gICAgICAgIChvcHRpb25zLnJldHJpZXMgJiYgdHlwZW9mIG9wdGlvbnMucmV0cmllcy5yZXRyaWVzID09PSAnbnVtYmVyJyAmJiBvcHRpb25zLnJldHJpZXMucmV0cmllcyA+IDApXG4gICAgKSB7XG4gICAgICAgIHRocm93IE9iamVjdC5hc3NpZ24obmV3IEVycm9yKCdDYW5ub3QgdXNlIHJldHJpZXMgd2l0aCB0aGUgc3luYyBhcGknKSwgeyBjb2RlOiAnRVNZTkMnIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBvcHRpb25zO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0b1Byb21pc2UsXG4gICAgdG9TeW5jLFxuICAgIHRvU3luY09wdGlvbnMsXG59O1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgbG9ja2ZpbGUgPSByZXF1aXJlKCcuL2xpYi9sb2NrZmlsZScpO1xuY29uc3QgeyB0b1Byb21pc2UsIHRvU3luYywgdG9TeW5jT3B0aW9ucyB9ID0gcmVxdWlyZSgnLi9saWIvYWRhcHRlcicpO1xuXG5hc3luYyBmdW5jdGlvbiBsb2NrKGZpbGUsIG9wdGlvbnMpIHtcbiAgICBjb25zdCByZWxlYXNlID0gYXdhaXQgdG9Qcm9taXNlKGxvY2tmaWxlLmxvY2spKGZpbGUsIG9wdGlvbnMpO1xuXG4gICAgcmV0dXJuIHRvUHJvbWlzZShyZWxlYXNlKTtcbn1cblxuZnVuY3Rpb24gbG9ja1N5bmMoZmlsZSwgb3B0aW9ucykge1xuICAgIGNvbnN0IHJlbGVhc2UgPSB0b1N5bmMobG9ja2ZpbGUubG9jaykoZmlsZSwgdG9TeW5jT3B0aW9ucyhvcHRpb25zKSk7XG5cbiAgICByZXR1cm4gdG9TeW5jKHJlbGVhc2UpO1xufVxuXG5mdW5jdGlvbiB1bmxvY2soZmlsZSwgb3B0aW9ucykge1xuICAgIHJldHVybiB0b1Byb21pc2UobG9ja2ZpbGUudW5sb2NrKShmaWxlLCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gdW5sb2NrU3luYyhmaWxlLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRvU3luYyhsb2NrZmlsZS51bmxvY2spKGZpbGUsIHRvU3luY09wdGlvbnMob3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBjaGVjayhmaWxlLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRvUHJvbWlzZShsb2NrZmlsZS5jaGVjaykoZmlsZSwgb3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrU3luYyhmaWxlLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRvU3luYyhsb2NrZmlsZS5jaGVjaykoZmlsZSwgdG9TeW5jT3B0aW9ucyhvcHRpb25zKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbG9jaztcbm1vZHVsZS5leHBvcnRzLmxvY2sgPSBsb2NrO1xubW9kdWxlLmV4cG9ydHMudW5sb2NrID0gdW5sb2NrO1xubW9kdWxlLmV4cG9ydHMubG9ja1N5bmMgPSBsb2NrU3luYztcbm1vZHVsZS5leHBvcnRzLnVubG9ja1N5bmMgPSB1bmxvY2tTeW5jO1xubW9kdWxlLmV4cG9ydHMuY2hlY2sgPSBjaGVjaztcbm1vZHVsZS5leHBvcnRzLmNoZWNrU3luYyA9IGNoZWNrU3luYztcbiIsICJpbXBvcnQgeyBleHBlY3QgfSBmcm9tIFwiQHBsYXl3cmlnaHQvdGVzdFwiO1xuaW1wb3J0IFwiZG90ZW52L2NvbmZpZ1wiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCB7IFBhZ2UgfSBmcm9tIFwicGxheXdyaWdodFwiO1xuaW1wb3J0IHsgVGFza0R5bmFtbyB9IGZyb20gXCIuLi9wYWNrYWdlcy9mdW5jdGlvbnMvc3JjL3R5cGVzL3Rhc2tcIjtcbmltcG9ydCB7IGdldENyZWRzQW5kTG9ja0ZpbGUsIHJlbGVhc2VDcmVkcyB9IGZyb20gXCIuL2NyZWRNYW5hZ2VyXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoZWxsb1dvcmxkKHBhZ2U6IFBhZ2UsIGNvbnRleHQsIGV2ZW50cykge1xuXHQvLyBDcmVhdGUgZXZlbnQgbGlzdGVuZXJzIGZvciBjdXN0b20gbWV0cmljc1xuXHRwYWdlLm9uKFwicmVzcG9uc2VcIiwgKHJlc3BvbnNlKSA9PiB7XG5cdFx0aWYgKHJlc3BvbnNlLnVybCgpLmluY2x1ZGVzKFwiYXBpLmVkdWNhdHIudWtcIikpIHtcblx0XHRcdGNvbnN0IHRpbWUgPSBEYXRlLm5vdygpIC0gcmVzcG9uc2UucmVxdWVzdCgpLnRpbWluZygpLnN0YXJ0VGltZTtcblx0XHRcdGV2ZW50cy5lbWl0KFwiaGlzdG9ncmFtXCIsIGBhcGlfcmVzcG9uc2VfdGltZWAsIHRpbWUpO1xuXHRcdFx0ZXZlbnRzLmVtaXQoXCJoaXN0b2dyYW1cIiwgYGFwaV9yZXNwb25zZV90aW1lXyR7cmVzcG9uc2UudXJsKCl9YCwgdGltZSk7XG5cdFx0XHRjb25zb2xlLmxvZyhgUmVxdWVzdCB0byAke3Jlc3BvbnNlLnVybCgpfSB0b29rICR7dGltZX1tc2ApO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gUmVzZXQgYnJvd3NlciBpbnN0YW5jZSAobm90IHN1cmUgaWYgdGhpcyBpcyBldmVuIHJlcXVpcmVkKVxuXHRhd2FpdCBwYWdlLmdvdG8oXCJodHRwczovL2VkdWNhdHIudWsvXCIpO1xuXHRhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+IHtcblx0XHRsb2NhbFN0b3JhZ2UuY2xlYXIoKTtcblx0XHRzZXNzaW9uU3RvcmFnZS5jbGVhcigpO1xuXHR9KTtcblxuXHQvLyBMb2cgaW4gYW5kIG5hdmlnYXRlIHRvIGNvbXBldGl0aW9uXG5cdGxldCB1c2VybmFtZSA9IGF3YWl0IGdldENyZWRzQW5kTG9ja0ZpbGUoKTtcblx0aWYgKCF1c2VybmFtZSkgcmV0dXJuO1xuXG5cdGF3YWl0IHBhZ2UuZ290byhcImh0dHBzOi8vZWR1Y2F0ci51ay9cIik7XG5cblx0YXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcihcIiNcXFxcOnIwXFxcXDpcIikpLnRvQmVFZGl0YWJsZSh7IHRpbWVvdXQ6IDIwMDAwMCB9KTtcblx0YXdhaXQgZXhwZWN0KHBhZ2UubG9jYXRvcihcIiNcXFxcOnIxXFxcXDpcIikpLnRvQmVFZGl0YWJsZSh7IHRpbWVvdXQ6IDIwMDAwMCB9KTtcblxuXHRhd2FpdCBwYWdlLmZpbGwoXCIjXFxcXDpyMFxcXFw6XCIsIHVzZXJuYW1lKTtcblx0YXdhaXQgcGFnZS5maWxsKFwiI1xcXFw6cjFcXFxcOlwiLCBwcm9jZXNzLmVudi5QRVJGX1RFU1RfUEFTU1dPUkQpO1xuXG5cdGF3YWl0IHBhZ2UuY2xpY2soJ2J1dHRvbjpoYXMtdGV4dChcIlNpZ24gaW5cIiknKTtcblxuXHRhd2FpdCBwYWdlLndhaXRGb3JUaW1lb3V0KDIwMDApO1xuXG5cdGF3YWl0IHBhZ2Uud2FpdEZvclVSTChcImh0dHBzOi8vZWR1Y2F0ci51ay9wbGF5XCIsIHsgdGltZW91dDogMjAwMDAwIH0pO1xuXG5cdGF3YWl0IHBhZ2UuZ290byhcImh0dHBzOi8vZWR1Y2F0ci51ay9wbGF5L2VqbjlwNmJ3eDVhamw3b2VsZGF0ZHpvYVwiKTtcblxuXHRhd2FpdCBwYWdlLndhaXRGb3JUaW1lb3V0KDIwMDApO1xuXG5cdGF3YWl0IGV4cGVjdChwYWdlLmdldEJ5VGV4dChcIkxvZ2ljIEdhdGVzXCIpKS50b0JlVmlzaWJsZSh7IHRpbWVvdXQ6IDIwMDAwMCB9KTtcblxuXHQvLyBRdWVzdGlvbiBsb2dpblxuXHRjb25zdCBzYW1wbGVRdWVzdGlvbnM6IFRhc2tEeW5hbW9bXSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKFwidGVzdC9zYW1wbGUuanNvblwiLCBcInV0ZjhcIikpO1xuXG5cdGNvbnN0IHJhbmRvbWlzZWRTYW1wbGVRdWVzdGlvbnMgPSBzYW1wbGVRdWVzdGlvbnMuc29ydCgoKSA9PiBNYXRoLnJhbmRvbSgpIC0gMC41KTtcblx0Zm9yIChjb25zdCBpIGluIHJhbmRvbWlzZWRTYW1wbGVRdWVzdGlvbnMpIHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcXVlc3Rpb24gPSByYW5kb21pc2VkU2FtcGxlUXVlc3Rpb25zW2ldO1xuXG5cdFx0XHRpZiAoIVtcIlRFWFRcIl0uaW5jbHVkZXMocXVlc3Rpb24uYW5zd2VyVHlwZS5TKSkgY29udGludWU7IC8vIG9ubHkgYWxsb3cgdGV4dCBhbnN3ZXJzXG5cdFx0XHRpZiAoIVtcIkNPTVBBUkVcIl0uaW5jbHVkZXMocXVlc3Rpb24udmVyaWZpY2F0aW9uVHlwZS5TKSkgY29udGludWU7IC8vIG9ubHkgYWxsb3cgYXV0b21hdGljIGNvbXBhcmUgdmVyaWZpY2F0aW9uXG5cblx0XHRcdGNvbnN0IGJ1dHRvbmNhdCA9IGF3YWl0IHBhZ2UubG9jYXRvcihgIyR7KHF1ZXN0aW9uIGFzIGFueSkuUEsuU31gKTtcblx0XHRcdGJ1dHRvbmNhdC5jbGljaygpO1xuXHRcdFx0YXdhaXQgcGFnZS53YWl0Rm9yVGltZW91dCgyMDAwKTtcblxuXHRcdFx0Y29uc3QgYnV0dG9uID0gYXdhaXQgcGFnZS5sb2NhdG9yKGAjJHtxdWVzdGlvbi5TSy5TLnNwbGl0KFwiI1wiKVsxXX1gKTtcblx0XHRcdGlmICghKGF3YWl0IGJ1dHRvbi5ldmFsdWF0ZSgoZWxlbWVudCkgPT4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJNdWktZGlzYWJsZWRcIikpKSkge1xuXHRcdFx0XHRhd2FpdCBidXR0b24uY2xpY2soKTtcblx0XHRcdFx0YXdhaXQgcGFnZS53YWl0Rm9yVGltZW91dCgyMDAwKTtcblxuXHRcdFx0XHRpZiAocXVlc3Rpb24uYW5zd2VyVHlwZS5TICE9IFwiUFlUSE9OXCIpIHtcblx0XHRcdFx0XHQvLyBnZXQgaXQgd3Jvbmcgb25jZVxuXHRcdFx0XHRcdGF3YWl0IHBhZ2UubG9jYXRvcihcImlucHV0OnZpc2libGVcIikuZmlsbChxdWVzdGlvbi5hbnN3ZXIuUyArIFwiZmRzZmFzZmFkc2Zkc2FcIik7XG5cdFx0XHRcdFx0YXdhaXQgcGFnZS53YWl0Rm9yVGltZW91dCgxMDAwKTtcblx0XHRcdFx0XHRhd2FpdCBwYWdlLmxvY2F0b3IoJ2J1dHRvbjp0ZXh0KFwiU3VibWl0XCIpOnZpc2libGUnKS5jbGljaygpO1xuXHRcdFx0XHRcdGF3YWl0IHBhZ2Uud2FpdEZvclJlc3BvbnNlKChyZXNwb25zZSkgPT4gcmVzcG9uc2UudXJsKCkuaW5jbHVkZXMoXCIvY2hlY2tcIiksIHsgdGltZW91dDogMjAwMDAgfSk7XG5cdFx0XHRcdFx0YXdhaXQgcGFnZS53YWl0Rm9yVGltZW91dCgyMDAwKTtcblxuXHRcdFx0XHRcdC8vIGdldCBpdCB3cm9uZyB0d2ljZVxuXHRcdFx0XHRcdGF3YWl0IHBhZ2UubG9jYXRvcihcImlucHV0OnZpc2libGVcIikuZmlsbChxdWVzdGlvbi5hbnN3ZXIuUyArIFwicnJlcmVyZXJ3cmV3XCIpO1xuXHRcdFx0XHRcdGF3YWl0IHBhZ2Uud2FpdEZvclRpbWVvdXQoMTAwMCk7XG5cdFx0XHRcdFx0YXdhaXQgcGFnZS5sb2NhdG9yKCdidXR0b246dGV4dChcIlN1Ym1pdFwiKTp2aXNpYmxlJykuY2xpY2soKTtcblx0XHRcdFx0XHRhd2FpdCBwYWdlLndhaXRGb3JSZXNwb25zZSgocmVzcG9uc2UpID0+IHJlc3BvbnNlLnVybCgpLmluY2x1ZGVzKFwiL2NoZWNrXCIpLCB7IHRpbWVvdXQ6IDIwMDAwIH0pO1xuXHRcdFx0XHRcdGF3YWl0IHBhZ2Uud2FpdEZvclRpbWVvdXQoMjAwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YXdhaXQgcGFnZS5ldmFsdWF0ZShcblx0XHRcdFx0XHRcdChbYW5zd2VyXSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRsZXQgZWRpdG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jbS1jb250ZW50XCIpO1xuXHRcdFx0XHRcdFx0XHRlZGl0b3IudGV4dENvbnRlbnQgPSBgcHJpbnQoJHthbnN3ZXJ9ZWVlZWVlKTtgO1xuXHRcdFx0XHRcdFx0XHRlZGl0b3IuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFtxdWVzdGlvbi5hbnN3ZXIuU11cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGF3YWl0IHBhZ2Uud2FpdEZvclRpbWVvdXQoMTAwMCk7XG5cdFx0XHRcdFx0YXdhaXQgcGFnZS5sb2NhdG9yKCdidXR0b246dGV4dChcIlN1Ym1pdFwiKTp2aXNpYmxlJykuY2xpY2soKTtcblx0XHRcdFx0XHRhd2FpdCBwYWdlLndhaXRGb3JSZXNwb25zZSgocmVzcG9uc2UpID0+IHJlc3BvbnNlLnVybCgpLmluY2x1ZGVzKFwiL2NoZWNrXCIpLCB7IHRpbWVvdXQ6IDIwMDAwIH0pO1xuXHRcdFx0XHRcdGF3YWl0IHBhZ2Uud2FpdEZvclRpbWVvdXQoMjAwMCk7XG5cblx0XHRcdFx0XHRhd2FpdCBwYWdlLmV2YWx1YXRlKFxuXHRcdFx0XHRcdFx0KFthbnN3ZXJdKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGxldCBlZGl0b3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNtLWNvbnRlbnRcIik7XG5cdFx0XHRcdFx0XHRcdGVkaXRvci50ZXh0Q29udGVudCA9IGBwcmludCgke2Fuc3dlcn1zc3Nzc3MpO2A7XG5cdFx0XHRcdFx0XHRcdGVkaXRvci5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0W3F1ZXN0aW9uLmFuc3dlci5TXVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YXdhaXQgcGFnZS53YWl0Rm9yVGltZW91dCgxMDAwKTtcblx0XHRcdFx0XHRhd2FpdCBwYWdlLmxvY2F0b3IoJ2J1dHRvbjp0ZXh0KFwiU3VibWl0XCIpOnZpc2libGUnKS5jbGljaygpO1xuXHRcdFx0XHRcdGF3YWl0IHBhZ2Uud2FpdEZvclJlc3BvbnNlKChyZXNwb25zZSkgPT4gcmVzcG9uc2UudXJsKCkuaW5jbHVkZXMoXCIvY2hlY2tcIiksIHsgdGltZW91dDogMjAwMDAgfSk7XG5cdFx0XHRcdFx0YXdhaXQgcGFnZS53YWl0Rm9yVGltZW91dCgyMDAwKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGdldCBpdCByaWdodCAoODAlIG9mIHRoZSB0aW1lKVxuXHRcdFx0XHRpZiAoTWF0aC5yYW5kb20oKSA8IDAuOCkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHF1ZXN0aW9uLmFuc3dlclR5cGUuUyA9PSBcIlBZVEhPTlwiKTtcblx0XHRcdFx0XHRpZiAocXVlc3Rpb24uYW5zd2VyVHlwZS5TID09IFwiUFlUSE9OXCIpIHtcblx0XHRcdFx0XHRcdHBhZ2UuZXZhbHVhdGUoXG5cdFx0XHRcdFx0XHRcdChbYW5zd2VyXSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGxldCBlZGl0b3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNtLWNvbnRlbnRcIik7XG5cdFx0XHRcdFx0XHRcdFx0ZWRpdG9yLnRleHRDb250ZW50ID0gYHByaW50KCcke2Fuc3dlcn0nKTtgO1xuXHRcdFx0XHRcdFx0XHRcdGVkaXRvci5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFtxdWVzdGlvbi5hbnN3ZXIuU11cblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGF3YWl0IHBhZ2UubG9jYXRvcihcImlucHV0OnZpc2libGVcIikuZmlsbChxdWVzdGlvbi5hbnN3ZXIuUyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGF3YWl0IHBhZ2Uud2FpdEZvclRpbWVvdXQoMTAwMCk7XG5cdFx0XHRcdFx0YXdhaXQgcGFnZS5sb2NhdG9yKCdidXR0b246dGV4dChcIlN1Ym1pdFwiKTp2aXNpYmxlJykuY2xpY2soKTtcblx0XHRcdFx0XHRhd2FpdCBwYWdlLndhaXRGb3JSZXNwb25zZSgocmVzcG9uc2UpID0+IHJlc3BvbnNlLnVybCgpLmluY2x1ZGVzKFwiL2NoZWNrXCIpLCB7IHRpbWVvdXQ6IDIwMDAwIH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGF3YWl0IHBhZ2Uua2V5Ym9hcmQucHJlc3MoXCJFc2NhcGVcIik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhd2FpdCBwYWdlLndhaXRGb3JUaW1lb3V0KDMwMDApO1xuXHRcdFx0fSBlbHNlIGNvbnNvbGUubG9nKFwiVGFzayBhbHJlYWR5IGNvbXBsZXRlXCIpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGF3YWl0IHBhZ2Uua2V5Ym9hcmQucHJlc3MoXCJFc2NhcGVcIik7XG5cdFx0fVxuXHR9XG5cblx0YXdhaXQgcmVsZWFzZUNyZWRzKHVzZXJuYW1lKTtcbn1cbiIsICIoZnVuY3Rpb24gKCkge1xuICByZXF1aXJlKCcuL2xpYi9tYWluJykuY29uZmlnKFxuICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICB7fSxcbiAgICAgIHJlcXVpcmUoJy4vbGliL2Vudi1vcHRpb25zJyksXG4gICAgICByZXF1aXJlKCcuL2xpYi9jbGktb3B0aW9ucycpKHByb2Nlc3MuYXJndilcbiAgICApXG4gIClcbn0pKClcbiIsICJpbXBvcnQgY3N2IGZyb20gXCJjc3YtcGFyc2VyXCI7XG5pbXBvcnQgeyBjcmVhdGVSZWFkU3RyZWFtLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCB7IGxvY2sgfSBmcm9tIFwicHJvcGVyLWxvY2tmaWxlXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2NrQW5kVXBkYXRlQ3JlZHMoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG5cdC8vIExvY2sgdGhlIGZpbGUgdG8gcHJldmVudCBjb25jdXJyZW50IGFjY2Vzc1xuXHRjb25zdCByZWxlYXNlID0gYXdhaXQgbG9jayhcInRlc3QvY3JlZHMuY3N2XCIsIHsgcmV0cmllczogNSwgcmV0cnlXYWl0OiAxMDAwIH0pO1xuXG5cdHRyeSB7XG5cdFx0Ly8gR2V0IGNyZWRlbnRpYWxzIGZyb20gdGhlIENTViBmaWxlXG5cdFx0Y29uc3QgY3JlZHMgPSBhd2FpdCBuZXcgUHJvbWlzZTx7IHVzZXJuYW1lOiBzdHJpbmc7IGludXNlOiBzdHJpbmcgfVtdPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRjb25zdCBjcmVkczogeyB1c2VybmFtZTogc3RyaW5nOyBpbnVzZTogc3RyaW5nIH1bXSA9IFtdO1xuXG5cdFx0XHRjcmVhdGVSZWFkU3RyZWFtKFwidGVzdC9jcmVkcy5jc3ZcIilcblx0XHRcdFx0LnBpcGUoY3N2KCkpXG5cdFx0XHRcdC5vbihcImRhdGFcIiwgKHJvdykgPT4gY3JlZHMucHVzaChyb3cpKVxuXHRcdFx0XHQub24oXCJlbmRcIiwgKCkgPT4gcmVzb2x2ZShjcmVkcykpIC8vIFJlc29sdmluZyBhZnRlciB0aGUgJ2VuZCcgZXZlbnRcblx0XHRcdFx0Lm9uKFwiZXJyb3JcIiwgKGVycikgPT4gcmVqZWN0KGVycikpOyAvLyBSZWplY3QgaWYgdGhlcmUncyBhbiBlcnJvciBpbiByZWFkaW5nIHRoZSBmaWxlXG5cdFx0fSk7XG5cblx0XHQvLyBGaW5kIHRoZSBmaXJzdCBhdmFpbGFibGUgY3JlZGVudGlhbHNcblx0XHRjb25zdCBhdmFpbGFibGVDcmVkcyA9IGNyZWRzLmZpbmQoKGNyZWQpID0+IGNyZWQuaW51c2UgPT09IFwibm9cIik7XG5cblx0XHRpZiAoYXZhaWxhYmxlQ3JlZHMpIHtcblx0XHRcdGF2YWlsYWJsZUNyZWRzLmludXNlID0gXCJ5ZXNcIjtcblxuXHRcdFx0Ly8gV3JpdGUgdGhlIHVwZGF0ZWQgY3JlZGVudGlhbHMgYmFjayB0byB0aGUgQ1NWIGZpbGVcblx0XHRcdGNvbnN0IHVwZGF0ZWREYXRhID0gW1widXNlcm5hbWUsaW51c2VcIiwgLi4uY3JlZHMubWFwKChjcmVkKSA9PiBgJHtjcmVkLnVzZXJuYW1lfSwke2NyZWQuaW51c2V9YCldLmpvaW4oXCJcXG5cIik7XG5cdFx0XHR3cml0ZUZpbGVTeW5jKFwidGVzdC9jcmVkcy5jc3ZcIiwgdXBkYXRlZERhdGEpO1xuXHRcdFx0Y29uc29sZS5sb2coXCJDcmVkZW50aWFscyB1cGRhdGVkIGZvciB1c2VybmFtZTpcIiwgYXZhaWxhYmxlQ3JlZHMudXNlcm5hbWUpO1xuXHRcdFx0cmV0dXJuIGF2YWlsYWJsZUNyZWRzLnVzZXJuYW1lO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIk5vIGF2YWlsYWJsZSBjcmVkZW50aWFscy5cIik7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdGNvbnNvbGUuZXJyb3IoXCJFcnJvciBkdXJpbmcgZmlsZSBvcGVyYXRpb246XCIsIGVycik7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH0gZmluYWxseSB7XG5cdFx0Ly8gUmVsZWFzZSB0aGUgbG9jayBhZnRlciBwcm9jZXNzaW5nXG5cdFx0cmVsZWFzZSgpO1xuXHR9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDcmVkc0FuZExvY2tGaWxlKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuXHRsZXQgbG9ja2VkID0gdHJ1ZTtcblxuXHR3aGlsZSAobG9ja2VkKSB7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHVzZXJuYW1lID0gYXdhaXQgbG9ja0FuZFVwZGF0ZUNyZWRzKCk7XG5cdFx0XHRpZiAodXNlcm5hbWUpIHtcblx0XHRcdFx0cmV0dXJuIHVzZXJuYW1lO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJXYWl0aW5nIGZvciBhdmFpbGFibGUgY3JlZGVudGlhbHMuLi5cIik7XG5cdFx0XHR9XG5cblx0XHRcdGxvY2tlZCA9IGZhbHNlOyAvLyBFeGl0IGxvb3Bcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiRmlsZSBpcyBsb2NrZWQsIHJldHJ5aW5nLi4uXCIpO1xuXHRcdFx0YXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMTAwMCkpOyAvLyBSZXRyeSBhZnRlciAxIHNlY29uZFxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBudWxsOyAvLyBSZXR1cm4gbnVsbCBpZiBubyB1c2VybmFtZSBpcyBmb3VuZFxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVsZWFzZUNyZWRzKHVzZXJuYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0Ly8gTG9jayB0aGUgZmlsZSB0byBwcmV2ZW50IGNvbmN1cnJlbnQgYWNjZXNzXG5cdGNvbnN0IHJlbGVhc2UgPSBhd2FpdCBsb2NrKFwidGVzdC9jcmVkcy5jc3ZcIiwgeyByZXRyaWVzOiA1LCByZXRyeVdhaXQ6IDEwMDAgfSk7XG5cblx0dHJ5IHtcblx0XHQvLyBHZXQgY3JlZGVudGlhbHMgZnJvbSB0aGUgQ1NWIGZpbGVcblx0XHRjb25zdCBjcmVkcyA9IGF3YWl0IG5ldyBQcm9taXNlPHsgdXNlcm5hbWU6IHN0cmluZzsgaW51c2U6IHN0cmluZyB9W10+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGNvbnN0IGNyZWRzOiB7IHVzZXJuYW1lOiBzdHJpbmc7IGludXNlOiBzdHJpbmcgfVtdID0gW107XG5cblx0XHRcdGNyZWF0ZVJlYWRTdHJlYW0oXCJ0ZXN0L2NyZWRzLmNzdlwiKVxuXHRcdFx0XHQucGlwZShjc3YoKSlcblx0XHRcdFx0Lm9uKFwiZGF0YVwiLCAocm93KSA9PiBjcmVkcy5wdXNoKHJvdykpXG5cdFx0XHRcdC5vbihcImVuZFwiLCAoKSA9PiByZXNvbHZlKGNyZWRzKSkgLy8gUmVzb2x2aW5nIGFmdGVyIHRoZSAnZW5kJyBldmVudFxuXHRcdFx0XHQub24oXCJlcnJvclwiLCAoZXJyKSA9PiByZWplY3QoZXJyKSk7IC8vIFJlamVjdCBpZiB0aGVyZSdzIGFuIGVycm9yIGluIHJlYWRpbmcgdGhlIGZpbGVcblx0XHR9KTtcblxuXHRcdC8vIEZpbmQgdGhlIGNyZWRlbnRpYWwgd2l0aCB0aGUgcHJvdmlkZWQgdXNlcm5hbWVcblx0XHRjb25zdCB1c2VyQ3JlZCA9IGNyZWRzLmZpbmQoKGNyZWQpID0+IGNyZWQudXNlcm5hbWUgPT09IHVzZXJuYW1lKTtcblxuXHRcdGlmICh1c2VyQ3JlZCkge1xuXHRcdFx0dXNlckNyZWQuaW51c2UgPSBcIm5vXCI7XG5cblx0XHRcdC8vIFdyaXRlIHRoZSB1cGRhdGVkIGNyZWRlbnRpYWxzIGJhY2sgdG8gdGhlIENTViBmaWxlXG5cdFx0XHRjb25zdCB1cGRhdGVkRGF0YSA9IFtcInVzZXJuYW1lLGludXNlXCIsIC4uLmNyZWRzLm1hcCgoY3JlZCkgPT4gYCR7Y3JlZC51c2VybmFtZX0sJHtjcmVkLmludXNlfWApXS5qb2luKFwiXFxuXCIpO1xuXHRcdFx0d3JpdGVGaWxlU3luYyhcInRlc3QvY3JlZHMuY3N2XCIsIHVwZGF0ZWREYXRhKTtcblx0XHRcdGNvbnNvbGUubG9nKGBDcmVkZW50aWFscyByZWxlYXNlZCBmb3IgdXNlcm5hbWU6ICR7dXNlcm5hbWV9YCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coYFVzZXJuYW1lIG5vdCBmb3VuZDogJHt1c2VybmFtZX1gKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdGNvbnNvbGUuZXJyb3IoXCJFcnJvciBkdXJpbmcgZmlsZSBvcGVyYXRpb246XCIsIGVycik7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9IGZpbmFsbHkge1xuXHRcdC8vIFJlbGVhc2UgdGhlIGxvY2sgYWZ0ZXIgcHJvY2Vzc2luZ1xuXHRcdHJlbGVhc2UoKTtcblx0fVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBLHFDQUFBQSxVQUFBQyxTQUFBO0FBQUEsSUFBQUEsUUFBQTtBQUFBLE1BQ0UsTUFBUTtBQUFBLE1BQ1IsU0FBVztBQUFBLE1BQ1gsYUFBZTtBQUFBLE1BQ2YsTUFBUTtBQUFBLE1BQ1IsT0FBUztBQUFBLE1BQ1QsU0FBVztBQUFBLFFBQ1QsS0FBSztBQUFBLFVBQ0gsT0FBUztBQUFBLFVBQ1QsU0FBVztBQUFBLFVBQ1gsU0FBVztBQUFBLFFBQ2I7QUFBQSxRQUNBLFlBQVk7QUFBQSxRQUNaLGVBQWU7QUFBQSxRQUNmLHFCQUFxQjtBQUFBLFFBQ3JCLHdCQUF3QjtBQUFBLFFBQ3hCLHFCQUFxQjtBQUFBLFFBQ3JCLHdCQUF3QjtBQUFBLFFBQ3hCLGtCQUFrQjtBQUFBLE1BQ3BCO0FBQUEsTUFDQSxTQUFXO0FBQUEsUUFDVCxhQUFhO0FBQUEsUUFDYixNQUFRO0FBQUEsUUFDUixTQUFXO0FBQUEsUUFDWCxNQUFRO0FBQUEsUUFDUixpQkFBaUI7QUFBQSxRQUNqQixZQUFjO0FBQUEsUUFDZCxTQUFXO0FBQUEsTUFDYjtBQUFBLE1BQ0EsWUFBYztBQUFBLFFBQ1osTUFBUTtBQUFBLFFB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Im1vZHVsZSIsICJmcyIsICJwYXRoIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImZzIiwgImVyciIsICJlcnIyIiwgImVyIiwgImVyMiIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJmcyIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJmcyIsICJxdWV1ZSIsICJjcmVhdGVSZWFkU3RyZWFtIiwgInBhdGgiLCAib3B0aW9ucyIsICJjYiIsICJkYXRhIiwgInNyYyIsICJkZXN0IiwgImZsYWdzIiwgImdvJHJlYWRkaXIiLCAibW9kZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJleHBvcnRzIiwgIm9yaWdpbmFsIiwgInJlcXVpcmVfcmV0cnkiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAiZXhwb3J0cyIsICJtb2R1bGUiLCAicHJvY2VzcyIsICJ1bmxvYWQiLCAiZW1pdCIsICJsb2FkIiwgInByb2Nlc3NSZWFsbHlFeGl0IiwgInByb2Nlc3NFbWl0IiwgImV4cG9ydHMiLCAibW9kdWxlIiwgImZzIiwgImVyciIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJmcyIsICJlcnIiLCAibXRpbWVQcmVjaXNpb24iLCAibG9jayIsICJpc092ZXJUaHJlc2hvbGQiLCAiZmlsZSIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJmcyIsICJleHBvcnRzIiwgIm1vZHVsZSIsICJsb2NrIiwgImNyZWRzIiwgImNzdiJdCn0K
