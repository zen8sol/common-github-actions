import { getInput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { LocalDate, ZoneOffset } from "@js-joda/core";
import fs from "fs";
import path from "path";

function getFileLines(filePath: string): string[] {
  if (!fs.existsSync(filePath)) {
    throw new Error("File not exists: "+filePath);
  }
  return fs.readFileSync(filePath).toString("utf-8").split("\n");
}

function genCompareRevLink(
  repository: string,
  oldRev: string | null,
  newRev: string | "HEAD"
): string {
  const label = newRev === "HEAD" ? "[unreleased]" : `[${newRev}]`;
  const linkType =
    oldRev === null
      ? `/releases/tag/${newRev}`
      : `compare/${oldRev}...${newRev}`;
  return `${label} https://github.com/${repository}/${linkType}   `;
}

function updateChangelogFooter(
  changelogLines: string[],
  repository: string,
  newVersionInput: string
) {
  let foundOldVersion = false;
  for (let i = changelogLines.length - 1; i >= 0; i--) {
    if (changelogLines[i].startsWith("[unreleased]")) {
      if (changelogLines.length < i + 1) {
        throw new Error("`[unreleased]` line exists, but previous version line not"
        );
      }

      const extractOldVersionRegex = /\[([0-9.]+)\]/;
      // [0.1.0] ...
      const oldVersionTagString = changelogLines[i + 1].split(" ", 1)[0];
      const oldVersionMatch = oldVersionTagString.match(extractOldVersionRegex);

      if (!oldVersionMatch) {
        throw new Error("Invalid old version format: " + oldVersionTagString);
      }

      const oldVersion = oldVersionMatch[1];

      changelogLines[i] = [
        genCompareRevLink(repository, newVersionInput, "HEAD"),
        genCompareRevLink(repository, oldVersion, newVersionInput),
      ].join("\n");
      foundOldVersion = true;
      break;
    }
  }

  if (!foundOldVersion) {
    changelogLines.push(
      [
        genCompareRevLink(repository, newVersionInput, "HEAD"),
        genCompareRevLink(repository, null, newVersionInput),
      ].join("\n")
    );
  }
}

const main = async () => {
  try {
    const changelogFilePath = path.join(
      process.env.GITHUB_WORKSPACE,
      "CHANGELOG.md"
    );
    const newVersionInput: string = getInput("newVersion");
    const repository =
      context.payload.repository.owner.login +
      "/" +
      context.payload.repository.name;
    const releaseDate: string =
      process.env.TODAY_DATE ?? LocalDate.now(ZoneOffset.UTC).toString();

    let changelogLines: string[] = getFileLines(changelogFilePath);

    const newVersionChangesReplaces = [
      "## [Unreleased]\n",
      `## [${newVersionInput}] - ${releaseDate}`,
    ].join("\n");

    for (let i = 0; i < changelogLines.length; i++) {
      if (changelogLines[i] === "## [Unreleased]") {
        changelogLines[i] = newVersionChangesReplaces;
        break;
      }
    }

    updateChangelogFooter(changelogLines, repository, newVersionInput);

    fs.writeFileSync(changelogFilePath, changelogLines.join("\n"));
  } catch (error) {
    setFailed(error.message);
  }
};

main();
