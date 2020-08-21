/**
 * 
 * @param {string} text The text of the line to search
 * @returns {boolean} Returns true or false if the text is a paremeter of a function
 * @description Check if the given is a function and if it has arguments
 * @author Giova
 */
export function checkIfArgumentOfFunc(text: string) {
    text.trim();

    // const functionRegExp = /(((?!function)(?!\s+[\w\d]+))|(?!const|let|var)([\w\d]+)\s+=\s+)(?:\(((,)?[\[|{|}|\]\s+\w+\d+])*\))(?:(\s*{|\s*=>))/g;
    const functionRegExp = /(\((\s?,?.\s?)+\)(\s*{|\s*=>))/g;
    return functionRegExp.test(text);
}

/**
 * 
 * @param {string} text The text of the line to search
 * @returns {string | boolean} The name of the class in that line or false if not class found
 * @description Search for a class declaration in the given text.
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
 * @param {string} text The text of the line to search
 * @returns {string | boolean} The name of the function in that line or false if not function found
 * @description Search for a function declaration in the given text. Can fetch constructor, arrow functions and normal functions
 * @author Giova
 */
export function getFunctionName(text: string) {
    text.trim();

    const functionRegExp = /((?!function )([\w\d]+)(?:\(.*\))\s*{)|((?!const |let |var )([\w\d]+)(?:\s*=\s*)(.*)(\s*=>\s*)({?))/g;
    const exec = functionRegExp.exec(text);

    if (exec) {
        // Case that the reg exp found a normal function
        if (exec[2] && exec[2] !== 'function') {
            return exec[2];
        }

        // Case that reg exp found an arrow function
        if (exec[4]) {
            return exec[4];
        }
    }

    return false;
}

/**
 * @param {string} text The text of the line to search
 * @returns {boolean} Returns true or false if the text is a deconstructin of an object
 * @author Giova
 */

export function checkForArgumentDeconstruction(text: string) {
    text.trim();

    const desconstrcutRegExp = /(?:{)(\s*(\s*\w+\s*,?)+\s*)(?:})/g;
    return desconstrcutRegExp.exec(text);
}

/**
 * @param {string} text The text of the line to search
 * @returns {boolean} Returns true if it found a array declaration or object declaration otherwise returns false
 * @author Giova
 */
export function checkObjectArrayDeclaration(text: string) {
    text.trim();

    const objectArrayDeclarationRegExp = /(?!(const|let|var))({?[\w\d]+}?\s*=\s*({|\[))/g;
    return objectArrayDeclarationRegExp.exec(text);
}

/**
 * @param {string} text The text of the line to search
 * @returns {boolean | string} Returns the type of the if it found a if statement or false if it not found any if
 * @author Giova
 */
export function checkIfDeclaration(text: string) {
    text.trim();

    const ifDeclarationRegExp = /(?:if\s*)((?:\().+(?:\)))\s*({?)/g;
    const exec = ifDeclarationRegExp.exec(text);

    if (exec) {
        if (!exec[2]) {
            return 'inline';
        }

        return 'normal';
    }

    return false;
}

/**
 * @param {string} text The text of the line to search
 * @returns {boolean | string} Returns the type of the function detected or false if no function find
 * @author Giova
 */
export function getFunctionType(text: string) {
    text.trim();

    const regExp = /((?!function )(?:[\w\d]+\(.*\))\s*{)|((?!const |let |var )(?![\w\d]+\s*=\s*)(.*)(\s*=>\s*)({?))/g;
    const exec = regExp.exec(text);


    if (exec) {
        if (exec[1]) {
            return 'normal';
        }

        if (!exec[5]) {
            return 'arrow-inline';
        }

        if (exec[4]) {
            return 'arrow';
        }
    }

    return false;
}

/**
 * @type {object}
 * @description The schema type for the configuration  
 * @author Giova
 */
export type Config = {
    quotes: string;
    endSemiColon: boolean;
    includeFileName: boolean;
    includeEnclosureFuncName: number;
    includeEnclosureClassName: number;
    includeLine: boolean;
    includeFullPath: boolean;
};