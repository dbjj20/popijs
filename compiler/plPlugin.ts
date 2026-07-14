import { compilePL } from "./compilePL";

export function plPlugin() {
  return {
    name: "pulsedom-pl",
    setup(build: any) {
      build.onLoad({ filter: /\.pl$/ }, async (args: { path: string }) => {
        const source = await Bun.file(args.path).text();

        return {
          contents: compilePL(source),
          loader: "ts"
        };
      });
    }
  };
}
