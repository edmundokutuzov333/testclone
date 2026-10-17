import { useEffect, useRef } from "react";
import type { Track } from "../data";

export interface SpotifyPlaybackState {
  position: number;
  duration: number;
  isPaused: boolean;
  isBuffering: boolean;
}

export interface SpotifyEmbedController {
  play(): void;
  pause(): void;
  resume(): void;
  togglePlay(): void;
  seek(seconds: number): void;
  loadUri(uri: string): void;
  destroy(): void;
  addListener(name: string, listener: (event: { data: Record<string, unknown> }) => void): void;
  removeListener?(name: string, listener?: (event: { data: Record<string, unknown> }) => void): void;
}

interface SpotifyIframeAPI {
  createController(
    element: HTMLElement,
    options: { uri: string; width: string; height: string },
    callback: (controller: SpotifyEmbedController) => void,
  ): void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeAPI) => void;
  }
}

let apiPromise: Promise<SpotifyIframeAPI> | null = null;

function loadSpotifyIframeAPI(): Promise<SpotifyIframeAPI> {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<SpotifyIframeAPI>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("O leitor Spotify demorou demasiado tempo a iniciar.")), 15000);
    const previousCallback = window.onSpotifyIframeApiReady;

    window.onSpotifyIframeApiReady = (api) => {
      window.clearTimeout(timeout);
      previousCallback?.(api);
      resolve(api);
    };

    let script = document.querySelector<HTMLScriptElement>('script[src="https://open.spotify.com/embed/iframe-api/v1"]');
    if (!script) {
      script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error("Não foi possível carregar o leitor oficial do Spotify."));
      };
      document.head.appendChild(script);
    }
  });

  return apiPromise;
}

interface SpotifyPlayerProps {
  track: Track;
  onController: (controller: SpotifyEmbedController | null) => void;
  onPlaybackState: (state: SpotifyPlaybackState) => void;
  onError: (message: string) => void;
}

export default function SpotifyPlayer({ track, onController, onPlaybackState, onError }: SpotifyPlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let localController: SpotifyEmbedController | null = null;

    loadSpotifyIframeAPI()
      .then((api) => {
        if (!mountedRef.current || !hostRef.current) return;

        hostRef.current.replaceChildren();
        api.createController(
          hostRef.current,
          { uri: track.spotifyUri, width: "100%", height: "152" },
          (controller) => {
            if (!mountedRef.current) {
              controller.destroy();
              return;
            }

            localController = controller;
            controllerRef.current = controller;
            onController(controller);

            controller.addListener("playback_update", (event) => {
              if (!mountedRef.current) return;
              const data = event.data;
              onPlaybackState({
                position: typeof data.position === "number" ? data.position / 1000 : 0,
                duration: typeof data.duration === "number" ? data.duration / 1000 : track.duration,
                isPaused: data.isPaused === true,
                isBuffering: data.isBuffering === true,
              });
            });
          },
        );
      })
      .catch((error: unknown) => {
        if (!mountedRef.current) return;
        onError(error instanceof Error ? error.message : "O leitor Spotify não ficou disponível.");
      });

    return () => {
      mountedRef.current = false;
      onController(null);
      if (localController) {
        try {
          localController.destroy();
        } catch {
          // Cleanup of an already removed embed must not break navigation.
        }
      }
      if (controllerRef.current === localController) controllerRef.current = null;
    };
  }, [track.id, track.spotifyUri, track.duration, onController, onPlaybackState, onError]);

  return (
    <div className="spotify-player-shell">
      <div className="spotify-player-meta">
        <div>
          <span className="eyebrow">FONTE OFICIAL</span>
          <strong>{track.opensCollection ? "Escolhe a faixa no catálogo Spotify" : "Reprodução através do Spotify"}</strong>
        </div>
        <a href={track.spotifyUri.replace(/^spotify:/, "https://open.spotify.com/").replace(/:/g, "/")} target="_blank" rel="noreferrer">Abrir no Spotify ↗</a>
      </div>
      <div ref={hostRef} className="spotify-embed-host" aria-label="Leitor oficial do Spotify" />
      <p className="spotify-player-footnote">A disponibilidade da reprodução depende do Spotify, da conta e da região.</p>
    </div>
  );
}