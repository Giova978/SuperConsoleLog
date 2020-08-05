import * as vscode from 'vscode';
import { classDeclaration, functionDeclaration, Config } from './utils';

export function getMessage(fileName: string, text: string, selection: vscode.Selection, editor: vscode.TextEditor, config: Config) {

    const quotes = config.singleQuotes ? "'" : '"';
    let message = `console.log(${quotes}${fileName} `;
    const enclosures = [];
    let funcsFounds = 0;
    let classesFounds = 0;

    for (let currLine = selection.active.line; currLine >= 0; currLine--) {
        const line = editor.document.lineAt(currLine);
        if (line.text.startsWith("//")) { continue; }

        const classFound = classDeclaration(line.text);
        const funcFound = functionDeclaration(line.text);

        if (classFound && classesFounds <= config.includeEnclosureClassName) {
            const enclosureFinish = getEnclosure(currLine, editor.document);
            if (enclosureFinish > -1) {
                if (enclosureFinish < selection.active.line) { continue; }
                enclosures.push(classFound);
            }
        }

        if (funcFound && funcsFounds <= config.includeEnclosureFuncName) {
            const enclosureFinish = getEnclosure(currLine, editor.document);

            if (enclosureFinish > -1) {
                if (enclosureFinish < selection.active.line) { continue; }
                enclosures.push(funcFound);
            }
        }
    }

    if (enclosures.length !== 0) {
        enclosures.reverse().map((name: string) => {
            message += `-> ${name} `;
            return;
        });
    }

    const textFormatted = text.replace(/'/g, "\'").replace(/`/g, "\`").replace(/"/g, '\"');
    const semiColon = config.endSemiColon ? ';' : '';

    message += `-> ${textFormatted}${quotes}, ${textFormatted})${semiColon}`;
    return message;
}

function getEnclosure(firstLine: number, document: vscode.TextDocument) {
    let openBrackets = 0;
    let closedBrackets = 0;
    let finishLine = -1;

    for (let currLine = firstLine; currLine < document.lineCount; currLine++) {
        const line = document.lineAt(currLine);

        if (Array.isArray(line.text.match(/{/g))) {
            openBrackets++;
        }

        if (Array.isArray(line.text.match(/}/g))) {
            closedBrackets++;
        }

        if (openBrackets === closedBrackets) {
            finishLine = currLine;
            break;
        }

    }

    return finishLine;
}