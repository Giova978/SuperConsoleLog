import * as vscode from 'vscode';
import { checkIfArgumentOfFunc, Config, checkObjectArrayDeclaration, checkIfDeclaration, getFunctionType } from './utils';
import { getMessage, getEnclosure } from './message';

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

            // Add one for it to be the correct line number
            let insertLineNum = line.lineNumber + 1;
            let position: vscode.Position;
            let inlineInsertion = false;
            let numOfSpaces = 0;

            const ifType = checkIfDeclaration(line.text);
            // Gets the function type to know if it inserts in the same line or createa a new line
            const functionType = getFunctionType(line.text);
            // Get the tabulation in a function or if
            if (!line?.isEmptyOrWhitespace) {

                // Get the tabulation from the first character in the line
                if (line?.firstNonWhitespaceCharacterIndex) {
                    numOfSpaces = line.firstNonWhitespaceCharacterIndex;
                }

                if (ifType || checkIfArgumentOfFunc(line.text)) {
                    numOfSpaces += tabSize!;
                }
            }

            if (checkObjectArrayDeclaration(line.text)) {
                insertLineNum = getEnclosure(line.lineNumber, document) + 1;
            }

            if (functionType === 'normal' || functionType === 'arrow') {
                console.log(functionType);
                insertLineNum + 1;
            }

            position = new vscode.Position(insertLineNum, 0);
            // If the console.log goes in the end of the file it will add a line brak for vscode to create a new line
            const breakInFileEnd = insertLineNum >= document.lineCount - 1 ? '\n' : '';

            if (functionType === 'arrow-inline' || ifType === 'inline') {
                insertLineNum -= 1;
                numOfSpaces = 1;
                position = new vscode.Position(insertLineNum, line.text.length);
                inlineInsertion = true;
            }

            const spaces = " ".repeat(numOfSpaces);


            editor.edit(editBuilder => {
                // Add one to insertLine for it to display correctly
                const message = getMessage(insertLineNum + 1, document.getText(selection).trim(), selection, editor, config);

                let text = `${spaces}${message}\n`;

                if (inlineInsertion) {
                    editBuilder.replace(position, text);
                } else {
                    text = `${breakInFileEnd}${text}`;

                    editBuilder.insert(position, text);
                }
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