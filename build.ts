import { existsSync } from "node:fs";
import { mkdir, readdir, rm } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { compilePL } from "./compiler/compilePL";
import { plPlugin } from "./compiler/plPlugin";

type DynamicComponentConfig = {
    module: string;
    exports: string[];
    placeholder?: {
        tagName?: string;
        className?: string;
        text?: string;
        props?: Record<string, any>;
    };
};

type PulseDomConfig = {
    dynamicComponents?: DynamicComponentConfig[];
};

type GeneratedDynamicModule = {
    sourcePath: string;
    wrapperPath: string;
};

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

async function readPulseDomConfig(path = "./pulsedom.config.json"): Promise<PulseDomConfig> {
    const file = Bun.file(path);
    if (!(await file.exists())) return {};
    return JSON.parse(await file.text());
}

function toImportPath(fromDir: string, toPath: string): string {
    let nextPath = relative(fromDir, toPath).replaceAll("\\", "/");
    if (!nextPath.startsWith(".")) nextPath = `./${nextPath}`;
    return nextPath;
}

function assertValidExportName(name: string): void {
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) {
        throw new Error(`Invalid dynamic component export name: ${name}`);
    }
}

function resolveSourceImport(importPath: string, importer: string): string | undefined {
    if (!importPath.startsWith(".") && !importPath.startsWith("/")) return undefined;

    const basePath = importPath.startsWith("/")
        ? importPath
        : resolve(dirname(importer), importPath);

    const candidates = extname(basePath)
        ? [basePath]
        : [
            `${basePath}.ts`,
            `${basePath}.js`,
            join(basePath, "index.ts"),
            join(basePath, "index.js")
        ];

    for (let i = 0; i < candidates.length; i += 1) {
        if (existsSync(candidates[i])) return resolve(candidates[i]);
    }

    return undefined;
}

function dynamicComponentPlugin(generatedModules: GeneratedDynamicModule[]) {
    const generatedRoot = resolve("./generated/dynamic");
    const redirects = new Map<string, string>();

    for (let i = 0; i < generatedModules.length; i += 1) {
        redirects.set(generatedModules[i].sourcePath, generatedModules[i].wrapperPath);
    }

    return {
        name: "pulsedom-dynamic-components",
        setup(build: any) {
            build.onResolve({ filter: /.*/ }, (args: any) => {
                if (!args.importer) return undefined;

                const importer = resolve(args.importer);
                if (importer === generatedRoot || importer.startsWith(`${generatedRoot}${sep}`)) {
                    return undefined;
                }

                const resolvedPath = resolveSourceImport(args.path, importer);
                if (!resolvedPath) return undefined;

                const wrapperPath = redirects.get(resolvedPath);
                return wrapperPath ? { path: wrapperPath } : undefined;
            });
        }
    };
}

async function generateDynamicComponentWrappers(
    components: DynamicComponentConfig[] = [],
    outputDir = "./generated/dynamic"
): Promise<GeneratedDynamicModule[]> {
    const generated: GeneratedDynamicModule[] = [];

    if (components.length === 0) return generated;

    await rm(outputDir, { recursive: true, force: true });
    await mkdir(outputDir, { recursive: true });

    for (let i = 0; i < components.length; i += 1) {
        const entry = components[i];
        const sourcePath = resolve(entry.module);
        const sourceName = basename(sourcePath, extname(sourcePath));
        const wrapperPath = resolve(outputDir, `${sourceName}.ts`);
        const chunkDir = resolve(outputDir, sourceName);
        const wrapperDir = dirname(wrapperPath);
        const placeholder = entry.placeholder || {};
        const placeholderProps = {
            ...(placeholder.props || {}),
            ...(placeholder.className ? { className: placeholder.className } : {})
        };
        const options = {
            ...(placeholder.tagName ? { tagName: placeholder.tagName } : {}),
            ...(Object.keys(placeholderProps).length > 0 ? { props: placeholderProps } : {}),
            ...(placeholder.text != null ? { loadingText: placeholder.text } : {})
        };
        const lines = [
            `import { lazyComponent } from "${toImportPath(wrapperDir, resolve("./src/render/lazyComponent.ts"))}";`,
            ""
        ];

        await mkdir(chunkDir, { recursive: true });

        for (let j = 0; j < entry.exports.length; j += 1) {
            const exportName = entry.exports[j];
            assertValidExportName(exportName);

            const chunkPath = join(chunkDir, `${exportName}.ts`);
            const chunkDirname = dirname(chunkPath);
            await Bun.write(
                chunkPath,
                `import { ${exportName} } from "${toImportPath(chunkDirname, sourcePath)}";\n\nexport default ${exportName};\n`
            );

            lines.push(
                `export const ${exportName} = lazyComponent(`,
                `  () => import("${toImportPath(wrapperDir, chunkPath)}").then((module) => module.default),`,
                `  ${JSON.stringify(options, null, 2).replace(/\n/g, "\n  ")}`,
                `);`,
                ""
            );
        }

        await Bun.write(wrapperPath, `${lines.join("\n")}\n`);
        generated.push({ sourcePath, wrapperPath });
    }

    return generated;
}

await compilePlFiles();

const config = await readPulseDomConfig();
const generatedDynamicModules = await generateDynamicComponentWrappers(config.dynamicComponents);
const plugins = [plPlugin(), dynamicComponentPlugin(generatedDynamicModules)];

await rm("./build", { recursive: true, force: true });

await Bun.build({
    entrypoints: [
        './src/index.ts',
        './src/components/MainComponent.ts'
    ],
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
