/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * Public visibility of an ingested specimen.
 * Serialized as a string (`Draft`, `Published`, `Removed`).
 */
export type SpecimenVisibilityStatus = "Draft" | "Published" | "Removed";

export type SpecimenTargetStatus = "Published" | "Draft" | "Removed";

/**
 * FileLink = The source is a direct file link to an media file (.jpg, .mp4,...);
 *
 * YouTube = The source is an YouTube link. The video will be downloaded with YouTube specific handlers;
 *
 * Vimeo = The source is an Vimeo link. The file will not be downloaded, instead only links will be ingested;
 */
export type SourceType = "FileLink" | "YouTube" | "Vimeo";

export type RecordStatus =
  | "Unprocessed"
  | "Processed"
  | "Rejected"
  | "Publishable"
  | "Published"
  | "Deleted";

export type BatchStatus =
  | "Uploading"
  | "Scheduled"
  | "Processing"
  | "Finished"
  | "Failed"
  | "Archived";

export interface EnqueueIngestionRequest {
  /**
   * Specimen entries to ingest. Provide a stable `sourceKey` per specimen for recurring syncs.
   * Keys must be unique within this request when supplied.
   */
  entries: IngestionEntry[];
}

export interface EnqueueIngestionResponse {
  /** @format int64 */
  batchId: number;
}

export interface Error {
  processingStep: string;
  message: string;
  sourceKey?: string | null;
  /** @format date-time */
  happenedAt: string;
}

export interface GetBatchErrorsResponse {
  errors: Error[];
}

/** The current status of an ingestion batch */
export interface GetBatchStatusResponse {
  /**
   * Batch ID
   * @format int64
   */
  batchId: number;
  /** Batch source name */
  sourceName: string;
  /** Names of the steps running in the current phase, comma separated */
  currentStep?: string | null;
  /**
   * Step completion (in %)
   * @format int32
   */
  stepProgressPercent?: number | null;
  status: BatchStatus;
  /** Detailed information about imported entries */
  importedEntries: ImportedEntry[];
}

export interface ImportedEntry {
  sourceKey: string;
  specimenLink?: string | null;
  details: IngestionDetails;
}

export interface IngestionDetails {
  specimenImportStatus: RecordStatus;
  listingImportStatus: RecordStatus;
  /** @format int32 */
  targetSpecimenId?: number | null;
  /** @format double */
  targetWeight?: number | null;
  /** @format double */
  targetWidth?: number | null;
  /** @format double */
  targetHeight?: number | null;
  /** @format double */
  targetDepth?: number | null;
  /** @format double */
  targetPrice?: number | null;
  /** @format int32 */
  ingestionSpecimenParserRevision?: number | null;
  ingestionWeightSource?: string | null;
  ingestionSizeSource?: string | null;
  ingestionLocalitySource?: string | null;
  ingestionSpeciesSource?: string | null;
  targetStatus: SpecimenTargetStatus;
  targetIsPrivate: boolean;
}

/**
 * A single specimen to ingest.
 * Only `name` is required at submit time; other fields are enriched by the pipeline when omitted.
 * To publish successfully the entry must resolve to at least one valid EarthWonders species and include usable media.
 */
