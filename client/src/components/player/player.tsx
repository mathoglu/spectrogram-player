import { FC, useCallback, useEffect, useRef, useState } from "react";
// import sineSweepUrl from "../../assets/sample-file-4.wav";
import css from "./player.module.scss";
import { Spectrogram } from "../spectrogram";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";

import {
    PlayCircleFilled,
    PauseCircleFilled,
    VolumeUp,
    VolumeOff,
    Download,
} from "@mui/icons-material";
import { Counter } from "../counter";
import { Settings, type SpectrogramSettings } from "../settings";
import type { VideoMeta } from "../../App";
import { TimeLine } from "../timeline";
import classNames from "classnames";

type Props = {
    audioBufferData: ArrayBuffer;
    videoMeta: VideoMeta;
};
export const Player: FC<Props> = ({ audioBufferData, videoMeta }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { current: audioCtx } = useRef(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        new (window.AudioContext || window.webkitAudioContext)(),
    );
    const audioSource = useRef<AudioBufferSourceNode>(null);
    const { current: gain } = useRef(audioCtx.createGain());
    const { current: analyser } = useRef(audioCtx.createAnalyser());

    const [settings, setSettings] = useState<SpectrogramSettings>({
        frequency: {
            min: 0,
            max: 24000,
        },
        colors: ["#000000", "#323232", "#FFAC41", "#FF1E56"],
        duration: 0,
        sampleRate: 0,
        windowSize: 0,
        binCount: 0,
    });
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [volume, setVolume] = useState(100);

    useEffect(() => {
        async function initBuffer() {
            if (!isReady) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                audioSource.current = audioCtx.createBufferSource();
                audioSource.current.buffer =
                    await audioCtx.decodeAudioData(audioBufferData);
                setIsReady(true);
            }
        }

        initBuffer();
    }, [audioBufferData, audioCtx, isReady]);

    useEffect(() => {
        gain.gain.value = volume / 100;
    }, [gain, volume]);

    useEffect(() => {
        function sourceEnded() {
            audioCtx.suspend();
            setIsEnded(true);
            setIsPlaying(false);
        }
        const src = audioSource.current;
        if (isReady && src) {
            analyser.fftSize = 2048;

            if (!src || !src.buffer) return;

            src.connect(analyser).connect(gain).connect(audioCtx.destination);
            src.start();
            audioCtx.suspend();

            setSettings(current => ({
                ...current,
                duration: src.buffer?.duration || 0,
                binCount: analyser.frequencyBinCount,
                windowSize: analyser.fftSize,
                sampleRate: audioCtx.sampleRate,
                frequency: {
                    min: 0,
                    max: audioCtx.sampleRate / 2,
                },
            }));

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

    const onDownload = useCallback(() => {
        if (!canvasRef.current || !videoMeta) return;
        const canvasUrl = canvasRef.current.toDataURL("image/png", 1);
        const createEl = document.createElement("a");
        createEl.href = canvasUrl;
        createEl.download = `Spectrogram-${videoMeta.title}`;
        createEl.click();
        createEl.remove();
    }, [videoMeta]);

    const onStart = useCallback(() => {
        audioCtx.resume();
        setIsEnded(false);
        setIsPlaying(true);
    }, [audioCtx]);

    const onPause = useCallback(() => {
        audioCtx.suspend();
        setIsPlaying(false);
    }, [audioCtx]);

    return (
        isReady && (
            <div
                className={classNames(css.container, {
                    [css.isPlaying]: isPlaying || isEnded,
                })}
            >
                {videoMeta && <div className={css.info}>{videoMeta.title}</div>}
                {settings.sampleRate !== 0 &&
                    settings.windowSize !== 0 &&
                    settings.binCount !== 0 && (
                        <Spectrogram
                            ref={canvasRef}
                            onProcess={onProcess}
                            max={analyser.maxDecibels}
                            min={analyser.minDecibels}
                            isPlaying={isPlaying}
                            isEnded={isEnded}
                            settings={settings}
                        />
                    )}
                <div className={css.controlBar}>
                    <div className={css.timeline}>
                        <TimeLine
                            isPlaying={isPlaying}
                            getTime={() => audioCtx.currentTime}
                            duration={settings.duration}
                        />
                    </div>
                    <div className={css.left}>
                        <IconButton
                            disabled={isEnded}
                            onClick={isPlaying ? onPause : onStart}
                        >
                            {isPlaying ? (
                                <PauseCircleFilled />
                            ) : (
                                <PlayCircleFilled />
                            )}
                        </IconButton>

                        <div className={css.volumeButton}>
                            <IconButton disabled={isEnded}>
                                {volume === 0 ? (
                                    <VolumeOff onClick={() => setVolume(60)} />
                                ) : (
                                    <VolumeUp onClick={() => setVolume(0)} />
                                )}
                            </IconButton>
                        </div>
                        <div className={css.volumeControl}>
                            <div className={css.sliderContainer}>
                                <Slider
                                    className={css.volumeInput}
                                    value={volume}
                                    min={0}
                                    step={1}
                                    max={100}
                                    size="small"
                                    onChange={(_e, value) =>
                                        setVolume(value as number)
                                    }
                                />
                            </div>
                        </div>
                        <Counter
                            duration={settings.duration}
                            isPlaying={isPlaying}
                            className={css.counter}
                            getTime={() => audioCtx.currentTime}
                        />
                    </div>
                    <div className={css.right}>
                        <Settings
                            className={css.settings}
                            onSave={newSettings => {
                                setSettings(current => ({
                                    ...current,
                                    ...newSettings,
                                }));
                            }}
                            settings={settings}
                        />
                        <IconButton disabled={isPlaying} onClick={onDownload}>
                            <Download />
                        </IconButton>
                    </div>
                </div>
            </div>
        )
    );
};
