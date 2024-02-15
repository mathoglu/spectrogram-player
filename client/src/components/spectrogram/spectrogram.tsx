import { MutableRefObject, forwardRef, useEffect, useRef } from "react";
import { scaleLinear } from "d3-scale";
import css from "./spectrogram.module.scss";
import { interpolateHcl } from "d3-interpolate";
import type { SpectrogramSettings } from "../settings";

type Props = {
    min: number;
    max: number;
    isPlaying: boolean;
    isEnded: boolean;
    settings: SpectrogramSettings;
    onProcess: () => Float32Array;
} & JSX.IntrinsicElements["div"];

const frequencyToBinIndex = (
    frequency: number,
    sampleRate: number,
    windowSize: number,
) => Math.round((frequency * windowSize) / sampleRate);
const getDomainForColors = (
    colors: string[],
    min: number,
    max: number,
): number[] => {
    const step = (max - min) / (colors.length - 1);
    return colors.map((_c, i) => min + i * step);
};

const padding = { left: 10, right: 10 };
export const Spectrogram = forwardRef<HTMLCanvasElement, Props>(
    (
        { min, max, isPlaying, isEnded, settings, onProcess, ...rest },
        canvasRef,
    ) => {
        const graphWidth = 10000;
        const graphHeight = 600;
        const pointWidth = 1;
        const canvas = (canvasRef as MutableRefObject<HTMLCanvasElement | null>)
            .current;
        const requestRef = useRef<number>();
        const position = useRef(padding.left);
        const { current: colorScale } = useRef(
            scaleLinear<string, number>()
                .range(settings.colors)
                .domain(getDomainForColors(settings.colors, min, max))
                .interpolate(interpolateHcl),
        );
        const { current: yScale } = useRef(
            scaleLinear()
                .range([0, graphHeight])
                .domain([0, settings.binCount]),
        );

        useEffect(() => {
            const ctx = canvas?.getContext("2d");
            if (!ctx) return;
            const yMin = frequencyToBinIndex(
                settings.frequency.min,
                settings.sampleRate,
                settings.windowSize,
            );
            const yMax = frequencyToBinIndex(
                settings.frequency.max,
                settings.sampleRate,
                settings.windowSize,
            );
            const yScaling = graphHeight / (yScale(yMax) - yScale(yMin));
            const img = ctx.getImageData(0, 0, graphWidth, graphHeight);
            const yOffset = -(graphHeight - yScale(yMax));
            ctx.clearRect(0, 0, graphWidth, graphHeight);
            ctx.scale(1, yScaling);
            ctx.translate(0, yOffset);
            ctx.putImageData(img, 0, 0);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [
            settings.frequency.max,
            settings.frequency.min,
            settings.sampleRate,
            settings.windowSize,
            yScale,
        ]);

        useEffect(() => {
            const ctx = canvas?.getContext("2d");
            if (isEnded && canvas && ctx) {
                const img = ctx.getImageData(0, 0, graphWidth, graphHeight);
                canvas.width = position.current * pointWidth + padding.right;
                ctx.putImageData(img, 0, 0);
            }
        }, [canvas, isEnded]);

        useEffect(() => {
            const pointHeight = graphHeight / settings.binCount;
            const animate = () => {
                if (!requestRef.current || !canvas) return;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                const data = onProcess();
                data.forEach((value, y) => {
                    ctx.fillStyle = `${colorScale(value)}`;
                    ctx.fillRect(
                        position.current * pointWidth,
                        graphHeight - yScale(y),
                        pointWidth,
                        pointHeight,
                    );
                });
                position.current = position.current + 1;
                requestRef.current = requestAnimationFrame(animate);
            };
            if (isPlaying) {
                requestRef.current = requestAnimationFrame(animate);
            }
            return () => {
                cancelAnimationFrame(requestRef.current || 0);
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isPlaying]);

        return (
            <div
                className={css.container}
                style={{ width: 1000, height: graphHeight }}
                {...rest}
            >
                <canvas
                    className={css.canvas}
                    width={graphWidth}
                    height={graphHeight}
                    ref={canvasRef}
                />
            </div>
        );
    },
);
