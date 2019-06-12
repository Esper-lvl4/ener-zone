const callbackDecorator = (func, socket, context) => {
	let newFunc;
	if (context) {
		newFunc = (...args) => {
			func.apply(context, [socket, ...args]);
		}
	} else {
		newFunc = (...args) => {
			func(socket, ...args);
		}
	}
	return newFunc;
}
module.exports = callbackDecorator;
