import { compilePopi } from "./compilePopi";

export function popiPlugin() {
  return {
    name: "popi",
    setup(build: any) {
      build.onLoad({ filter: /\.popi$/ }, async (args: { path: string }) => {
        const source = await Bun.file(args.path).text();

        return {
          contents: compilePopi(source),
          loader: "ts"
        };
      });
    }
  };
}
