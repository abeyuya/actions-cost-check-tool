import * as yargs from "yargs";
import { Octokit } from "@octokit/core";

const argv = yargs
  .option("org", {
    type: "string",
    description: "github username",
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
  const octokit = new Octokit({ auth: options.token });

  const res = await octokit.request(
    "GET /orgs/{org}/settings/billing/actions",
    {
      org: options.org,
    }
  );

  console.log(JSON.stringify(res.data));
};

main(argv).catch(console.error);
