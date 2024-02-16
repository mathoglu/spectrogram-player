import { FC, useCallback, useRef, useState } from "react";
import css from "./settings.module.scss";
import classNames from "classnames";
import { Settings as SettingsIcon } from "@mui/icons-material";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";

export type SpectrogramSettings = {
    type: "stream" | "buffer";
    frequency: {
        min: number;
        max: number;
    };
    duration: number | null;
    binCount: number;
    sampleRate: number;
    windowSize: number;
    colors: string[];
};
type Props = {
    settings: SpectrogramSettings;
    onSave: (settings: SpectrogramSettings) => void;
} & JSX.IntrinsicElements["div"];

export const Settings: FC<Props> = ({
    settings,
    onSave,
    className,
    ...rest
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [min, setMin] = useState(`${settings.frequency.min}`);
    const [max, setMax] = useState(`${settings.frequency.max}`);

    const save = useCallback(() => {
        onSave({
            ...settings,
            frequency: {
                min: parseInt(min, 10),
                max: parseInt(max, 10),
            },
        });
    }, [max, min, onSave, settings]);

    return (
        <div
            ref={ref}
            className={classNames(className, css.container)}
            {...rest}
        >
            <IconButton onClick={() => setOpen(!open)}>
                <SettingsIcon />
            </IconButton>
            <Popover
                open={open}
                anchorEl={ref.current}
                onClose={() => setOpen(false)}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
            >
                <div className={css.popover}>
                    <TextField
                        id="min-freq"
                        label="Min frequency"
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={min}
                        onBlur={save}
                        onChange={e => setMin(e.target.value)}
                        variant="standard"
                    />
                    <TextField
                        id="max-freq"
                        label="Max frequency"
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={max}
                        onBlur={save}
                        onChange={e => setMax(e.target.value)}
                        variant="standard"
                    />
                </div>
            </Popover>
        </div>
    );
};
