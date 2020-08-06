import * as vscode from 'vscode';
import { checkIfArgumentOfFunc, Config } from './utils';
import { getMessage } from './message';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('superconsolelog.log', async () => {
        const editor = vscode.window.activeTextEditor;
        const configWorkspace = vscode.workspace.getConfiguration('superConsoleLog');
        const config: Config = createConfigObj(configWorkspace);

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
                    console.log('Argumento');
                    numOfSpaces += tabSize!;
                }
            }

            const spaces = " ".repeat(numOfSpaces);
            console.log(numOfSpaces);

            editor.edit(editBuilder => {
                // Add one for it to display correctly
                const message = getMessage(insertLineNum + 1, document.getText(selection).trim(), selection, editor, config);

                const text = `${breakInFileEnd}${spaces}${message}\n`;

                editBuilder.insert(position, text);
            });
        });
    });

    context.subscriptions.push(disposable);
}

function createConfigObj(config: vscode.WorkspaceConfiguration) {
    const configObj: Config = {
        quotes: config.quotes,
        endSemiColon: config.endSemiColon,
        includeFileName: config.includeFileName,
        includeEnclosureFuncName: config.includeEnclosureFunctionName,
        includeEnclosureClassName: config.includeEnclosureClassName,
        includeLine: config.includeLineNum,
        includeFullPath: config.includeFullPath,
    };

    return configObj;
}