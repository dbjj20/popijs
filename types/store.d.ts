export interface TinyStoreOptions {
  name?: string;
  isStateOnly?: boolean;
}

export declare const tinyStore: <TState>(
  initialState: TState,
  options?: TinyStoreOptions
) => [() => TState, (propsOrSetter: TState | ((state: TState) => TState)) => void];

export interface TreeSaverOptions {
  beforeInit?: () => void;
}

export declare const treeSaver: <TState>(
  initialState: TState,
  options?: TreeSaverOptions
) => [() => TState, (propsOrSetter: TState | ((state: TState) => TState)) => void];

export declare const effectV2: (
  options?: any
) => [(func: () => void | (() => void), arr?: any[]) => void, (arr?: any[], el?: any) => void];

export default tinyStore;
