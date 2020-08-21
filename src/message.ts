import * as vscode from 'vscode';
import { classDeclaration, getFunctionName, Config, checkForArgumentDeconstruction, checkForLoop } from './utils';

export function getMessage(insertLine: number, text: string, selection: vscode.Selection, editor: vscode.TextEditor, config: Config) {

    const line = config.includeLine ? `${insertLine}:` : '';
    let fileName = editor.document.fileName;

    if (config.includeFileName && !config.includeFullPath) {
        if (fileName.match(/\\/g)) {
            const fileNameArr = fileName.split("\\");
            fileName = fileNameArr[fileNameArr.length - 1];
        }

        if (fileName.match(/\//g)) {
            const fileNameArr = fileName.split("/");
            fileName = fileNameArr[fileNameArr.length - 1];
        }
    } else if (!config.includeFileName) {
        fileName = '';
    }

    let message = `console.log(${config.quotes}${line}${fileName} `;
    const enclosures = [];
    let funcsFounds = 0;
    let classesFounds = 0;

    for (let currLine = selection.active.line; currLine >= 0; currLine--) {
        const line = editor.document.lineAt(currLine);
        if (line.text.startsWith("//")) { continue; }

        const classFound = classDeclaration(line.text);
        // The functions regExp detects for loops as a function so i have to check if the for regExp validate the line with a for loop
        // If its found a for loop then will set the variable to false to not include the name in the final message
        // Otherwise calls getFunctionName to get the function name
        const funcFound = checkForLoop(line.text) ? false : getFunctionName(line.text);

        if (classFound && classesFounds < config.includeEnclosureClassName) {
            const enclosureFinish = getEnclosure(currLine, editor.document);
            if (enclosureFinish > -1) {
                if (enclosureFinish < selection.active.line) { continue; }
                enclosures.push(classFound);
                classesFounds++;
            }
        }

        if (funcFound && funcsFounds < config.includeEnclosureFuncName) {
            const enclosureFinish = getEnclosure(currLine, editor.document);

            if (enclosureFinish > -1) {
                if (enclosureFinish < selection.active.line) { continue; }
                enclosures.push(funcFound);
                funcsFounds++;
            }
        }
    }

    if (enclosures.length !== 0) {
        enclosures.reverse().map((name: string) => {
            message += `-> ${name} `;
            return;
        });
    }

    const textFormatted = text.replace(/'/g, "\\'").replace(/`/g, "\\`").replace(/"/g, '\\"');
    const semiColon = config.endSemiColon ? ';' : '';

    message += `-> ${textFormatted}${config.quotes}, ${text})${semiColon}`;
    return message;
}

export function getEnclosure(firstLine: number, document: vscode.TextDocument) {
    let openBrackets = 0;
    let closedBrackets = 0;
    let finishLine = -1;

    for (let currLine = firstLine; currLine < document.lineCount; currLine++) {
        const line = document.lineAt(currLine);

        if (checkForArgumentDeconstruction(line.text)) {
            openBrackets++;
        }

        if (Array.isArray(line.text.match(/{|\[/g))) {
            openBrackets++;
        }

        if (Array.isArray(line.text.match(/}|\]/g))) {
            closedBrackets++;
        }

        if (openBrackets === closedBrackets) {
            finishLine = currLine;
            break;
        }

    }

    return finishLine;
}

/**
 * 
 * @description Gets the line where de do { in a do/while loop is supposed to be
 */

export function getDoWhileStartLine(whileLine: number, document: vscode.TextDocument) {
    let openBrackets = 0;
    let closedBrackets = 0;
    let finishLine = -1;

    for (let currLine = whileLine; currLine > 1; currLine--) {
        const line = document.lineAt(currLine);

        if (Array.isArray(line.text.match(/{/g))) {
            openBrackets++;
        }

        if (Array.isArray(line.text.match(/}/g))) {
            closedBrackets++;
        }

        if (openBrackets === closedBrackets && openBrackets !== 0) {
            finishLine = currLine;
            break;
        }

    }

    return finishLine;
}