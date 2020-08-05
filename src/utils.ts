/**
 * 
 * @param {string} text The text to search  
 * @returns {boolean} Returns true or false if the text is a paremeter of a function
 */
export function checkIfArgumentOfFunc(text: string) {
    text.trim();

    const functionRegExp = /((?:function\s+[\w\d]+)|(?:(const|let|var)\s+[\w\d]+ = ))(\(((,)?[\s+\w+\d+])+\))/g;
    return functionRegExp.test(text);
}

/**
 * 
 * @param text The text of the line to search
 * @returns {string | boolean} The name of the class in that line or false if not class found
 * @author Giova
 */
export function classDeclaration(text: string) {
    text.trim();

    const classRegExp = /(?:class)\s+([\w+\d+]+)/g;
    const result = classRegExp.exec(text);
    if (result) {
        return result[1];
    }

    return false;
}

/**
 * 
 * @param text The text of the line to search
 * @returns {string | boolean} The name of the function in that line or false if not function found
 * @author Giova
 */
export function functionDeclaration(text: string) {
    text.trim();

    const functionRegExp = /(((?!function\s+)([\w\d]+))|(?!const|let|var)([\w\d]+)\s+=\s+)(?:\(((,)?[\s+\w+\d+])*\))(?:(\s+{|\s+=> {))/g;
    const exec = functionRegExp.exec(text);

    if (exec) {
        // Case that the reg exp found a normal function
        if (exec[3]) {
            return exec[3];
        }

        // Case that reg exp found an arrow function
        if (exec[4]) {
            return exec[4];
        }
    }

    return false;
}

/**
 * @type {object}
 * @description The schema type for the configuration  
 */
export type Config = {
    singleQuotes: boolean;
    endSemiColon: boolean;
    includeFileName: boolean;
    includeEnclosureFuncName: number;
    includeEnclosureClassName: number;
};