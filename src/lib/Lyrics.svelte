<script lang="ts">
	import { mount, onMount } from "svelte";
	import LyricLine from "./LyricLine.svelte";

	let lyrics_array: Array<{time: number, line: string}> = $props();
	let current_line: number = $state(0);

	export function updateLine(i: number) {
		if (i !== current_line || i === 0) {
			if (i === current_line + 1) {
				document.getElementById(`line-${i-1}`)!.classList.remove("current");
			}
			else {
				if (document.getElementsByClassName("current")) {
					Array.prototype.forEach.call(document.getElementsByClassName("current"), function(element: HTMLElement) {
						element.classList.remove("current");
					});
				}
			}
			current_line = i;
			document.getElementById(`line-${current_line}`)!.classList.add("current");

			document.getElementById(`line-${current_line}`)!.scrollIntoView({
				behavior: "smooth",
				block: "center"
			});
		}
	}

	onMount(() => {
		lyrics_array.forEach((line, index) => {
			let a = document.createElement("p");
			a.id = `line-${index}`;
			document.getElementById("lyrics-container")!.appendChild(a);
			mount(LyricLine, {
				target: a,
				props: line
			});
			if (line.line === "") {
				a.hidden = true;
			}
		});
	});

</script>

<div id="lyrics-container">
	<p></p>
</div>

<style>
	#lyrics-container {
		height: 100%;
		overflow: scroll;

		padding: 25vh 1em;

		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none;  /* IE 10+ */

		::-webkit-scrollbar {
			width: 0px;
			background: transparent; /* make scrollbar transparent */

		}

		display: flex;
		flex-direction: column;
		align-items: center;

		text-align: center;
		line-height: 1.5;
		font-weight: 400;

		:global(> p) {
			color: gainsboro;
			transition: all 0.25s cubic-bezier(0.25, 1, 0.25, 1);
			margin: 1.25em 0;
			width: fit-content;
			:global(&.current) {
				font-size: 2em;
				font-weight: 900;
				margin: 1em 0;
				filter: drop-shadow(0px 0px 32px #ffffff);
			}
		}
		mask: linear-gradient(to top, transparent, white 10%, white 90%, transparent 100%);

	}
</style>