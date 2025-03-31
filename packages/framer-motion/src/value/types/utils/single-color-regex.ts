export const singleColorRegex =
    /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|color\(display-p3\s+(?:-?[\d.]+\s+){2}-?[\d.]+\s*(?:\/\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?\))$/iu
