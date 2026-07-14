
let seq = 0;

export const sequentialId = (): number => {
  seq += 1;
  return seq;
};
