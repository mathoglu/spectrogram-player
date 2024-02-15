import { FC, useEffect, useRef } from "react";
import css from "./timeline.module.scss";
import classNames from "classnames";

type Props = {
    duration: number;
    isPlaying: boolean;
    getTime: () => number;
} & JSX.IntrinsicElements["div"];

export const TimeLine: FC<Props> = ({
    isPlaying,
    duration,
    getTime,
    className,
    ...rest
}) => {
    const requestRef = useRef<number>();
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isPlaying) {
            const count = () => {
                if (!progressRef.current) return;
                progressRef.current.style.width = `${(getTime() * 100) / duration}%`;
                requestRef.current = requestAnimationFrame(count);
            };
            requestRef.current = requestAnimationFrame(count);
            return () => {
                cancelAnimationFrame(requestRef.current || 0);
            };
        }
    }, [isPlaying, getTime, duration]);

    return (
        <div className={classNames(className, css.container)} {...rest}>
            <div ref={progressRef} className={css.progress} />
        </div>
    );
};
