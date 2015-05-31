let format = require('./format');

module.exports = {
    get implementSetValue() {
        return format(`If you see this message and you are not
            a developer adding a new option, please open an issue here:
            https://github.com/csscomb/core/issues/new\n
            For option to accept values of type "${valueType}"
            you need to implement custom \`setValue()\` method.`);
    },

    get missingName() {
        return 'Plugin must have a valid \`name\` property.';
    },

    get missingSetValue() {
        return format(`Plugin must either implemet \`setValue()\` method
            or provide \`accepts\` object with acceptable values.`);
    },

    get missingSyntax() {
        return 'Plugin must list supported syntaxes.';
    },

    get twoPluginsWithSameName() {
        return format(`You're trying to use one plugin twice:
            ${pluginName}. Please make sure there are not two different
            plugins with the same name.`);
    },

    get unacceptableBoolean() {
        return `Value must be one of the following: ${pattern.join(', ')}.`;
    },

    get unacceptableNumber() {
        return 'Value must be an integer.';
    },

    get unacceptableString() {
        return `Value must match pattern ${pattern}.`;
    },

    get unacceptableValueType() {
        return format(`The option does not accept values of type
            ${valueType}.\nValue\'s type must be one the following:
            ${Object.keys(this.accepts).join(', ')}.`);
    }
};
