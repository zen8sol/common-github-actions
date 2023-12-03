import {
  RunOptions,
  RunTarget,
  deleteAllFakedDirs,
} from "github-action-ts-run-api";
import { mkdirSync, readFileSync, rm, rmSync, writeFileSync } from "node:fs";
import path from "path";
import { afterAll, beforeEach, describe, expect, test } from "vitest";

const target = RunTarget.mainJs("action.yml");
const tmpDir = "./tmp";
const options = RunOptions.create()
  .setInputs({
    oldVersion: "1.0.1",
    newVersion: "1.1.0",
  })
  .setEnv({
    TODAY_DATE: "2023-12-02"
  })
  .setGithubContext({
    payload: {
      pull_request: { number: 123 },
      repository: { owner: { login: "test_owner" }, name: "test_repository" },
    },
  })
  .setTempDir(tmpDir)
  .setWorkspaceDir(`${tmpDir}/workspace`)
  .setFakeFsOptions({ rmFakedTempDirAfterRun: false, rmFakedWorkspaceDirAfterRun: false });

describe("main", () => {
  beforeEach(async () => {
    rmSync(tmpDir, { force: true, recursive: true });
    mkdirSync(`${tmpDir}/workspace`, {recursive:true});
  });

  test("should update changelog", async () => {
    const tmpChangelogFilePath = path.join('tmp/workspace', "CHANGELOG.md");

    writeFileSync(
      tmpChangelogFilePath,
      readFileSync("./test/resource/CHANGELOG.md")
    );
    const result = await target.run(options);

    expect(result.durationMs).lessThanOrEqual(1000);
    expect(result.stdout).toEqual("");
    expect(result.stderr).toEqual("");
    expect(result.commands.errors).toEqual([]);
    expect(result.runnerWarnings.length).toBe(0);
    expect(result.exitCode).toBe(0);

    const current = readFileSync(tmpChangelogFilePath).toString('utf-8');
    expect(current).toMatchSnapshot();
  });
});
