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

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "copilot-public-code-notifier" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand("copilot-public-code-notifier.helloWorld", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World from Copilot Public Code Notifier!");
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
