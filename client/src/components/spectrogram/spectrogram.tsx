import { FC, useEffect, useRef } from "react";
import { scaleLinear } from "d3-scale";
import css from "./spectrogram.module.scss";

type Props = {
    min: number;
    max: number;
    binCount: number;
    isPlaying: boolean;
    onProcess: () => Float32Array;
} & JSX.IntrinsicElements["div"];

const areEqual = (a: Float32Array, b: Float32Array): boolean => {
    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

export const Spectrogram: FC<Props> = ({
    min,
    max,
    binCount,
    isPlaying,
    onProcess,
    ...rest
}) => {
    const graphWidth = 1000;
    const graphHeight = 600;
    const requestRef = useRef<number>();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const position = useRef(0);
    const { current: colorScale } = useRef(
        scaleLinear<string, number>()
            .range(["transparent", "red"])
            .domain([min, max]),
    );
    const { current: yScale } = useRef(
        scaleLinear().range([graphHeight, 0]).domain([0, binCount]),
    );

    useEffect(() => {
        const pointWidth = 1;
        const pointHeight = graphHeight / binCount;
        const animate = () => {
            if (!requestRef.current || !canvasRef.current) return;
            const ctx = canvasRef.current.getContext("2d");
            if (!ctx) return;
            const data = onProcess();
            data.forEach((value, i) => {
                ctx.fillStyle = `${colorScale(value)}`;
                ctx.fillRect(
                    position.current * pointWidth,
                    yScale(i),
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
            console.log(position.current);
            cancelAnimationFrame(requestRef.current || 0);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying]);

    return (
        <div
            className={css.container}
            style={{ width: graphWidth, height: graphHeight }}
            {...rest}
        >
            <canvas
                className={css.canvas}
                width={graphWidth}
                height={graphHeight}
                ref={canvasRef}
            />
            <svg width={graphWidth} height={graphHeight} className={css.svg} />
        </div>
    );
};
