import {fft} from '../modules/fft.js';
import analyser from '../modules/analyser.js';

let {fftFunc} = fft({
		N: 1024,
		Fs: 44100
	}),
	analyserFunc = analyser({
		transformFunction: fftFunc,
		N: 1024,
		hopSize: 256
	});

self.onmessage = (e)=> {
	let output = analyserFunc(e.data);
	self.postMessage(output);
};
