<script lang="ts">
    let props: {line: string, time: number} = $props();
    function jumpToTime() {
        (document.getElementById("audio-source") as HTMLAudioElement).currentTime = props.time;
    }
</script>

<p class:current={false} onclick={jumpToTime} onkeyup={jumpToTime} role="none">
    {props.line}
</p>

<style>
    :hover {
        cursor: pointer;
    }
</style>