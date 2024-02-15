import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Player } from "./components/player";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import TextField from "@mui/material/TextField";
import { useCallback, useRef, useState } from "react";
import css from "./App.module.scss";

export type VideoMeta = {
    url: string;
    title: string;
};

const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
});
const apiURL = import.meta.env.VITE_API_URL || "";

function App() {
    const inputRef = useRef<HTMLInputElement>(null);
    const bufferData = useRef<ArrayBuffer | null>(null);
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

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <h1 className={css.title}>Spectrogram</h1>
            {bufferData.current !== null && videoMeta !== null ? (
                <Player
                    videoMeta={videoMeta}
                    audioBufferData={bufferData.current}
                />
            ) : (
                <>
                    <h2>Generate Spectrogram from Youtube video</h2>
                    <div className={css.inputContainer}>
                        <TextField
                            fullWidth
                            inputRef={inputRef}
                            placeholder="Add youtube URL here"
                            disabled={isLoading}
                        />
                        {!isLoading ? (
                            <Button
                                size="large"
                                onClick={() => {
                                    onLoadData(inputRef.current?.value || "");
                                }}
                            >
                                Generate
                            </Button>
                        ) : (
                            <LoadingButton
                                size="large"
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
