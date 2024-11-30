import tinyStore from "./tinyStore";

export function randomString(strLength, charSet) {
  const result = [];

  strLength = strLength || 5;
  charSet =
    charSet ||
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  while (strLength) {
    result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
    strLength -= 1;
  }

  return result.join("");
}