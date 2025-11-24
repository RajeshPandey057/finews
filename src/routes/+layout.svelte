<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Sonner from '@/components/ui/sonner/sonner.svelte';
	import '../layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
 <div class="flex min-h-screen flex-col overflow-x-hidden font-int">
	 
	<main>
		{@render children?.()}
	</main>
	 
</div>
<Sonner richColors />
