
import { context } from 'esbuild';
import express, { Request, Response } from 'express';
import { join } from 'path';

export const buildPromise = context({
  entryPoints: ["src/client/main.tsx"],
  bundle: true,
  minify: false,
  platform: 'browser',
  jsx: 'automatic',
  // format: 'esm',
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
}).then((ctx) => {
  return ctx.watch();
});

export const jsApp = express();

jsApp.use((req: Request, res: Response, next: (err?: any) => void) => {
  return buildPromise.then(() => {
    console.log('done building');
    next();
  }).catch(next);
});

jsApp.use(express.static(join(__dirname, '../../../dist')));
