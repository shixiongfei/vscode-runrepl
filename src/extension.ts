/*
 * extension.ts
 *
 * Copyright (c) 2023 Xiongfei Shi
 *
 * Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 * License: Apache-2.0
 *
 * https://github.com/shixiongfei/vscode-runrepl
 */

import * as vscode from "vscode";

let terminal: vscode.Terminal | undefined;

function createTerminal(name: string) {
  const terminals = vscode.window.terminals.filter(
    (terminal) => terminal.name === name
  );
  terminals.forEach((terminal) => terminal.dispose());

  return vscode.window.createTerminal(name);
}

const getCode = (textEditor: vscode.TextEditor) => {
  if (!textEditor.selection) {
    return;
  } else if (
    textEditor.selection.start.line === textEditor.selection.end.line &&
    textEditor.selection.start.character === textEditor.selection.end.character
  ) {
    return textEditor.document.lineAt(textEditor.selection.start.line).text;
  } else {
    return textEditor.document.getText(textEditor.selection);
  }
};

export function activate(context: vscode.ExtensionContext) {
  const disposable = [
    vscode.commands.registerCommand("extension.runREPL", () => {
      const terminalName = "Interactive Window (REPL) terminal";

      if (!terminal) {
        terminal = createTerminal(terminalName);
      }
      terminal.show();
    }),

    vscode.commands.registerTextEditorCommand(
      "extension.runREPL.sendSelection",
      (textEditor) => {
        if (!terminal) {
          vscode.window.showInformationMessage("The extension is not running");
          return;
        }

        const code = getCode(textEditor);

        if (code) {
          terminal.sendText(code, code[code.length - 1] !== "\n");
        }
      }
    ),

    vscode.commands.registerTextEditorCommand(
      "extension.runREPL.sendLine",
      (textEditor) => {
        if (!terminal) {
          vscode.window.showInformationMessage("The extension is not running");
          return;
        }

        const preCode = getCode(textEditor);

        if (preCode) {
          const code = preCode.replace(/[\n\r]/g, " ");
          terminal.sendText(code, code[code.length - 1] !== "\n");
        }
      }
    ),
  ];

  vscode.window.onDidCloseTerminal((event) => {
    if (terminal === event) {
      terminal = undefined;
    }
  });

  context.subscriptions.push(...disposable);
}

export function deactivate() {
  if (terminal) {
    terminal.dispose();
    terminal = undefined;
  }
}
