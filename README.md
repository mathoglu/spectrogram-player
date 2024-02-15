# Spectrogram player

This is a small app for generating a simple [spectrogram](https://en.wikipedia.org/wiki/Spectrogram) from the audio extracted from a Youtube video. It uses the Web Audio API to perform the [Fast Fourier Transform](https://en.wikipedia.org/wiki/Fast_Fourier_transform) and other native browser APIs to render it to a canvas continuously.

Please try it out [here](http://spectrogram.mathoglu.com).

## Setup locally

To run the app in production mode, run the following:

```bash
npm install
npm run build
npm start
```

For running in development, see [how to setup server](./server/README.md) and [how to setup client](./client/README.md) respectively to get going.
