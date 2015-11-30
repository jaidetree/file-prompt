/**
 * Bind Methods
 * Binds all given methods to the provided context
 *
 * @param {object} context - Class instance or target context object
 * @param {...string} methods - List of mthods to bind to the context
 */
export default function bindMethods (context, ...methods) {
  methods.forEach((methodName) => {
    context[methodName] = context[methodName].bind(context);
  });
}
