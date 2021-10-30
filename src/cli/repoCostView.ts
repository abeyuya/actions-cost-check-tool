import * as yargs from "yargs";

import { buildRepoCost } from "../common/repo";
import { calclateGithubActionsCostUSD } from "../common/cost";

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

  const ubuntsCost = calclateGithubActionsCostUSD(
    result.sum_billable_ms.UBUNTU,
    "LINUX"
  );

  const macosCost = calclateGithubActionsCostUSD(
    result.sum_billable_ms.MACOS,
    "MACOS"
  );

  const windowsCost = calclateGithubActionsCostUSD(
    result.sum_billable_ms.WINDOWS,
    "WINDOWS"
  );

  console.log(
    JSON.stringify({
      sum: ubuntsCost + macosCost + windowsCost,
      ubuntsCost,
      macosCost,
      windowsCost,
    })
  );
};

main(argv).catch(console.error);
