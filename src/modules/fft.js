import validate from './validation.js';
import {splitEvenOdd, complex, trigonometric} from './utils.js';

let bandWidth,
	freqForBin = (nr)=> {
		return bandWidth * nr + bandWidth / 2
	};

let fft = (opts)=> {

	if (!validate.options(opts, {})) {
		return null;
	}

	let sin = trigonometric.sin,
		cos = trigonometric.cos;

	let fftFunc = (input)=> {
		let N = input.length;

		if(N == 1) {
			return [{r: input[0], i: 0}];
		}
		else {
			let {even, odd} = splitEvenOdd(input),
				inputEven = fftFunc(even),
				inputOdd = fftFunc(odd),
				output = [],
				t,
				e;

			for (let i = 0; i < N / 2; i++) {
				t = inputEven[i];
				e = complex.multiply({r: cos(i, N), i: sin(i, N)}, inputOdd[i]);

				output[i] = complex.add(t, e);
				output[i + (N / 2)] = complex.subtract(t, e);
			}
			return output;
		}

	};

	return {fftFunc, freqForBin}
};

export default {fft}