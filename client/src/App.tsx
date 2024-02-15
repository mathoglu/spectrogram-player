import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Player } from "./components/player";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import { useCallback, useRef, useState } from "react";
import css from "./App.module.scss";
import { GitHub, HelpOutline, PlayArrowSharp } from "@mui/icons-material";
import { CircularProgress, FormControl, FormHelperText } from "@mui/material";
import { HelpButton } from "./components/help-button";

export type VideoMeta = {
    url: string;
    title: string;
};

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#FFAC41",
        },
        secondary: {
            main: "#ff1e56",
        },
        background: {
            default: "#121212",
            paper: "#323232",
        },
        text: {
            primary: "#EEEEEE",
        },
    },
    typography: {
        fontFamily: "Montserrat",
        h1: {
            fontSize: "1.6rem",
        },
        h2: {
            fontSize: "1.3rem",
        },
    },
});
const apiURL = import.meta.env.VITE_API_URL || "";

function App() {
    const bufferData = useRef<ArrayBuffer | null>(null);
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);
    const [inputError, setInputError] = useState<string | null>(null);

    const onLoadAudio = useCallback(async (url: string) => {
        try {
            if (!url) return;
            const audio = await fetch(`${apiURL}/audio`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });
            if (!audio.ok) {
                const { error } = await audio.json();
                throw new Error(error);
            }
            bufferData.current = await audio.arrayBuffer();
        } catch (e) {
            setInputError((e as Error).message);
            console.error(e);
        }
    }, []);

    const onLoadInfo = useCallback(async (url: string) => {
        try {
            const info = await fetch(`${import.meta.env.VITE_API_URL}/info`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });
            if (!info.ok) {
                const { error } = await info.json();
                throw new Error(error);
            }
            const { title } = await (info.json() as Promise<{ title: string }>);
            setVideoMeta({ title, url });
        } catch (e: unknown) {
            setInputError((e as Error).message);
            console.error(e);
        }
    }, []);

    const onLoadData = useCallback(
        async (url: string) => {
            setIsLoading(true);
            await Promise.all([onLoadInfo(url), onLoadAudio(url)]);
            setIsLoading(false);
        },
        [onLoadAudio, onLoadInfo],
    );

    const onNew = useCallback(() => {
        setVideoMeta(null);
        bufferData.current = null;
    }, []);

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <div className={css.header}>
                <div className={css.titleContainer}>
                    <h1 className={css.title}>SpectrogramPlayer</h1>
                    <div>
                        <HelpButton title="Help!" />
                        <IconButton
                            href="https://github.com/mathoglu/spectrotest"
                            target="_blank"
                            title="Visit GitHub repo"
                        >
                            <GitHub />
                        </IconButton>
                    </div>
                </div>
                {bufferData.current !== null && videoMeta !== null && (
                    <Button
                        variant="text"
                        startIcon={<PlayArrowSharp />}
                        onClick={onNew}
                    >
                        Play another
                    </Button>
                )}
            </div>
            {bufferData.current !== null && videoMeta !== null ? (
                <div className={css.playerContainer}>
                    <Player
                        videoMeta={videoMeta}
                        audioBufferData={bufferData.current}
                    />
                </div>
            ) : (
                <>
                    <div className={css.inputContainer}>
                        <FormControl fullWidth>
                            <TextField
                                size="small"
                                error={!!inputError}
                                onChange={e => {
                                    setInputError(null);
                                    setUrl(e.target.value);
                                }}
                                placeholder="Link to Youtube video"
                                disabled={isLoading}
                                autoFocus
                            />
                            {inputError && (
                                <FormHelperText error>
                                    {inputError}
                                </FormHelperText>
                            )}
                        </FormControl>
                        {!isLoading ? (
                            <Button
                                disabled={!url || !!inputError}
                                variant="text"
                                size="large"
                                startIcon={<PlayArrowSharp />}
                                onClick={() => {
                                    onLoadData(url);
                                }}
                            >
                                Play
                            </Button>
                        ) : (
                            <CircularProgress size="40px" />
                        )}
                    </div>
                </>
            )}
        </ThemeProvider>
    );
}

export default App;
