import { mount } from 'svelte';
import App from './App.svelte';
import { type IAudioMetadata, parseBlob } from "music-metadata";
import Lyrics from './lib/Lyrics.svelte';
import { Vibrant } from "node-vibrant/browser";


async function fileUpdated(this: HTMLInputElement, ev: Event) {
	console.log(this.files);
	
	if (!(this.files?.length !== 0 && (this.files![0].type).includes("audio/"))) {
		console.warn("File is not an audio file.");
		(document.getElementById("wrong-file-type-dialog") as HTMLDialogElement).showModal();
	}
	else {
		(document.getElementById("loading-dialog") as HTMLDialogElement).show();

		// Remove existing lyrics
		document.getElementById('lyrics')!.innerHTML = "";

		// Set audio file to play
		const audio_url = URL.createObjectURL(this.files![0]);
		const au = document.getElementById("audio-source") as HTMLAudioElement;
		au.src = audio_url; au.play(); au.pause();

		// Read audio metadata
		const audio_metadata = await parseBlob(this.files![0]) as IAudioMetadata;

		// Search for synced lyrics online
		const search_term = `${audio_metadata.common.artist}%20${audio_metadata.common.title}`;
		const lrclib_response = await fetch(`https://lrclib.net/api/search?q=${search_term}`);
		const lrclib_results = await lrclib_response.json() as Array<{name: string, syncedLyrics: string, duration: number}>;

		// Find song lyrics in results
		const song_object = lrclib_results.find(
			(value) => (value.name == audio_metadata.common.title && Math.abs(value.duration - audio_metadata.format.duration!) < 1.5)
		);

		// Warn if lyrics not found
		if (!song_object || song_object.syncedLyrics == null) {
			console.warn("Could not find synced lyrics for this song.");
			(document.getElementById("no-lyrics-found-dialog") as HTMLDialogElement).showModal();
		}

		// Otherwise continue
		else {
			const lyrics_object = song_object.syncedLyrics as string;

			let lyrics_processed: Array<{time: number, line: string}> = [];
			lyrics_object.trim().split("\n").forEach(line_raw => {
				const time = (parseInt(line_raw.split("]")[0].slice(1).split(":")[0]) * 60) + (parseFloat(line_raw.split("]")[0].slice(1).split(":")[1]))
				lyrics_processed.push(
					{
						time: time,
						line:  line_raw.split("]")[1] ? line_raw.split("]")[1].trim() : ""
					}
				);
			});

			lyrics_processed = lyrics_processed.filter((value) => !Number.isNaN(value.time));

			const lrael = mount(Lyrics, {
				target: document.getElementById('lyrics')!,
				props: lyrics_processed
			});

			setInterval(updateLyrics, 25, au, lyrics_processed, lrael);
		}

		if (audio_metadata.common.picture) {
			const cover_url = await bytesToBase64DataUrl(audio_metadata.common.picture[0].data);

			const palette = await Vibrant.from(cover_url).getPalette();
			if (palette.DarkVibrant) {
				(document.querySelector(':root')! as HTMLElement).style.setProperty('--background', palette.DarkVibrant.hex);
			}
			if (palette.DarkMuted) {
				(document.querySelector(':root')! as HTMLElement).style.setProperty('--other-background', palette.DarkMuted.hex);
			}
			else {
				console.warn("Could not find colour for album cover.")
			}

			const el = (document.getElementById("album-cover")! as HTMLImageElement);
			el.src = cover_url;
			el.hidden = false;

			const el2 = (document.getElementById("background-image")! as HTMLImageElement);
			el2.src = cover_url;
			el2.hidden = false;
		}
		else {
			const el = (document.getElementById("album-cover")! as HTMLImageElement);
			el.hidden = false;

			const el2 = (document.getElementById("background-image")! as HTMLImageElement);
			el2.hidden = false;
		}

		if (audio_metadata.common.artist) {
			const el = document.getElementById("song-artist")!;
			el.innerText = audio_metadata.common.artist;
			el.hidden = false;

		}
		
		if (audio_metadata.common.title) {
			const el = document.getElementById("song-title")!
			el.innerText = audio_metadata.common.title;
			el.hidden = false;
		}

		(document.getElementById("loading-dialog") as HTMLDialogElement).close();
	}
}

async function bytesToBase64DataUrl(bytes: Uint8Array, type = "application/octet-stream"): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = Object.assign(new FileReader(), {
      onload: () => resolve(reader.result as string),
      onerror: () => reject(reader.error),
    });
    reader.readAsDataURL(new File([bytes as BlobPart], "", { type }));
  });
}

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

function updateLyrics(au: HTMLAudioElement, lrcs: Array<{time: number, line: string}>, lyrics_element: Lyrics) {
	const current_lyric = lrcs.findIndex(
		(value, index) => (lrcs[clamp(index+1, 0, lrcs.length-1)].time > au.currentTime)
	);
	lyrics_element.updateLine(current_lyric);
}

const app = mount(App, {
	target: document.getElementById('app')!,
})

export default app

const sgs = document.getElementById("song-source") as HTMLInputElement;
sgs.addEventListener("change", fileUpdated);