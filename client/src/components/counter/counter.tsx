import { FC, useEffect, useRef, useState } from "react";
import css from "./counter.module.scss";
import classNames from "classnames";

type Props = {
    duration: number | null;
    isPlaying: boolean;
    getTime: () => number;
} & JSX.IntrinsicElements["div"];

const padded = (s: number) => (s < 10 ? `0${s}` : s);
const formatTime = (s: number) => {
    const minutes = s > 59 ? Math.floor(s / 60) : 0;
    const seconds = Math.floor(s) - minutes * 60;
    return `${minutes}:${padded(seconds)}`;
};

export const Counter: FC<Props> = ({
    isPlaying,
    duration,
    getTime,
    className,
    ...rest
}) => {
    const requestRef = useRef<number>();
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        if (isPlaying) {
            const count = () => {
                setCounter(current =>
                    current < Math.trunc(getTime()) ? current + 1 : current,
                );
                requestRef.current = requestAnimationFrame(count);
            };
            requestRef.current = requestAnimationFrame(count);
            return () => {
                cancelAnimationFrame(requestRef.current || 0);
            };
        }
    }, [isPlaying, getTime]);

    return (
        <div className={classNames(className, css.container)} {...rest}>
            <span>{formatTime(counter)}</span>
            {duration !== null && (
                <>
                    <span>/</span>
                    <span>{formatTime(duration)}</span>
                </>
            )}
        </div>
    );
};
