import { FC, useCallback, useEffect, useRef, useState } from "react";
import css from "./player.module.scss";
import { Spectrogram } from "../spectrogram";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import {
    PlayCircleFilled,
    PauseCircleFilled,
    VolumeUp,
    VolumeOff,
    Download,
    FiberManualRecord,
} from "@mui/icons-material";
import { Counter } from "../counter";
import { type SpectrogramSettings } from "../settings";
import type { Meta } from "../../App";
import { TimeLine } from "../timeline";
import classNames from "classnames";

type Props = {
    meta: Meta;
    source: AudioBufferSourceNode | MediaStreamAudioSourceNode;
    context: AudioContext;
};
const isStream = (src: Props["source"]): src is MediaStreamAudioSourceNode =>
    src instanceof MediaStreamAudioSourceNode;

export const Player: FC<Props> = ({
    meta,
    context: audioCtx,
    source: audioSource,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { current: gain } = useRef(audioCtx.createGain());
    const { current: analyser } = useRef(audioCtx.createAnalyser());
    const [started, setStarted] = useState(false);

    const [settings, setSettings] = useState<SpectrogramSettings>({
        type: "youtube",
        frequency: {
            min: 0,
            max: 20000,
        },
        colors: ["#000000", "#323232", "#FFAC41", "#FF1E56"],
        duration: 0,
        sampleRate: 0,
        windowSize: 0,
        binCount: 0,
    });
    const [isPlaying, setIsPlaying] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [volume, setVolume] = useState(100);

    useEffect(() => setStarted(true), []);

    useEffect(() => {
        gain.gain.value = volume / 100;
    }, [gain, volume]);

    useEffect(() => {
        function sourceEnded() {
            audioCtx.suspend();
            setIsEnded(true);
            setIsPlaying(false);
        }
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0;

        if (isStream(audioSource)) {
            audioSource
                .connect(analyser)
                .connect(gain)
                .connect(audioCtx.destination);

            setVolume(0);
            setSettings(current => ({
                ...current,
                type: "microphone",
                duration: null,
                binCount: analyser.frequencyBinCount,
                windowSize: analyser.fftSize,
                sampleRate: audioCtx.sampleRate,
                frequency: {
                    min: 0,
                    max: audioCtx.sampleRate / 2,
                },
            }));
        } else {
            audioSource
                .connect(analyser)
                .connect(gain)
                .connect(audioCtx.destination);
            audioSource.start();
            audioCtx.suspend();

            setSettings(current => ({
                ...current,
                duration: audioSource.buffer?.duration || 0,
                binCount: analyser.frequencyBinCount,
                windowSize: analyser.fftSize,
                sampleRate: audioCtx.sampleRate,
                frequency: {
                    min: 0,
                    max: audioCtx.sampleRate / 2,
                },
            }));

            audioSource.addEventListener("ended", sourceEnded);
            return () => {
                audioSource.removeEventListener("ended", sourceEnded);
            };
        }
    }, [analyser, gain, audioCtx, audioSource]);

    const onProcess = useCallback(() => {
        const data = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(data);
        return data;
    }, [analyser]);

    const onDownload = useCallback(() => {
        if (!canvasRef.current || !meta) return;
        const height = canvasRef.current.height;
        const currentWidth = parseInt(
            canvasRef.current.getAttribute("data-current-position") || "0",
            10,
        );
        const img = canvasRef.current
            .getContext("2d")
            ?.getImageData(0, 0, currentWidth, height);
        if (!img) return;

        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = currentWidth;
        tmpCanvas.height = height;
        tmpCanvas.getContext("2d")?.putImageData(img, 0, 0);

        const canvasUrl = tmpCanvas.toDataURL("image/png", 1);
        const createEl = document.createElement("a");
        createEl.href = canvasUrl;
        createEl.download = `Spectrogram-${meta.title}`;
        createEl.click();
        createEl.remove();
    }, [meta]);

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
        <div
            className={classNames(css.container, {
                [css.ready]: started,
            })}
        >
            {meta && <div className={css.info}>{meta.title}</div>}
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
                {settings.duration !== null && (
                    <div className={css.timeline}>
                        <TimeLine
                            isPlaying={isPlaying}
                            getTime={() => audioCtx.currentTime}
                            duration={settings.duration}
                        />
                    </div>
                )}
                <div className={css.left}>
                    {settings.type === "microphone" ? (
                        <Button
                            onClick={isPlaying ? onPause : onStart}
                            title={isPlaying ? "Record" : "Stop"}
                            color="secondary"
                            startIcon={
                                isPlaying ? (
                                    <span className={css.squareIcon} />
                                ) : (
                                    <FiberManualRecord />
                                )
                            }
                        >
                            {isPlaying ? "Stop" : "Rec"}
                        </Button>
                    ) : (
                        <IconButton
                            disabled={isEnded}
                            onClick={isPlaying ? onPause : onStart}
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <PauseCircleFilled />
                            ) : (
                                <PlayCircleFilled />
                            )}
                        </IconButton>
                    )}

                    {settings.type !== "microphone" && (
                        <div
                            className={classNames(css.volumeButton, {
                                [css.disabled]: isEnded,
                            })}
                        >
                            <IconButton
                                disabled={isEnded}
                                title="Volume"
                                onClick={() => {
                                    if (volume === 0) {
                                        setVolume(60);
                                    } else {
                                        setVolume(0);
                                    }
                                }}
                            >
                                {volume === 0 ? <VolumeOff /> : <VolumeUp />}
                            </IconButton>
                        </div>
                    )}
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
                    {/* TODO */}
                    {/* <Settings
                                className={css.settings}
                                onSave={newSettings => {
                                    setSettings(current => ({
                                        ...current,
                                        ...newSettings,
                                    }));
                                }}
                                settings={settings}
                            /> */}
                    <IconButton
                        title="Export as .png"
                        disabled={isPlaying}
                        onClick={onDownload}
                    >
                        <Download />
                    </IconButton>
                </div>
            </div>
        </div>
    );
};
