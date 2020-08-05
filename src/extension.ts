import * as vscode from 'vscode';
import { checkIfArgumentOfFunc, Config } from './utils';
import { getMessage } from './message';
import { config } from 'process';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('consolelogsuper.log', () => {
        const editor = vscode.window.activeTextEditor;
        const config = vscode.workspace.getConfiguration('SuperConsoleLog');
        console.log(config.get('singleQuotes'));

        if (!editor) { return; }
        if (!editor.selection) { return; }
        const document = editor?.document;
        const tabSize = typeof editor.options.tabSize !== 'string' ? editor.options.tabSize : 2;

        editor.selections.map(selection => {
            const line = document.lineAt(selection.active.line);
            const insertLineNum = line.lineNumber + 1;
            const position = new vscode.Position(insertLineNum, 0);
            const breakInFileEnd = line.lineNumber === document.lineCount - 1 ? '\n' : '';

            let numOfSpaces = 0;

            // Get the tabulation in the
            if (!line?.isEmptyOrWhitespace) {
                if (line?.firstNonWhitespaceCharacterIndex) {
                    numOfSpaces = line.firstNonWhitespaceCharacterIndex;
                }

                if (checkIfArgumentOfFunc(line.text)) {
                    numOfSpaces += tabSize!;
                }
            }

            const spaces = " ".repeat(numOfSpaces);

            editor.edit(editBuilder => {
                const message = getMessage(document.fileName, document.getText(selection).trim(), selection, editor, {
                    endSemiColon: true,
                    includeEnclosureClassName: 1,
                    includeEnclosureFuncName: 2,
                    includeFileName: true,
                    singleQuotes: false,
                });

                const text = `${breakInFileEnd}${spaces}${message}\n`;

                editBuilder.insert(position, text);
            });
        });
    });

    context.subscriptions.push(disposable);
}