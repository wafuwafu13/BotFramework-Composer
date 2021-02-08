// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');

const fs = require('fs-extra');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

function omit(obj, keys) {
  const picked = Object.assign({}, obj);

  keys.forEach((key) => {
    delete picked[key];
  });

  return picked;
}

function parseConfig(argv) {
  let configPath = argv.config;

  // if no config, look at default spot
  // if there is config, resolve to cwd and validate

  if (!configPath) {
    const defaultPath = path.resolve(argv.package, 'esbuild.json');

    if (fs.pathExistsSync(defaultPath)) {
      configPath = defaultPath;
    }
  } else if (configPath) {
    const absPath = path.resolve(process.cwd(), configPath);
    if (fs.pathExistsSync(absPath)) {
      configPath = absPath;
    } else {
      throw new Error(`Cannot read config from ${absPath}`);
    }
  }

  if (configPath && fs.pathExistsSync(configPath)) {
    return fs.readJsonSync(configPath);
  }

  // else look at the package.json for "esbuild"
  const pJson = fs.readJSONSync(path.join(argv.package, 'package.json'));
  if (pJson.esbuild) {
    return pJson.esbuild;
  }

  return {};
}

const argv = yargs(hideBin(process.argv))
  .command(
    '$0 [package]',
    'Thin wrapper around esbuild. Supports all esbuild arguments with conventional defaults.',
    (args) => {
      args.positional('package', {
        type: 'string',
        description: 'Relative path to package.',
        default: process.cwd(),
        normalize: true,
        coerce: (arg) => {
          if (arg && !path.isAbsolute(arg)) {
            return path.resolve(process.cwd(), arg);
          }
          return arg;
        },
      });
    }
  )
  .option('config', {
    description: 'Path to build configuration. Uses esbuild.json or package.json#esbuild as default.',
  })
  .middleware((args) => {
    args.config = parseConfig(args);
  })
  .version(false)
  .help().argv;

async function getFilesInDir(directory) {
  let fileList = [];

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const files = await fs.promises.readdir(directory, { withFileTypes: true });
  for (const file of files) {
    // skip all mock and test directories
    if (['__mocks__', '__tests__'].includes(file.name)) {
      continue;
    }

    // skip test files (if not in a __tests__ directory)
    if (/.*\.test\.(ts|js)x?$/.test(file.name)) {
      continue;
    }

    const p = path.join(directory, file.name);
    if (file.isDirectory()) {
      fileList = [...fileList, ...(await getFilesInDir(p))];
    } else {
      fileList.push(p);
    }
  }

  return fileList;
}

async function resolveEntryPoint(shouldBundle) {
  if (shouldBundle) {
    // just resolve the index
    const filesToCheck = ['index.ts', 'index.tsx'];

    for (const fileName of filesToCheck) {
      if (fs.pathExistsSync(path.join(argv.package, 'src', fileName))) {
        return [path.join(argv.package, 'src', fileName)];
      }
    }

    throw new Error('No entrypoint found.');
  } else {
    // get all files in src dir
    const files = await getFilesInDir(path.join(argv.package, 'src'));
    return files;
  }
}

function getUserOverrides() {
  return {
    ...argv.config,
    ...omit(argv, ['config', 'package', '_', '$0']),
  };
}

async function build(argv) {
  const buildOptions = {
    outdir: path.join(argv.package, 'dist'),
    bundle: false,
    platform: 'node',
    target: ['es2015'],
    format: 'esm',
    sourcemap: true,
    logLevel: 'error',
    plugins: [
      nodeExternalsPlugin({
        packagePath: path.join(argv.package, 'package.json'),
      }),
    ],
    ...getUserOverrides(),
  };

  buildOptions.entryPoints = buildOptions.entryPoints || (await resolveEntryPoint(buildOptions.bundle));

  return esbuild.build(buildOptions);
}

build(argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
