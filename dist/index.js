"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  NeonDialect: () => NeonDialect
});
module.exports = __toCommonJS(src_exports);
var import_kysely = require("kysely");
var import_serverless = require("@neondatabase/serverless");
var NeonDialect = class {
  config;
  constructor(config) {
    this.config = config;
  }
  createAdapter() {
    return new import_kysely.PostgresAdapter();
  }
  createDriver() {
    return new NeonDriver(this.config);
  }
  createQueryCompiler() {
    return new import_kysely.PostgresQueryCompiler();
  }
  createIntrospector(db) {
    return new import_kysely.PostgresIntrospector(db);
  }
};
var NeonDriver = class {
  config;
  constructor(config) {
    this.config = config;
  }
  async init() {
  }
  async acquireConnection() {
    return new NeonConnection(this.config);
  }
  async beginTransaction(conn) {
    return await conn.beginTransaction();
  }
  async commitTransaction(conn) {
    return await conn.commitTransaction();
  }
  async rollbackTransaction(conn) {
    return await conn.rollbackTransaction();
  }
  async releaseConnection(conn) {
    return await conn.destroy();
  }
  async destroy() {
  }
};
var NeonConnection = class {
  config;
  client;
  constructor(config) {
    this.config = config;
    this.client = new import_serverless.Client(config);
    Object.assign(
      this.client.neonConfig,
      config
    );
  }
  async executeQuery(compiledQuery) {
    await this.client.connect();
    const result = await this.client.query(compiledQuery.sql, [
      ...compiledQuery.parameters
    ]);
    if (result.command === "INSERT" || result.command === "UPDATE" || result.command === "DELETE") {
      const numAffectedRows = BigInt(result.rowCount);
      return {
        // TODO: remove.
        numUpdatedOrDeletedRows: numAffectedRows,
        numAffectedRows,
        rows: result.rows ?? []
      };
    }
    return {
      rows: result.rows ?? []
    };
  }
  async beginTransaction() {
    throw new Error("Transactions are not supported yet.");
  }
  async commitTransaction() {
    throw new Error("Transactions are not supported yet.");
  }
  async rollbackTransaction() {
    throw new Error("Transactions are not supported yet.");
  }
  async destroy() {
    this.client.end();
  }
  async *streamQuery(_compiledQuery, _chunkSize) {
    throw new Error("Neon Driver does not support streaming");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NeonDialect
});
