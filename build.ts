import { mkdir, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { compilePopi } from "./compiler/compilePopi";
import { popiPlugin } from "./compiler/popiPlugin";

async function collectPopiFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        const path = join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...await collectPopiFiles(path));
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(".popi")) {
            files.push(path);
        }
    }

    return files;
}

async function compilePopiFiles(
    inputDir = "./compiler/examples",
    outputDir = "./generated/popi"
) {
    const files = await collectPopiFiles(inputDir);
    await mkdir(outputDir, { recursive: true });

    for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const source = await Bun.file(file).text();
        const outputName = `${basename(file, ".popi")}.ts`;
        await Bun.write(join(outputDir, outputName), compilePopi(source));
    }
}

await compilePopiFiles();

const plugins = [popiPlugin()];

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
