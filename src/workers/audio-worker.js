import {fft} from '../modules/fft.js';
import analyser from '../modules/analyser.js';
import {hann} from '../modules/windows.js'

let N = 1024,
	Fs = 44100,
	hop = 256,
	hannFunc = hann(N),
	{fftFunc} = fft({
		N: N,
		Fs: Fs,
		windowFunc: hannFunc
	}),
	analyserFunc = analyser({
		transformFunction: fftFunc,
		N: N,
		hopSize: hop
	});

self.onmessage = (e)=> {
	let output = analyserFunc(e.data);
	self.postMessage(output);
};
