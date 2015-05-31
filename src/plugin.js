let Errors = require('./errors');

let Plugin = function(methods) {
    for (let method in methods) {
        this[method] = typeof method === 'function'?
            methods[method].bind(this) : methods[method];
    }

    this.validate();
};

Plugin.prototype = {
    /**
     * Plugin's name.
     * @type {String}
     */
    name: null,

    /**
     * List of supported syntaxes.
     * @type {Array}
     */
    syntax: null,

    /**
     * @type {Object}
     */
    accepts: null,

    /**
     * @type {Function}
     */
    process: null,

    /**
     * @type {Function}
     */
    lint: null,

    value_: null,
    get value() {
        return this.value_;
    },
    set value(value) {
        let valueType = typeof value;
        let pattern = this.accepts && this.accepts[valueType];

        if (this.setValue)
            return this.value_ = this.setValue(value);

        if (!pattern)
            throw new Error(Errors.unacceptableValueType);

        if (valueType === 'boolean') {
            if (pattern.indexOf(value) < 0)
                throw new Error(Errors.unacceptableBoolean);
            return this.value_ = value;
        }

        if (valueType === 'number') {
            if (value !== parseInt(value))
                throw new Error(Errors.unacceptableNumber);
            return this.value_ = new Array(value + 1).join(' ');
        }

        if (valueType = 'string') {
            if (!value.match(pattern))
                throw new Error(Errors.unacceptableString);
            return this.value_ = value;
        }

        throw new Error(Errors.implementSetValue);
    },

    validate() {
        if (typeof this.name !== 'string' || !this.name)
            throw new Error(Errors.missingName);

        if (!Array.isArray(this.syntax) || this.syntax.length === 0)
            throw new Error(Errors.missingSyntax);

        if (typeof this.accepts !== 'object' &&
            typeof this.setValue !== 'function')
            throw new Error(Errors.missingSetValue);
    }
};

module.exports = Plugin;
