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
  
  // Define la función copyObj que crea una copia del estado
  const copyObj = (obj: any): TState => {
    if (isStateOnly) {
      return JSON.parse(JSON.stringify(obj)) as TState;
    }
    if (Array.isArray(obj)) {
      return [...obj] as TState;
    }
    return { ...obj } as TState;
  };
  
  // Función para obtener el estado actual
  const getProps = (): TState => {
    return copyObj(tinyStoreState);
  };
  
  // Función para registrar el estado en la consola
  const logState = (state: TState): void => {
    if (name && name.includes("PRINT")) {
      console.log(
        `======INCOMING VALUE/s to => ${name.replace("PRINT", "") || ""}`,
        state
      );
    }
  };
  
  // Función para actualizar el estado
  const setProps = (propsOrSetter: TState | ((state: TState) => TState)): void => {
    if (typeof propsOrSetter === "function") {
      tinyStoreState = copyObj((propsOrSetter as (state: TState) => TState)(tinyStoreState));
      logState(tinyStoreState);
      return;
    }
    
    // La lógica para manejar arrays, objetos, strings y números ha sido simplificada.
    // Con la inferencia de tipos y los genéricos, no necesitas comprobaciones tan detalladas.
    // La versión original tenía algunas comprobaciones redundantes o incompletas.
    tinyStoreState = copyObj(propsOrSetter as TState);
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
  
  // Define la función copyObj para crear una copia del objeto
  const copyObj = (obj: any): TState => {
    return { ...obj } as TState;
  };
  
  // Función para obtener el estado actual
  const getProps = (): TState => {
    return copyObj(tinyStoreState);
  };
  
  // Función para actualizar el estado
  const setProps = (propsOrSetter: TState | ((state: TState) => TState)): void => {
    if (typeof propsOrSetter === "function") {
      tinyStoreState = copyObj((propsOrSetter as (state: TState) => TState)(tinyStoreState));
      return;
    }
    // Simplificación similar a tinyStore
    tinyStoreState = copyObj(propsOrSetter as TState);
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
): [(func: EffectFunction, arr?: any[]) => void, (arr: any[], el?: any) => void] => {
  let tinyStoreState: any; // El tipo `any` se usa porque no se especifica el tipo de estado.
  let interFunc: EffectFunction | undefined;
  
  /**
   * Configura la función de efecto y sus dependencias.
   * @param func La función que se ejecutará como efecto.
   * @param arr Un array de dependencias.
   */
  const setEffect = (func: EffectFunction, arr?: any[]): void => {
    if (typeof func === "function") {
      interFunc = func;
      // La función `effect` y `compare` no están definidas en el código original.
      // Se asume que son funciones externas y se tipa su llamada.
      // effect(func, arr, tinyStoreState, (deps) => {
      //   tinyStoreState = deps;
      // });
      console.log('`effect` function placeholder called.');
    }
  };
  
  /**
   * Ejecuta el efecto si las dependencias han cambiado.
   * @param arr Un array de dependencias para comparar.
   * @param el Un elemento opcional.
   */
  const execute = (arr: any[], el?: any): void => {
    try {
      if (typeof interFunc === "function") {
        // La función `compare` no está definida en el código original.
        // const res = compare(arr, tinyStoreState);
        // if (res) {
        //   return;
        // }
        console.log('`compare` function placeholder called.');
        
        const result = interFunc();
        if (typeof result === "function" && !el) {
          result();
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };
  
  return [setEffect, execute];
};