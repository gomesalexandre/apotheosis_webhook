import { Event } from "@netlify/functions/dist/function/event";
import LambdaTester from "lambda-tester";
import { handler } from "../functions/apotheosis";

import Octokit from "@octokit/rest";
jest.mock("@octokit/rest", () => {
  return {
    Octokit: function () {
      this.rest = {
        pulls: {
          get: jest.fn(() => ({ data: { merged: false } })),
        },
      };
    },
  };
});

describe("handler", function () {
  jest.useRealTimers();

  const mockShouldYell = {
    sender: "0xapotheosis",
    action: "closed",
    number: 42,
  };
  it("should yell at Apotheosis when he closes PRs", async function () {
    await LambdaTester(handler)
      .event({
        body: JSON.stringify(mockShouldYell),
      } as Event)
      .expectResolve((result) => {
        expect(result.statusCode).toEqual(200);
      });
  });
  // it("should not yell at Apotheosis when he merges PRs", async function () {
  // mockOctokit.mockImplementationOnce(() => ({
  // rest: {
  // pulls: { get: () => ({ data: { merged: true } }) },
  // },
  // }));
  //
  // await LambdaTester(handler)
  // .event({
  // body: JSON.stringify(mockShouldYell),
  // } as Event)
  // .expectResolve((result) => {
  // expect(result.statusCode).toEqual(204);
  // });
  // });
});
