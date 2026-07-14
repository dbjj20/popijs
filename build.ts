import { mkdir, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { compilePL } from "./compiler/compilePL";
import { plPlugin } from "./compiler/plPlugin";

async function collectPlFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        const path = join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...await collectPlFiles(path));
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(".pl")) {
            files.push(path);
        }
    }

    return files;
}

async function compilePlFiles(
    inputDir = "./compiler/examples",
    outputDir = "./generated/pl"
) {
    const files = await collectPlFiles(inputDir);
    await mkdir(outputDir, { recursive: true });

    for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const source = await Bun.file(file).text();
        const outputName = `${basename(file, ".pl")}.ts`;
        await Bun.write(join(outputDir, outputName), compilePL(source));
    }
}

await compilePlFiles();

const plugins = [plPlugin()];

await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './build',
    target: 'browser',
    splitting: true,
    plugins,
    // minify: {
    //     whitespace: true,
    //     identifiers: true,
    //     syntax: true,
    // },
});
await Bun.build({
    entrypoints: ['./src/components/MainComponent.ts'],
    outdir: './build/assets',
    target: 'browser',
    splitting: true,
    plugins,
    // minify: {
    //     whitespace: true,
    //     identifiers: true,
    //     syntax: true,
    // },
});
