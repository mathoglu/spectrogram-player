import { FC, useEffect, useRef } from "react";
import { scaleLinear } from "d3-scale";

type Props = {
    min: number;
    max: number;
    duration: number;
    sampleRate: number;
    binCount: number;
    fftSize: number;
    onProcess: () => Float32Array;
} & JSX.IntrinsicElements["div"];

export const Spectrogram: FC<Props> = ({
    min,
    max,
    duration,
    sampleRate,
    binCount,
    fftSize,
    onProcess,
    ...rest
}) => {
    const requestRef = useRef<number>();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const position = useRef(0);
    const { current: colorScale } = useRef(
        scaleLinear<string, number>()
            .range(["transparent", "red"])
            .domain([min, max]),
    );
    const { current: yScale } = useRef(
        scaleLinear().range([400, 0]).domain([0, binCount]),
    );

    const dataLength = (sampleRate * duration * 2.8) / fftSize;
    const pointWidth = 1000 / dataLength;
    const pointHeight = 400 / binCount;

    useEffect(() => {
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
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current || 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div {...rest}>
            <canvas
                className={css}
                width={1000}
                height={400}
                ref={canvasRef}
            ></canvas>
            <svg></svg>
        </div>
    );
};
