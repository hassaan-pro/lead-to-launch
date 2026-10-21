import type {
  ActionBuilder,
  HttpActionBuilder,
  MutationBuilder,
  QueryBuilder,
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  GenericDatabaseReader,
  GenericDatabaseWriter,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

/**
 * Define a query in this Convex app's public API.
 *
 * This function will be allowed to read data from your Convex database and
 * will be accessible from the client.
 *
 * @param func - The query function. It receives a {@link QueryCtx} as its first argument.
 */
export declare const query: QueryBuilder<DataModel, "public">;

/**
 * Define a query that is only accessible from other Convex functions (but not from the client).
 */
export declare const internalQuery: QueryBuilder<DataModel, "internal">;

/**
 * Define a mutation in this Convex app's public API.
 */
export declare const mutation: MutationBuilder<DataModel, "public">;

/**
 * Define a mutation that is only accessible from other Convex functions (but not from the client).
 */
export declare const internalMutation: MutationBuilder<DataModel, "internal">;

/**
 * Define an action in this Convex app's public API.
 */
export declare const action: ActionBuilder<DataModel, "public">;

/**
 * Define an action that is only accessible from other Convex functions (but not from the client).
 */
export declare const internalAction: ActionBuilder<DataModel, "internal">;

/**
 * Define an HTTP action in this Convex app's public API.
 */
export declare const httpAction: HttpActionBuilder;

/**
 * A set of services for use within Convex query functions.
 */
export type QueryCtx = GenericQueryCtx<DataModel>;

/**
 * A set of services for use within Convex mutation functions.
 */
export type MutationCtx = GenericMutationCtx<DataModel>;

/**
 * A set of services for use within Convex action functions.
 */
export type ActionCtx = GenericActionCtx<DataModel>;

/**
 * An interface to read from the database within Convex query functions.
 */
export type DatabaseReader = GenericDatabaseReader<DataModel>;

/**
 * An interface to write to and read from the database within Convex mutation functions.
 */
export type DatabaseWriter = GenericDatabaseWriter<DataModel>;
