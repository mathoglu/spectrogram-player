import {spectrogram} from './modules/spectrogram.js';

const source = document.querySelector('audio');
const choices = document.getElementsByClassName('choice');
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const audioWorker = new Worker('lib/workers/audio-worker.js');
const scpr = ctx.createScriptProcessor(1024, 1, 1);
navigator.getUserMedia = (navigator.getUserMedia ||
							navigator.webkitGetUserMedia ||
							navigator.mozGetUserMedia ||
							navigator.msGetUserMedia);

const gn = ctx.createGain();
let s,
	duration,
	waitForWindow = ()=> {
		return new Promise((resolve)=> {
			for(let i = 0;i < choices.length; i++) {
				choices[i].onclick = (e)=> {
					e.target.parentNode.parentNode.removeChild(e.target.parentNode);
					resolve(e.target.id);
				}
			}
		});
	},
	waitForAudio = ()=> {
		return new Promise((resolve)=> {
			source.oncanplay = (e)=> {
				duration = e.target.duration;
				resolve()
			}
		});
	},
	waitForUserChoice = ()=> {
		return new Promise((resolve)=> {
			window.onload = resolve;
		});
	};

let connect = (type, theSource)=> {
	let src;
	if(type === 'audio') {
		src = ctx.createMediaElementSource(theSource);
	}
	else if (type === 'stream') {
		src = ctx.createMediaStreamSource(theSource);
	}

	src.connect(scpr);
	scpr.connect(gn);
	gn.connect(ctx.destination);


	audioWorker.onmessage = (e)=> {
		s.draw(e.data);
	};
};

//let dft2 = new DSP.DFT(512, 44100);
let initSpectrogram = ()=> {
	s = spectrogram({
		selector: '#graph',
		limits: {
			max: 20,
			min: 0
		},
		N: scpr.bufferSize/2,
		height: 500,
		fs: ctx.sampleRate,
		secondsPerFrame: (scpr.bufferSize / ctx.sampleRate),
		lengthInFrames: duration / (scpr.bufferSize / ctx.sampleRate),
		getBinFrequency: (i) => {
			let b = ctx.sampleRate / scpr.bufferSize; return b * i + b/2;
		}
	});
};

gn.value = 1;
scpr.onaudioprocess = (e)=> {
	let inputData = e.inputBuffer.getChannelData(0),
		outputData = e.outputBuffer.getChannelData(0);
	//dft2.forward(inputData);
	//outputData = dft2.spectrum;
	audioWorker.postMessage(inputData);
	//
	for (let i=0; i < inputData.length; i++) {
		outputData[i] = inputData[i];
	}
};

Promise.all([waitForUserChoice(), waitForAudio(), waitForWindow()])
	.then((choice)=>{
		if(choice[2] === 'load') {
			connect('audio', source);
			source.play();
		}
		else if (choice[2] === 'mic') {
			if (navigator.getUserMedia) {
				navigator.getUserMedia (
					{ audio: true },
					(stream)=> {
						connect('stream', stream);
					},
					(err)=> {
						console.log('The following gUM error occured: ' + err);
					}
				);
			} else {
				console.log('getUserMedia not supported on your browser!');
			}
		}

		initSpectrogram()
	}
);


