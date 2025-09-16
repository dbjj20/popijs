await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './build',
    target: 'browser',
    splitting: true,
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
    // minify: {
    //     whitespace: true,
    //     identifiers: true,
    //     syntax: true,
    // },
});