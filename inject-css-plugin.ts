// code copied from this repo https://github.com/emosheeep/fe-tools/
import path from "path";
import fs from "fs";
import color from "picocolors";
import MagicString from "magic-string";
import type { Plugin, LibraryOptions, BuildOptions } from "vite";
import type { OutputChunk } from "rollup";
import { logger } from "./log";

type LibOptions = LibraryOptions & Pick<BuildOptions, "rollupOptions">;

const prefix = color.cyan("[vite:lib-inject-css]:");

/**
 * Help to generate lib entry object with similar directory structure.
 * @param entryDirs directories to scan.
 * @returns lib entry object
 */
export function scanEntries(entryDirs: string[]) {
  const entries: Record<string, string> = {};
  for (const dirname of entryDirs) {
    for (const subtitle of fs.readdirSync(dirname)) {
      entries[subtitle] = path.resolve(dirname, subtitle);
    }
  }
  return entries;
}

/**
 * Inject css at the top of each generated chunk file, only works with library mode.
 * @param libOptions Optional libOptions which will overwrite the relevant options.
 */
export function libInjectCss(libOptions?: LibOptions): Plugin {
  let skipInject = false;

  return {
    name: "vite:lib-inject-css",
    apply: "build",
    enforce: "post",
    config() {
      const { rollupOptions, ...lib } = libOptions || ({} as LibOptions);
      return {
        build: {
          /**
           * Must enable css code split, otherwise there's only one `style.css` and `chunk.viteMetadata.importedCss` will be empty.
           * @see https://github.com/vitejs/vite/blob/HEAD/packages/vite/src/node/plugins/css.ts#L578-L579
           */
          cssCodeSplit: true,
          rollupOptions,
          lib
        }
      };
    },
    configResolved(config) {
      if (!config.build.lib) {
        skipInject = true;
        console.log(
          `\n${prefix} ${color.yellow(
            "Current build is not in lib mode, skip code injection."
          )}\n`
        );
      }
    },
    renderChunk(code, chunk) {
      logger.info("render Chunk: ", chunk.fileName, "-----");
      if (skipInject || !chunk.viteMetadata) return;
      const { importedCss } = chunk.viteMetadata;
      if (!importedCss.size) return;

      /**
       * Inject the referenced style files at the top of the chunk.
       * Delegate the task of how to handle these files to the user's build tool.
       */
      const ms = new MagicString(code);
      for (const cssFileName of importedCss) {
        logger.info("chunk.fileName", chunk.fileName);

        let cssFilePath = path.relative(
          path.dirname(chunk.fileName),
          cssFileName
        );
        logger.info("cssFileName: ", cssFileName);
        logger.info("cssFilePath: ", cssFilePath);

        cssFilePath = cssFilePath.startsWith(".")
          ? cssFilePath
          : `./${cssFilePath}`;
        ms.prepend(`import '${cssFilePath}';\n`);
      }

      return {
        code: ms.toString(),
        map: ms.generateMap()
      };
    },
    // generateBundle(options, bundle) {
    //   logger.info(bundle);
    //   Object.entries(bundle).forEach(([fileName, chunk]) => {
    //     // @ts-ignore
    //     if (!chunk.viteMetadata || chunk.type === "asset") return;
    //     const { importedCss } = (chunk as OutputChunk).viteMetadata!;
    //     if (!importedCss.size) return;

    //     const code = chunk.code;
    //     const ms = new MagicString(code);
    //     for (const cssFileName of importedCss) {
    //       // logger.info("chunk.fileName", chunk.fileName);

    //       let cssFilePath = path.relative(
    //         path.dirname(chunk.fileName),
    //         cssFileName
    //       );
    //       // logger.info("cssFileName: ", cssFileName);
    //       // logger.info("cssFilePath: ", cssFilePath);

    //       cssFilePath = cssFilePath.startsWith(".")
    //         ? cssFilePath
    //         : `./${cssFilePath}`;
    //       ms.prepend(`import '${cssFilePath}';\n`);
    //     }
    //     chunk.code = ms.toString();
    //     chunk.map = ms.generateMap();
    //   });

      // return {
      //   code: ms.toString(),
      //   map: ms.generateMap()
      // };
    // }
  };
}
