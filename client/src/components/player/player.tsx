import { FC, useCallback, useEffect, useRef, useState } from "react";
// import sineSweepUrl from "../../assets/sample-file-4.wav";
import css from "./player.module.scss";
import { Spectrogram } from "../spectrogram";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import Button from "@mui/material/Button";
import {
    PlayCircleFilled,
    PauseCircleFilled,
    VolumeUp,
    RestartAlt,
} from "@mui/icons-material";
import { Counter } from "../counter/counter";

export const Player: FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { current: audioCtx } = useRef(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        new (window.AudioContext || window.webkitAudioContext)(),
    );
    const audioSource = useRef<AudioBufferSourceNode>(null);
    const { current: gain } = useRef(audioCtx.createGain());
    const { current: analyser } = useRef(audioCtx.createAnalyser());
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [duration, setDuration] = useState(0);
    const [iteration, setIteration] = useState(0);
    const [videoData, setVideoData] = useState<{
        url: string;
        title: string;
    } | null>(null);

    useEffect(() => {
        function sourceEnded() {
            audioCtx.suspend();
            setIsEnded(true);
            setIsPlaying(false);
        }
        const src = audioSource.current;
        if (isReady && src) {
            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0;

            if (!src || !src.buffer) return;
            gain.gain.value = 1;
            setDuration(src.buffer?.duration);

            src.connect(analyser).connect(gain).connect(audioCtx.destination);
            src.start();
            audioCtx.suspend();

            console.log(
                (src.buffer?.duration * audioCtx.sampleRate) / analyser.fftSize,
            );
            src.addEventListener("ended", sourceEnded);
            return () => {
                src.removeEventListener("ended", sourceEnded);
            };
        }
    }, [analyser, gain, audioCtx, isReady, audioSource]);

    const onProcess = useCallback(() => {
        const data = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(data);
        return data;
    }, [analyser]);

    const onLoadAudio = useCallback(
        async (url: string) => {
            if (!url) return;
            const audio = await fetch("http://localhost:3333/audio", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            audioSource.current = audioCtx.createBufferSource();
            audioSource.current.buffer = await audioCtx.decodeAudioData(
                await audio.arrayBuffer(),
            );
            setIsReady(true);
        },
        [audioCtx, audioSource],
    );

    const onLoadInfo = useCallback(async (url: string) => {
        const info = await fetch("http://localhost:3333/info", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
        });
        const { title } = await (info.json() as Promise<{ title: string }>);
        setVideoData({ title, url });
    }, []);

    const onStart = useCallback(() => {
        audioCtx.resume();
        setIsEnded(false);
        setIsPlaying(true);
    }, [audioCtx]);

    const onPause = useCallback(() => {
        audioCtx.suspend();
        setIsPlaying(false);
    }, [audioCtx]);

    const onRestart = useCallback(() => {
        if (!audioSource || !videoData) return;
        setIteration(i => i + 1);
        setIsEnded(false);
        onLoadAudio(videoData?.url);
    }, [onLoadAudio, videoData]);

    const onVolumeChange = useCallback(
        (value: number) => {
            gain.gain.value = value / 100;
        },
        [gain],
    );

    return (
        <>
            <div className={css.container}>
                {!isReady ? (
                    <div className={css.inputContainer}>
                        <Input
                            inputRef={inputRef}
                            placeholder="Add youtube URL here"
                            value="https://www.youtube.com/watch?v=DX_DvgB0_R4"
                        />
                        <Button
                            onClick={() => {
                                onLoadAudio(inputRef.current?.value || "");
                                onLoadInfo(inputRef.current?.value || "");
                            }}
                        >
                            Generate
                        </Button>
                    </div>
                ) : (
                    <>
                        {videoData && (
                            <div className={css.info}>{videoData.title}</div>
                        )}
                        {isReady && (
                            <Spectrogram
                                key={iteration}
                                onProcess={onProcess}
                                max={analyser.maxDecibels}
                                min={analyser.minDecibels}
                                binCount={analyser.frequencyBinCount}
                                isPlaying={isPlaying}
                            />
                        )}
                        <div className={css.controlBar}>
                            {!isEnded ? (
                                <IconButton
                                    onClick={isPlaying ? onPause : onStart}
                                >
                                    {isPlaying ? (
                                        <PauseCircleFilled />
                                    ) : (
                                        <PlayCircleFilled />
                                    )}
                                </IconButton>
                            ) : (
                                <IconButton onClick={onRestart}>
                                    <RestartAlt />
                                </IconButton>
                            )}
                            <div className={css.volumeButton}>
                                <IconButton>
                                    <VolumeUp />
                                </IconButton>
                            </div>
                            <div className={css.volumeControl}>
                                <div className={css.sliderContainer}>
                                    <Slider
                                        className={css.volumeInput}
                                        min={0}
                                        step={1}
                                        max={100}
                                        size="small"
                                        onChangeCommitted={(e, value) =>
                                            onVolumeChange(value as number)
                                        }
                                    />
                                </div>
                            </div>
                            <Counter
                                duration={duration}
                                isPlaying={isPlaying}
                                className={css.counter}
                                getTime={() => audioCtx.currentTime}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
};
