import { getInput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { LocalDate, ZoneOffset } from "@js-joda/core";
import fs from "fs";
import path from "path";

function getFileLines(filePath: string): string[] {
  return fs.readFileSync(filePath).toString("utf-8").split("\n");
}

const main = async () => {
  try {
    const changelogFilePath = path.join(
      process.env.RUNNER_TEMP,
      "CHANGELOG.md"
    );
    const newVersionInput: string = getInput("newVersion");
    const repository = context.payload.repository.owner.login+'/'+context.payload.repository.name;
    const releaseDate:string = process.env.TODAY_DATE ?? context.payload. LocalDate.now(ZoneOffset.UTC).toString();

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

    for (let i = changelogLines.length - 1; i >= 0; i--) {
      if (changelogLines[i].startsWith("[unreleased]")) {
        let oldVersion = changelogLines[i + 1].split(" ", 1)[0].slice(1, -1);
        changelogLines[i] = [
          `[unreleased] https://github.com/${repository}/compare/${newVersionInput}...HEAD`,
          `[${newVersionInput}] https://github.com/${repository}/compare/${oldVersion}...${newVersionInput}`,
        ].join("\n");
      }
    }

    fs.writeFileSync(changelogFilePath, changelogLines.join("\n"));
  } catch (error) {
    setFailed(error.message);
  }
};

main();
