import * as yargs from "yargs";

import { buildRepoCost } from "./common/repo";

const argv = yargs
  .option("owner", {
    type: "string",
    description: "repository owner name",
    demandOption: true,
  })
  .option("repo", {
    type: "string",
    description: "repository name",
    demandOption: true,
  })
  .option("token", {
    type: "string",
    description: "github access token",
    demandOption: true,
  })
  .help()
  .parseSync();

const main = async (options: typeof argv) => {
  const result = await buildRepoCost(options);

  console.log(JSON.stringify(result));
};

main(argv).catch(console.error);
