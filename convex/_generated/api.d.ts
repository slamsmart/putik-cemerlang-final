/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as arsipCustomColumns from "../arsipCustomColumns.js";
import type * as arsipSurat from "../arsipSurat.js";
import type * as gratifikasi from "../gratifikasi.js";
import type * as guestbook from "../guestbook.js";
import type * as pengaduanMasyarakat from "../pengaduanMasyarakat.js";
import type * as settings from "../settings.js";
import type * as skm from "../skm.js";
import type * as sliders from "../sliders.js";
import type * as stats from "../stats.js";
import type * as visitorStats from "../visitorStats.js";
import type * as votingEom from "../votingEom.js";
import type * as whistleBlowing from "../whistleBlowing.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  arsipCustomColumns: typeof arsipCustomColumns;
  arsipSurat: typeof arsipSurat;
  gratifikasi: typeof gratifikasi;
  guestbook: typeof guestbook;
  pengaduanMasyarakat: typeof pengaduanMasyarakat;
  settings: typeof settings;
  skm: typeof skm;
  sliders: typeof sliders;
  stats: typeof stats;
  visitorStats: typeof visitorStats;
  votingEom: typeof votingEom;
  whistleBlowing: typeof whistleBlowing;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
