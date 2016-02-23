exports.log = function(text){
	console.log('\x1b[36m', text ,'\x1b[0m');
};

exports.error = function(text){
	console.log('\x1b[31m', text ,'\x1b[0m');
};