import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Player } from "./components/player";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import TextField from "@mui/material/TextField";
import { useCallback, useRef, useState } from "react";
import css from "./App.module.scss";
import { PlayArrowSharp } from "@mui/icons-material";

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
            bufferData.current = await audio.arrayBuffer();
        } catch (e) {
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
            const { title } = await (info.json() as Promise<{ title: string }>);
            setVideoMeta({ title, url });
        } catch (e) {
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
                <h1 className={css.title}>spectrogram player</h1>
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
                        <TextField
                            size="small"
                            fullWidth
                            onChange={e => setUrl(e.target.value)}
                            placeholder="Add youtube URL here"
                            disabled={isLoading}
                            autoFocus
                        />
                        {!isLoading ? (
                            <Button
                                disabled={!url}
                                variant="text"
                                size="large"
                                onClick={() => {
                                    onLoadData(url);
                                }}
                            >
                                Play
                            </Button>
                        ) : (
                            <LoadingButton
                                size="large"
                                variant="text"
                                loading
                                loadingPosition="start"
                            ></LoadingButton>
                        )}
                    </div>
                </>
            )}
        </ThemeProvider>
    );
}

export default App;