export interface IngestionEntry {
  /**
   * Stable unique key for this specimen within your catalog (source).
   * Used to update or replace the same specimen on later batches. If omitted, a random key is generated (not recommended for recurring syncs).
   */
  sourceKey?: string | null;
  /**
   * Display name of the specimen (required).
   * Also used as a fallback source for species matching when `species` is omitted or does not match any known mineral
   * (for example `"Amethyst Cluster"` can resolve to Amethyst).
   */
  name: string;
  /**
   * Locality / origin text (for example `"Artigas, Uruguay"`).
   * If omitted, locality may be extracted from `description`.
   */
  location?: string | null;
  /**
   * Free-form, multiline specimen description.
   * When structured fields are missing, weight, size, and locality may be extracted from this text.
   */
  description?: string | null;
  /**
   * Specimen weight as `"[value] [unit]"` (for example `"420 g"`, `"1.5 kg"`, `"2 lbs"`).
   * If omitted, weight may be extracted from `description`.
   */
  weight?: string | null;
  /**
   * Specimen size as `"[width] x [height] x [depth] [unit]"` (for example `"11 x 10 x 7 cm"`).
   * Used when `width`, `height`, and `depth` are not provided.
   * If none of the dimension fields are present, size may be extracted from `description`.
   */
  size?: string | null;
  /**
   * Specimen width in meters. Prefer this (with height/depth) over `size` when you have numeric dimensions.
   * @format double
   */
  width?: number | null;
  /**
   * Specimen height in meters.
   * @format double
   */
  height?: number | null;
  /**
   * Specimen depth in meters.
   * @format double
   */
  depth?: number | null;
  /** Optional internal SKU or dealer reference string. */
  sku?: string | null;
  /** Whether the specimen is currently offered for sale. */
  forSale?: boolean | null;
  /** When true, the listing price is available on request rather than shown as a fixed amount. */
  requestPrice?: boolean | null;
  /**
   * Date the specimen was sold, as `yyyy-MM-dd`.
   * @format date
   */
  soldDate?: string | null;
  /**
   * Listing price as a decimal string. Currency symbols and thousand separators are tolerated
   * (for example `"$ 40,000.00"`, `"250.00"`).
   */
  price?: string | null;
  /** ISO currency code for the listing price (for example `USD`, `EUR`). */
  currency?: string | null;
  /**
   * Media attached to the specimen. At least one publishable media item is required for the specimen to go live.
   * Prefer HTTPS `FileLink` URLs that are publicly reachable without authentication.
   */
  media?: MediaDefinition[] | null;
  /**
   * Optional color labels for the specimen. If omitted, colors may be detected from the first image.
   * Valid values: Black, Blue, Brown, Copper, Cream, Gold, Green, Grey, Multicolored, Orange, Pink, Purple, Red, Silver, White, Yellow, Colorless.
   */
  colors?: string[] | null;
  /**
   * Preferred way to set species: mineral names matched against the EarthWonders species catalog (including synonyms),
   * case-insensitive, with simple plural forms accepted (for example `"Amethyst"`, `"quartzes"`).
   * Extra surrounding text in a value is allowed as long as the species name appears as a word.
   * If this field is omitted or no values match, species are inferred from `name` instead.
   * Specimens that still have no valid species after both steps are rejected and will not publish.
   */
  species?: string[] | null;
  /** Optional publication citations associated with the specimen. */
  publications?: PublicationEntry[] | null;
  /** Optional free-form tags applied to the specimen. */
  tags?: string[] | null;
  /** Optional notes about the sale (buyer context, payment, etc.). */
  saleNotes?: string | null;
  /** Optional names of known previous owners (provenance). */
  knownPreviousOwners?: string[] | null;
  /** Optional override for the specimen owner display name. */
  owner?: string | null;
  /**
   * Public visibility of an ingested specimen.
   * Serialized as a string (`Draft`, `Published`, `Removed`).
   */
  status?: SpecimenVisibilityStatus;
  /**
   * When true, the specimen (and its listing) is hidden from public search but still visible to its owner.
   * Omit for public (`false`).
   */
  isPrivate?: boolean | null;
}

export interface MediaDefinition {
  /**
   * The public source URL from which the media can be accessed.
   * For `FileLink`, must be an absolute HTTPS URL reachable from the public internet (no private/internal hosts).
   */
  url: string;
  /**
   * FileLink = The source is a direct file link to an media file (.jpg, .mp4,...);
   *
   * YouTube = The source is an YouTube link. The video will be downloaded with YouTube specific handlers;
   *
   * Vimeo = The source is an Vimeo link. The file will not be downloaded, instead only links will be ingested;
   */
  sourceURLType: SourceType;
  /**
   * Link for embedding the media inside an html page.
   * Needs to be filled for Vimeo source types.
   */
  embedUrl?: string | null;
  /** Thumbnail link for video files. */
  thumbnail?: string | null;
  /**
   * Media height.
   * @format int32
   */
  height?: number | null;
  /**
   * Media width.
   * @format int32
   */
  width?: number | null;
  /** Name of the photographer that created this piece of media. */
  photographerName?: string | null;
}

