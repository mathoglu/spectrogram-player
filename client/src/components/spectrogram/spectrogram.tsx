import {
    MutableRefObject,
    MouseEvent,
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { scaleLinear } from "d3-scale";
import css from "./spectrogram.module.scss";
import { interpolateHcl } from "d3-interpolate";
import type { SpectrogramSettings } from "../settings";
import classNames from "classnames";

type Props = {
    min: number;
    max: number;
    isPlaying: boolean;
    isEnded: boolean;
    settings: SpectrogramSettings;
    onProcess: () => Float32Array;
} & JSX.IntrinsicElements["div"];

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
        const containerWidth = 1000;
        const containerHeight = 600;
        const [graphWidth] = useState(10000);
        const [graphHeight] = useState(settings.binCount);
        const pointWidth = 1;
        const canvas = (canvasRef as MutableRefObject<HTMLCanvasElement | null>)
            .current;
        const containerRef = useRef<HTMLDivElement>(null);
        const requestRef = useRef<number>();
        const position = useRef(padding.left);
        const { current: colorScale } = useRef(
            scaleLinear<string, number>()
                .range(settings.colors)
                .domain(getDomainForColors(settings.colors, min, max))
                .interpolate(interpolateHcl),
        );
        const yScale = useRef(
            scaleLinear()
                .range([0, graphHeight])
                .domain([0, settings.binCount]),
        );
        const [scale, setScale] = useState(1);

        const drawColumn = useCallback(
            (data: Float32Array, x: number) => {
                const ctx = canvas?.getContext("2d");
                if (!ctx) return;
                const scale = yScale.current;
                const [, maxHeight] = scale.range();
                const pointHeight = 1;
                data.forEach((value, y) => {
                    ctx.fillStyle = `${colorScale(value)}`;
                    ctx.fillRect(
                        x,
                        maxHeight - scale(y),
                        pointWidth,
                        pointHeight,
                    );
                });
            },
            [canvas, colorScale],
        );

        const onZoom = useCallback(
            (e: MouseEvent<HTMLCanvasElement>) => {
                if (!canvas || !containerRef.current) return;
                const rect = canvas.getBoundingClientRect();
                if (scale <= 1) {
                    setScale(2);
                } else {
                    setScale(0.5);
                }
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                containerRef.current.scrollTo(x, y);
            },
            [canvas, scale],
        );

        useEffect(() => {
            const ctx = canvas?.getContext("2d");
            if (!ctx || !canvas) return;

            const img = new Image();
            img.onload = () => {
                canvas.height = canvas.height * scale;
                canvas.width = canvas.width * scale;
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0);
            };
            img.src = canvas?.toDataURL();
        }, [canvas, graphHeight, scale]);

        useEffect(() => {
            if (containerRef.current) {
                containerRef.current.scrollLeft = 0;
                containerRef.current.scrollTop = graphHeight;
            }
        }, [graphHeight]);

        useEffect(() => {
            const ctx = canvas?.getContext("2d");
            if (isEnded && canvas && ctx) {
                const img = ctx.getImageData(0, 0, graphWidth, graphHeight);
                canvas.width = position.current * pointWidth + padding.right;
                ctx.putImageData(img, 0, 0);
            }
        }, [canvas, graphHeight, graphWidth, isEnded]);

        useEffect(() => {
            const draw = () => {
                if (!requestRef.current || !canvas) return;
                const data = onProcess();
                const pos = position.current * pointWidth;
                drawColumn(data, pos);
                if (pos > containerWidth && containerRef.current) {
                    containerRef.current.scrollLeft = pos - containerWidth;
                }
                position.current = position.current + 1;
                canvas.setAttribute(
                    "data-current-position",
                    `${position.current}`,
                );
                requestRef.current = requestAnimationFrame(draw);
            };

            if (isPlaying) {
                requestRef.current = requestAnimationFrame(draw);
            }
            return () => {
                cancelAnimationFrame(requestRef.current || 0);
            };
        }, [
            isPlaying,
            settings.binCount,
            yScale,
            canvas,
            colorScale,
            onProcess,
            drawColumn,
        ]);

        return (
            <div
                ref={containerRef}
                className={css.container}
                style={{ width: containerWidth, height: containerHeight }}
                {...rest}
            >
                <canvas
                    onClick={onZoom}
                    className={classNames(css.canvas, {
                        [css.zoomed]: scale > 1,
                        [css.playing]: isPlaying,
                    })}
                    width={graphWidth}
                    height={graphHeight}
                    ref={canvasRef}
                />
            </div>
        );
    },
);
