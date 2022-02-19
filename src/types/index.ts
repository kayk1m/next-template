export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
export type MaybePromise<T> = T | Promise<T>;
export type Nullable<T> = T | null;
