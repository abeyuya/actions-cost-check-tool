import { Octokit } from "@octokit/core";

export const buildRepoCost = async (options: {
  owner: string;
  repo: string;
  token: string;
}) => {
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

  return result;
};
