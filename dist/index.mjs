// src/index.ts
import {
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler
} from "kysely";
import { Client } from "@neondatabase/serverless";
var NeonDialect = class {
  config;
  constructor(config) {
    this.config = config;
  }
  createAdapter() {
    return new PostgresAdapter();
  }
  createDriver() {
    return new NeonDriver(this.config);
  }
  createQueryCompiler() {
    return new PostgresQueryCompiler();
  }
  createIntrospector(db) {
    return new PostgresIntrospector(db);
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
    this.client = new Client(config);
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
export {
  NeonDialect
};
