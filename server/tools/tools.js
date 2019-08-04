function showError(msg, socket) {
	if (socket) {
		socket.emit('errorMessage', msg);
	}
	throw new Error(msg);
}

// function for cloning objects.
function cloneObject(obj) {
	var clone = {};
	for (var i in obj) {
		if (obj[i] != null && typeof(obj[i]) == 'object' && obj[i].forEach) {
			clone[i] = cloneArray(obj[i]);
		} else if (obj[i] != null && typeof(obj[i]) == 'object') {
			clone[i] = cloneObject(obj[i]);
		} else {
			clone[i] = obj[i];
		}
	}
	return clone;
}

// function for cloning arrays.
function cloneArray(arr) {
	var clone = [];
	for (var a in arr) {
		if (arr[a] != null && typeof(arr[a]) == 'object' && arr[a].forEach) {
			clone.push(cloneArray(arr[a]));
		} else if (arr[a] != null && typeof(arr[a]) == 'object') {
			clone.push(cloneObject(arr[a]));
		} else {
			clone.push(arr[a]);
		}
	}
	return clone;
}

module.exports = {
	showError,
	cloneObject,
	cloneArray
}
