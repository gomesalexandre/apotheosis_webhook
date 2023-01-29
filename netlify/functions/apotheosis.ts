import { Octokit } from "@octokit/rest";

const octokit = new Octokit();

import { Handler } from "@netlify/functions";

const SS_OWNER = "shapeshift";
const SS_WEB_REPO = "web";

type PullAction =
  | "assigned"
  | "auto_merge_disabled"
  | "auto_merge_enabled"
  | "closed"
  | "converted_to_draft"
  | "dequeued"
  | "edited"
  | "labeled"
  | "locked"
  | "opened"
  | "queued"
  | "ready_for_review"
  | "reopened"
  | "review_request_removed"
  | "review_requested"
  | "synchronize"
  | "unassigned"
  | "unlabeled"
  | "unlocked";

type PullActivity = {
  action: PullAction;
  repository: string;
  sender: string;
  number: number;
};

const isMerged = async (pullNumber: number) => {
  await new Promise((resolve) => setTimeout(resolve, 4000));

  const { data: pr } = await octokit.rest.pulls.get({
    owner: SS_OWNER,
    repo: SS_WEB_REPO,
    pull_number: pullNumber,
  });
  return pr.merged;
};
const handler: Handler = async (event) => {
  const okResponse = {
    statusCode: 200,
  };
  const noOpResponse = {
    statusCode: 204,
  };

  if (!event.body) return noOpResponse;

  const pullActivity: PullActivity = JSON.parse(event.body);

  const merged = await isMerged(pullActivity.number);

  if (
    pullActivity.sender === "0xapotheosis" &&
    pullActivity.action === "closed" &&
    !merged
  ) {
    return okResponse;
  }

  return noOpResponse;
};

export { handler };
