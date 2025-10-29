<script lang="ts">
    import { onMount } from 'svelte';
    import NoLyrics from './lib/dialogs/NoLyrics.svelte';
    import WrongFileType from './lib/dialogs/WrongFileType.svelte';
    import Loading from './lib/dialogs/Loading.svelte';
	
	onMount(() => {
		document.getElementById("open-file-link")!.addEventListener("click", () => {
			document.getElementById("song-source")!.click();
		});
		document.getElementById("open-file-link")!.addEventListener("keypress", (ev) => {
			if (ev.key === " " || ev.key === "Enter") {
				document.getElementById("song-source")!.click();
			}
		});
		(document.getElementById("song-info")! as HTMLDialogElement).show();
	});
</script>

<main>
	<!-- svelte-ignore a11y_missing_attribute -->
	<img id="background-image" src="" hidden/>
	<input type="file" id="song-source" style="display: none;">
	
	<dialog id="song-info">
		<img id="album-cover" src="" hidden alt="Album cover"/>
		<div class="--details">
			<h2 id="song-title" hidden>
				Song title
			</h2>
			<h4 id="song-artist" hidden>
				Artist
			</h4>
			<a id="open-file-link" role="link" tabindex="0">
				Open a song file...
			</a>
		</div>
	</dialog>

	<div id="lyrics"></div>

	<footer>
		<audio controls id="audio-source"></audio>
	</footer>

	<NoLyrics/>
	<WrongFileType/>
	<Loading/>
</main>

<style>
	main {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
	footer {
		width: 100%;
		> audio {
			width: 100%;
		}
	}
	#lyrics {
		height: 50%;
		flex-grow: 10;
	}
	#song-info {
		position: absolute;
		top: 1rem;
		left: 1rem;
		padding: 1rem;
		border-radius: 1rem;
		display: flex;
		flex-direction: row;

		background-color: rgb(from var(--other-background) r g b / 0.5);
		color: gainsboro;
		backdrop-filter: blur(8px) brightness(50%);

		> #album-cover {
			width: 8rem;
			height: 8rem;
			margin-right: 1rem;
			border-radius: 0.5rem;
		}
		.--details {
			display: flex;
			flex-direction: column;
			> #song-title {
				font-weight: 900;
				max-width: 16em;
			}
			> #song-artist {
				margin: 0.5rem 0
			}
		}
		z-index: 1;
	}
	#open-file-link {
		cursor: pointer;
		transition: all 0.125s var(--ease);
		&:hover {
			font-weight: bolder;
		}
	}
	#background-image {
		position: absolute;
		top: 0;
		left: 0;

		object-position: 0 0;
		object-fit: cover;
		width: 100%;
		height: 100%;

		filter: blur(128px) opacity(37.5%);
		z-index: -1;
		overflow: hidden;	
	}
</style>