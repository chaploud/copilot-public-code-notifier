import * as vscode from "vscode";
import * as chokidar from "chokidar";
import * as fs from "fs";
import * as path from "path";

/** Parse log line like below and get Licnese types and URL
 * 2023-11-20 11:21:43.827 [info] '/Users/new.js' Similar code with 3 license types [Apache-2.0, MIT, unknown] https://github.com/hogehoge/fugafuga [Ln 0, Col 9] result = []; for ...
 */
function parseLogLine(line: string) {
  const regex = /Similar code with (\d+) license type[s]? \[(.*)\] (https.+) \[Ln \d+, Col \d+\]/;
  const match = regex.exec(line);
  if (match) {
    return {
      count: parseInt(match[1]),
      licenseTypes: match[2].split(", "),
      url: match[3],
    };
  }
  return null;
}

function notifyLicenseInfo(licenseInfo: { count: number; licenseTypes: string[]; url: string }) {
  const message = `Found ${licenseInfo.count} similar code with ${licenseInfo.licenseTypes.join(", ")} license types.\n${licenseInfo.url}`;
  vscode.window.showInformationMessage(message);
}

function watchLogFile(logFilePath: string) {
  let previousContent = "";

  const watcher = chokidar.watch(logFilePath, { persistent: true, usePolling: true, interval: 1000 });

  watcher.on("change", (filePath) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      const newContent = data;
      const diff = newContent.substring(previousContent.length);
      previousContent = newContent;

      const lines = diff.split("\n");
      for (const line of lines) {
        const licenseInfo = parseLogLine(line);
        if (licenseInfo) {
          notifyLicenseInfo(licenseInfo);
        }
      }
    });
  });
}

export function activate(context: vscode.ExtensionContext) {
  // TODO: 現在のWindownとひもづく最新のGitHub Copilot Logのログファイル
  // /home/shota/.config/Code/logs/20250215T192809/window1/exthost/output_logging_20250215T192812/7-GitHub Copilot Log.log
  // Windows, Mac, Linuxでログファイルのパスが異なるので、それぞれの環境でログファイルのパスを取得する方法を調査する
  // const logFilePath =
  // "/home/shota/.config/Code/logs/20250216T094145/window4/exthost/output_logging_20250216T101037/2-GitHub Copilot Log.log";
  // watchLogFile(logFilePath);

  // context.subscriptions.push({
  //   dispose: () => {
  //     chokidar.watch(logFilePath).close();
  //   },
  // });

  const disposable = vscode.commands.registerCommand("copilot-public-code-notifier.helloWorld", () => {
    const commands = vscode.commands.getCommands().then((commands) => {
      fs.writeFile("/tmp/vscode-commands.json", JSON.stringify(commands, null, 2), (err) => {
        if (err) {
          console.error(err);
        }
      });
    });
  });
  vscode.window.showInformationMessage(`windowID: ${vscodeWindowId}`);

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
