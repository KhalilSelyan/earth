<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import type { Writable } from 'svelte/store';
	import { guiControls } from '$lib/gui';
	import Gui from '$lib/gui/gui.svelte';

	const controls = guiControls({
		mapType: {
			value: '03_earthlights1k.jpg',
			options: ['00_earthmap1k.jpg', '03_earthlights1k.jpg']
		}
	});
</script>

<Gui {controls} />
<Canvas>
	<Scene {controls} />
</Canvas>
