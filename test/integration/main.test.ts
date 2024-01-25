import {
  RunOptions,
  RunTarget
} from "github-action-ts-run-api";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "path";
import { beforeEach, describe, expect, test } from "vitest";

const target = RunTarget.mainJs("action.yml");
const tmpDir = "./tmp";
const options = () => RunOptions.create()
  .setOutputOptions({parseStderrCommands: true, parseStdoutCommands: true})
  .setInputs({
    newVersion: "1.1.0",
  })
  .setEnv({
    TODAY_DATE: "2023-12-02",
  })
  .setGithubContext({
    payload: {
      pull_request: { number: 123 },
      repository: { owner: { login: "test_owner" }, name: "test_repository" },
    },
  })
  .setTempDir(tmpDir)
  .setWorkspaceDir(`${tmpDir}/workspace`)
  .setFakeFsOptions({
    rmFakedTempDirAfterRun: false,
    rmFakedWorkspaceDirAfterRun: false,
  });

describe("main", () => {
  const tmpChangelogFilePath = path.join("tmp/workspace", "CHANGELOG.md");
  beforeEach(async () => {
    rmSync(tmpDir, { force: true, recursive: true });
    mkdirSync(`${tmpDir}/workspace`, { recursive: true });
  });

  test("should update changelog", async () => {
    writeFileSync(
      tmpChangelogFilePath,
      readFileSync("./test/resource/CHANGELOG.md")
    );
    const result = await target.run(options());

    expect(result.durationMs).lessThanOrEqual(1000);
    expect(result.stdout).toEqual("");
    expect(result.stderr).toEqual("");
    expect(result.commands.errors).toEqual([]);
    expect(result.runnerWarnings.length).toBe(0);
    expect(result.exitCode).toBe(0);

    const current = readFileSync(tmpChangelogFilePath).toString("utf-8");
    expect(current).toMatchSnapshot();
  });

  test("when first release changelog, should update", async () => {
    writeFileSync(
      tmpChangelogFilePath,
      readFileSync("./test/resource/changelog_first_release.md")
    );
    const result = await target.run(options());

    expect(result.durationMs).lessThanOrEqual(1000);
    expect(result.stdout).toEqual("");
    expect(result.stderr).toEqual("");
    expect(result.commands.errors).toEqual([]);
    expect(result.runnerWarnings.length).toBe(0);
    expect(result.exitCode).toBe(0);

    const current = readFileSync(tmpChangelogFilePath).toString("utf-8");
    expect(current).toMatchSnapshot();
  });
});
