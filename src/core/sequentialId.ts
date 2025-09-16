
import tinyStore from "../store/tinyStore";

const [seq, setSeq] = tinyStore(0);

export const sequentialId = (): number => {
  setSeq((p) => p + 1);
  return seq();
};
