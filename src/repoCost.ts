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

  const workflowIds = workflowsResponse.data.workflows.map((w) => w.id);

  const tasks = workflowIds.map((workflowId) => {
    return octokit.request(
      "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing",
      {
        owner: options.owner,
        repo: options.repo,
        workflow_id: workflowId,
      }
    );
  });

  const timingResponses = await Promise.all(tasks);

  const sum = timingResponses.reduce(
    (sum, res) => {
      console.log(res.data.billable);
      sum.UBUNTU += res.data.billable.UBUNTU?.total_ms || 0;
      sum.MACOS += res.data.billable.MACOS?.total_ms || 0;
      sum.WINDOWS += res.data.billable.WINDOWS?.total_ms || 0;
      return sum;
    },
    { UBUNTU: 0, MACOS: 0, WINDOWS: 0 }
  );

  console.log(JSON.stringify({ sum }, null, 2));
};

main(argv).catch(console.error);