export interface PublicationEntry {
  /** The name of the entity releasing the publications. Ex. "Mineralogical Record" */
  publisherName?: string | null;
  /** The title of the publication in which the specimen is mentioned. */
  publicationTitle?: string | null;
  /**
   * Date the publication was released. String formatted as 'yyyy-MM-dd'.
   * @format date
   */
  publicationDate?: string | null;
  /**
   * Number of the page on which the specimen is mentioned in the publication.
   * @format int32
   */
  publicationPage?: number | null;
  /** Description of the specimen in the publication. */
  publicationDescription?: string | null;
}

export interface ValidationProblemDetails {
  type?: string | null;
  title?: string | null;
  /** @format int32 */
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  errors: Record<string, string[]>;
  [key: string]: any;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data.data;
    });
  };
}

/**
 * @title EarthWonders Ingestion API
 * @version 1.0
 *
 * Upload mineral specimens to EarthWonders in batches. Authenticate every request with an `X-API-Key` header.
 *
 * ## Typical flow
 * 1. `POST /batch` with one or more specimen entries.
 * 2. Poll `GET /batch/{id}` until the batch status is `Finished`, `Failed`, or `Archived`.
 * 3. On failure, inspect `GET /batch/{id}/errors` for per-entry processing errors.
 *
 * ## How specimen fields are resolved
 * Many fields are optional. When omitted, the ingestion pipeline tries to derive them:
 *
 * - **Species (required for publish):** Prefer an explicit `species` array of mineral names (matched against EarthWonders species and synonyms). If that is missing or matches nothing, species are inferred from the specimen `name` (e.g. `"Amethyst Cluster"` → Amethyst). Entries with no resolvable species are rejected.
 * - **Locality:** Use `location`, or it may be extracted from `description`.
 * - **Weight / size:** Use `weight` / `size` (or `width`/`height`/`depth`), or they may be extracted from `description`.
 * - **Colors:** Use `colors`, or they may be detected from the first image.
 *
 * ## Media
 * At least one media item is required for a specimen to publish. Prefer `FileLink` with a publicly reachable **HTTPS** image/video URL. YouTube and Vimeo links are also supported via `sourceURLType`.
 *
 * ## Idempotency
 * Provide a stable `sourceKey` per specimen within your catalog so later batches update the same record instead of creating duplicates. If omitted, a random key is generated.
 */
export class EarthwondersAPI<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  batch = {
    /**
     * @description Accepts a list of specimen entries and schedules them for asynchronous ingestion. Returns a `batchId` immediately — poll `GET /batch/{id}` for progress. Each entry must eventually resolve to a valid EarthWonders species (via `species` or inference from `name`) and include usable media to publish. Entries in one request must have unique `sourceKey` values when keys are provided.
     *
     * @tags Ingestion
     * @name EnqueueIngestionBatch
     * @summary Enqueue a specimen batch
     * @request POST:/batch
     * @secure
     * @response `200` `EnqueueIngestionResponse` OK
     * @response `400` `ValidationProblemDetails` Bad Request
     */
    enqueueIngestionBatch: (
      data: EnqueueIngestionRequest,
      params: RequestParams = {},
    ) =>
      this.request<EnqueueIngestionResponse, ValidationProblemDetails>({
        path: `/batch`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns the processing status of a previously enqueued batch, including per-entry import outcomes and specimen links when available. Poll until `status` is `Finished`, `Failed`, or `Archived`.
     *
     * @tags Ingestion
     * @name GetBatchStatus
     * @summary Get batch status
     * @request GET:/batch/{id}
     * @secure
     * @response `200` `GetBatchStatusResponse` OK
     * @response `404` `void` Not Found
     */
    getBatchStatus: (id: number, params: RequestParams = {}) =>
      this.request<GetBatchStatusResponse, void>({
        path: `/batch/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns processing errors for entries in a batch (for example missing species, media scrape failures, or validation issues).
     *
     * @tags Ingestion
     * @name GetBatchErrors
     * @summary Get batch errors
     * @request GET:/batch/{id}/errors
     * @secure
     * @response `200` `GetBatchErrorsResponse` OK
     * @response `404` `void` Not Found
     */
    getBatchErrors: (id: number, params: RequestParams = {}) =>
      this.request<GetBatchErrorsResponse, void>({
        path: `/batch/${id}/errors`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
