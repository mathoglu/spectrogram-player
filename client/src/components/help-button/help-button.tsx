import { FC, useRef, useState } from "react";
import css from "./help-button.module.scss";
import classNames from "classnames";
import { HelpOutline } from "@mui/icons-material";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";

type Props = { isMicAvailable: boolean } & JSX.IntrinsicElements["div"];

export const HelpButton: FC<Props> = ({
    isMicAvailable,
    className,
    ...rest
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    return (
        <div
            ref={ref}
            className={classNames(className, css.container)}
            {...rest}
        >
            <IconButton onClick={() => setOpen(!open)}>
                <HelpOutline />
            </IconButton>
            <Popover
                open={open}
                anchorEl={ref.current}
                onClose={() => setOpen(false)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
            >
                <div className={css.popover}>
                    This is a simple tool for generating a{" "}
                    <Link
                        underline="hover"
                        href="https://en.wikipedia.org/wiki/Spectrogram"
                        target="_blank"
                    >
                        spectrogram
                    </Link>{" "}
                    from the audio from a YouTube video
                    {isMicAvailable && " or by using your computer microphone"}.
                    Add a link to any YouTube video in the input below
                    {isMicAvailable ? " or click the microphone " : " "}to get
                    started.
                </div>
            </Popover>
        </div>
    );
};
