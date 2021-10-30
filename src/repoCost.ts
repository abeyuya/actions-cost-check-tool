import * as yargs from "yargs";
import { Octokit } from "@octokit/core";

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
  const octokit = new Octokit({ auth: options.token });

  const workflowsResponse = await octokit.request(
    "GET /repos/{owner}/{repo}/actions/workflows",
    {
      owner: options.owner,
      repo: options.repo,
    }
  );

  const tasks = workflowsResponse.data.workflows.map(async (workflow) => {
    const res = await octokit.request(
      "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing",
      {
        owner: options.owner,
        repo: options.repo,
        workflow_id: workflow.id,
      }
    );

    return { ...workflow, ...res.data };
  });

  const timingResponses = await Promise.all(tasks);

  const sum = timingResponses.reduce(
    (sum, res) => {
      sum.UBUNTU += res.billable.UBUNTU?.total_ms || 0;
      sum.MACOS += res.billable.MACOS?.total_ms || 0;
      sum.WINDOWS += res.billable.WINDOWS?.total_ms || 0;
      return sum;
    },
    { UBUNTU: 0, MACOS: 0, WINDOWS: 0 }
  );

  const result = { sum_billable_ms: sum, workflows: timingResponses };

  console.log(JSON.stringify({ result }, null, 2));
};

main(argv).catch(console.error);
