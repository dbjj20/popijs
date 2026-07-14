// Define una interfaz para las opciones de configuración
interface TinyStoreOptions {
  name?: string;
  isStateOnly?: boolean;
}

// Define un tipo genérico para la función tinyStore, que puede manejar cualquier tipo de estado
export const tinyStore = <TState>(
  initialState: TState,
  options: TinyStoreOptions = { name: "", isStateOnly: true }
): [() => TState, (propsOrSetter: TState | ((state: TState) => TState)) => void] => {
  const { name = "", isStateOnly = true } = options;
  let tinyStoreState: TState = initialState;
  let didWarnStructuredClone = false;

  const cloneState = (value: TState): TState => {
    if (!isStateOnly) {
      return value;
    }

    if (typeof structuredClone === "function") {
      try {
        return structuredClone(value);
      } catch (error) {
        if (!didWarnStructuredClone) {
          console.warn("structuredClone fallback triggered", error);
          didWarnStructuredClone = true;
        }
      }
    }

    if (Array.isArray(value)) {
      return [...value] as TState;
    }

    if (value && typeof value === "object") {
      return { ...(value as Record<string, unknown>) } as TState;
    }

    return value;
  };

  const getProps = (): TState => {
    return cloneState(tinyStoreState);
  };

  const logState = (state: TState): void => {
    if (name && name.includes("PRINT")) {
      console.log(
        `======INCOMING VALUE/s to => ${name.replace("PRINT", "") || ""}`,
        state
      );
    }
  };

  const setProps = (propsOrSetter: TState | ((state: TState) => TState)): void => {
    if (typeof propsOrSetter === "function") {
      tinyStoreState = cloneState((propsOrSetter as (state: TState) => TState)(tinyStoreState));
      logState(tinyStoreState);
      return;
    }

    tinyStoreState = cloneState(propsOrSetter as TState);
    logState(tinyStoreState);
  };

  return [getProps, setProps];
};
// Define una interfaz para las opciones de treeSaver
interface TreeSaverOptions {
  beforeInit?: () => void;
}

// Define el tipo para la función treeSaver
export const treeSaver = <TState>(
  initialState: TState,
  options?: TreeSaverOptions
): [() => TState, (propsOrSetter: TState | ((state: TState) => TState)) => void] => {
  if (options?.beforeInit && typeof options.beforeInit === "function") {
    options.beforeInit();
  }
  
  let tinyStoreState: TState = initialState;

  const getProps = (): TState => {
    return tinyStoreState;
  };
  
  const setProps = (propsOrSetter: TState | ((state: TState) => TState)): void => {
    if (typeof propsOrSetter === "function") {
      tinyStoreState = (propsOrSetter as (state: TState) => TState)(tinyStoreState);
      return;
    }
    tinyStoreState = propsOrSetter as TState;
  };
  
  return [getProps, setProps];
};

export default tinyStore;

// Define el tipo para la función de efecto
type EffectFunction = () => void | (() => void);

// Define el tipo para las opciones, aunque no se usan en el cuerpo de la función original
type EffectOptions = any;

/**
 * Hook de efecto simplificado para ejecutar funciones con dependencias.
 * @param options Opciones de configuración (no utilizadas en esta implementación).
 * @returns Una tupla con las funciones `setEffect` y `execute`.
 */
export const effectV2 = (
  options: EffectOptions = {}
): [(func: EffectFunction, arr?: any[]) => void, (arr?: any[], el?: any) => void] => {
  let cleanup: (() => void) | undefined;
  let interFunc: EffectFunction | undefined;
  let previousDeps: any[] | undefined;

  const haveDepsChanged = (nextDeps: any[] = [], prevDeps: any[] | undefined): boolean => {
    if (!prevDeps) {
      return true;
    }

    if (nextDeps.length !== prevDeps.length) {
      return true;
    }

    return nextDeps.some((value, index) => !Object.is(value, prevDeps[index]));
  };

  const runEffect = (deps: any[] = []) => {
    if (typeof interFunc !== "function") {
      return;
    }

    if (!haveDepsChanged(deps, previousDeps)) {
      return;
    }

    cleanup?.();
    const result = interFunc();
    cleanup = typeof result === "function" ? result : undefined;
    previousDeps = [...deps];
  };

  const setEffect = (func: EffectFunction, deps: any[] = []): void => {
    if (typeof func !== "function") {
      return;
    }

    cleanup?.();
    cleanup = undefined;
    previousDeps = undefined;
    interFunc = func;
    runEffect(deps);
  };

  const execute = (deps: any[] = [], el?: any): void => {
    runEffect(deps);

    if (el && typeof cleanup === "function" && options?.autoCleanup) {
      cleanup();
      cleanup = undefined;
    }
  };

  return [setEffect, execute];
};
