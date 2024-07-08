import globals from "globals";

export default [{
    languageOptions: {
        globals: {
            ...globals.commonjs,
            ...globals.node,
        },

        ecmaVersion: "latest",
        sourceType: "module",
    },

    rules: {},
}];