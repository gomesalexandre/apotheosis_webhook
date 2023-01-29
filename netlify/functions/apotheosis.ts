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

type User = {
  // Non-exhaustive, we just need this really
  login: string;
};

type PullRequest = {
  user: User;
};

type PullActivity = {
  action: PullAction;
  repository: string;
  number: number;
  pull_request: PullRequest;
  sender: User;
};

const yell = async () => {
  // TODO: Implement me
  console.log("This should yell");
};

const reopen = async () => {
  // TODO: Implement me
  console.log("This should reopen the PR");
};

const isGraphitePr = async () => {
  // TODO: Implement me
  return true
}
const isMerged = async (pullNumber: number) => {
  // Wait 30 seconds after the synchronize event is triggered to ensure the branch is merged
  await new Promise((resolve) => setTimeout(resolve, 30000));

  const { data: pr } = await octokit.rest.pulls.get({
    owner: SS_OWNER,
    repo: SS_WEB_REPO,
    pull_number: pullNumber,
  });
  return pr.merged;
};

const isClosed = async (pullNumber: number) => {
  const { data: pr } = await octokit.rest.pulls.get({
    owner: SS_OWNER,
    repo: SS_WEB_REPO,
    pull_number: pullNumber,
  });
  return pr.state === "closed";
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

  // We only want to listen to the synchronize event i.e base branch changed:
  // "A pull request's head branch was updated. For example, the head branch was updated from the base branch or new commits were pushed to the head branch."
  // https://docs.github.com/developers/webhooks-and-events/webhooks/webhook-events-and-payloads?actionType=synchronize#pull_request
  if (pullActivity.action !== "synchronize") return noOpResponse;

  // PRs are automatically rebased to a new base branch when the previous branch's PR is merged
  // This triggers a synchronize event from the PR author, which is the only event we care about
  if (pullActivity.sender.login !== pullActivity.pull_request.user.login)
    return noOpResponse;

  const merged = await isMerged(pullActivity.number);
  const closed = await isClosed(pullActivity.number);

  if (pullActivity.sender.login === "0xapotheosis" && closed && !merged) {
    await yell();
    await reopen();
    return okResponse;
  }

  return noOpResponse;
};

export { handler };
