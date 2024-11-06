
import { context } from 'esbuild';
import express, { Request, Response } from 'express';
import { join } from 'path';



async function buildApp() {
  const ctx = await context({
    entryPoints: ["src/client/main.tsx"],
    bundle: true,
    minify: false,
    platform: 'browser',
    jsx: 'automatic',
    outfile: "dist/index.js",
    treeShaking: true,
    plugins: [{
      name: 'rebuild-notify',
      setup(build) {
        build.onEnd(result => {
          console.log(`build ended with ${result.errors.length} errors`);
          for (const error of result.errors) {
            console.log('===================');
            console.log('Text: ', error.text);
            console.log('Detail: ', error.detail);
            console.log('location: ', error.location);
          }
          // HERE: somehow restart the server from here, e.g., by sending a signal that you trap and react to inside the server.
        })
      },
    }],
  });
  return ctx.watch();
}

export function scriptApp() {
  const buildPromise = buildApp();

  const jsApp = express();

  jsApp.use((_: Request, __: Response, next: (err?: any) => void) => {
    return buildPromise.then(() => {
      next();
    }).catch(next);
  });

  jsApp.use(express.static(join(__dirname, '../../../dist')));

  return jsApp;
}
