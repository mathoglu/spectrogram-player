import { useCallback, useEffect, useRef, useState } from "react";
import sineSweepUrl from "./assets/sample-file-4.wav";
import "./App.css";
import { Spectrogram } from "./components/spectrogram";

function App() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const { current: audioCtx } = useRef(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        new (window.AudioContext || window.webkitAudioContext)(),
    );
    const { current: analyser } = useRef(audioCtx.createAnalyser());
    const [isReady, setIsReady] = useState(false);
    const [isRender, setIsRender] = useState(false);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0;
        const el = audioRef.current;

        function onCanPlayHandler() {
            console.debug("Audio ready, duration", el?.duration);
            setDuration(el?.duration || 0);
            setIsReady(true);
        }
        el?.addEventListener("canplay", onCanPlayHandler);

        return () => {
            el?.removeEventListener("canplay", onCanPlayHandler);
        };
    }, [analyser]);

    const onProcess = useCallback(() => {
        const data = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(data);
        return data;
    }, [analyser]);

    const start = useCallback(() => {
        if (!audioRef.current || !isReady) return;
        const src = audioCtx.createMediaElementSource(audioRef.current);
        const gn = audioCtx.createGain();
        gn.gain.value = 1;

        src.connect(analyser).connect(gn).connect(audioCtx.destination);

        console.log("Playing audio", src.channelCount);
        audioRef.current.play();
        setIsRender(true);
    }, [analyser, audioCtx, isReady]);

    return (
        <>
            <audio ref={audioRef}>
                {/* <source src="assets/nimoy_spock.wav" type="audio/wav"> */}
                <source src={sineSweepUrl} type="audio/wav" />
                {/* <source src="assets/wav.wav" type="audio/wav">
            <source src="assets/nimoy_spock.m4a" type="audio/mp4">
            <source src="assets/mp3.mp3" type="audio/mp3">
            <source src="assets/country.mp3" type="audio/mp3"> */}
            </audio>
            <button onClick={start}>Start</button>
            {isReady && isRender && (
                <Spectrogram
                    onProcess={onProcess}
                    max={analyser.maxDecibels}
                    min={analyser.minDecibels}
                    fftSize={analyser.fftSize}
                    duration={duration}
                    sampleRate={audioCtx.sampleRate}
                    binCount={analyser.frequencyBinCount}
                />
            )}
        </>
    );
}

export default App;
