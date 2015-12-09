let analyser = (opts)=> {

	let bufferStore,
		start = 0,
		N = opts.N;

	const hopSize = opts.hopSize,
		tFunc = opts.transformFunction;

	return (input)=> {
		// first run
		if(typeof bufferStore === 'undefined') {
			// Initialize as max size
			bufferStore = new Float32Array(N + hopSize);

			// set to only contain what is needed to next iteration
			bufferStore.set(input.subarray(N - hopSize, N), 0);

			return tFunc(input);
		}
		// Concat input with buffer store
		bufferStore.set(input, hopSize);

		// Slice out what is needed for this analysis iteration
		let data = bufferStore.subarray(start, opts.N);

		// Remove used data
		bufferStore.set(bufferStore.subarray(N - hopSize, bufferStore.length), 0);

		return tFunc(data);
	};
};

export default analyser;