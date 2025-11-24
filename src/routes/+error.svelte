<script lang="ts">
	import { resolve } from '$app/paths';
	import NotFound from '$lib/svg/not-found.svelte';
	import { onMount } from 'svelte';

	let mounted = false;

	onMount(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<title>Lost 😰 | Experts car</title>
</svelte:head>

<main
	class="relative min-h-screen overflow-hidden bg-linear-to-br from-blue-50 via-white to-indigo-50">
	<!-- Decorative background elements -->
	<div class="absolute inset-0 overflow-hidden">
		<div
			class="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-blue-100 opacity-50 blur-3xl">
		</div>
		<div
			class="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-indigo-100 opacity-50 blur-3xl"
			style="animation-delay: 2s;">
		</div>
		<div
			class="absolute top-1/2 left-1/2 h-60 w-60 animate-pulse rounded-full bg-purple-100 opacity-30 blur-3xl"
			style="animation-delay: 4s;">
		</div>
	</div>

	<!-- Content -->
	<section
		class="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 text-center sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl">
			<!-- Error code with animation -->
			<div
				class={`mb-6 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
				<span
					class="inline-block rounded-full bg-linear-to-r from-blue-500 to-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-lg">
					404 Error
				</span>
			</div>

			<!-- Main heading -->
			<div
				class={`mb-8 transform space-y-4 transition-all delay-200 duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
				<h1
					class="bg-linear-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
					Oops! Lost your way?
				</h1>
				<div class="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-blue-500 to-indigo-600">
				</div>
			</div>

			<!-- Description -->
			<div
				class={`mb-10 transform transition-all delay-400 duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
				<p class="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">
					The page you're looking for seems to have wandered off into the digital wilderness. Don't
					worry, we'll help you find your way back home! 🏠
				</p>
			</div>

			<!-- Illustration -->
			<div
				class={`mb-10 flex transform justify-center transition-all delay-600 duration-1000 ${mounted ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'}`}>
				<div class="relative">
					<div
						class="absolute inset-0 animate-pulse rounded-full bg-linear-to-r from-blue-200 to-indigo-200 opacity-50 blur-xl">
					</div>
					<div class="relative h-64 w-64 sm:h-72 sm:w-72 md:h-80 md:w-80 lg:h-96 lg:w-96">
						<NotFound />
					</div>
				</div>
			</div>

			<!-- Action buttons -->
			<div
				class={`flex transform flex-col gap-4 transition-all delay-800 duration-1000 sm:flex-row sm:justify-center ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
				<a
					href={resolve('/')}
					class="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95">
					<span
						class="absolute inset-0 bg-linear-to-r from-blue-700 to-indigo-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
					</span>
					<span class="relative flex items-center gap-2">
						<svg
							class="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 19l-7-7m0 0l7-7m-7 7h18">
							</path>
						</svg>
						Take Me Home
					</span>
				</a>

				<button
					onclick={() => history.back()}
					class="group relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 shadow-lg transition-all duration-300 hover:scale-105 hover:border-gray-400 hover:shadow-xl active:scale-95">
					<span
						class="absolute inset-0 bg-gray-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
					</span>
					<span class="relative flex items-center gap-2">
						<svg
							class="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z">
							</path>
						</svg>
						Go Back
					</span>
				</button>
			</div>

			<!-- Help text -->
			<div
				class={`mt-12 transform transition-all delay-1000 duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
				<p class="text-sm text-gray-500">
					If you believe this is an error, please
					<a
						href="/contact"
						class="font-medium text-blue-600 underline decoration-2 underline-offset-2 transition-colors hover:text-blue-700">
						contact our support team
					</a>
				</p>
			</div>
		</div>
	</section>
</main>
