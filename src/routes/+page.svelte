<script>
	import { supabase } from '$lib/supabase/supabaseClient';
	import { browser } from '$app/environment';
	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	const coffees = $state(data.coffees);
	$effect(() => {
		const channels = supabase
			.channel('custom-insert-channel')
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'coffees' },
				(payload) => {
					console.log('Change received!', payload);
					coffees.push(payload.new);
				}
			)
			.subscribe();
	});
</script>

<div class="container mx-auto py-6">
	<div class="px-4 sm:px-6 lg:px-8">
		<div class="sm:flex sm:items-center">
			<div class="sm:flex-auto">
				<h1 class="text-base font-semibold text-gray-900">Coffees</h1>
				<p class="mt-2 text-sm text-gray-700">A list of all the scraped coffees.</p>
			</div>
			<div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
				<button
					type="button"
					class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					onclick={() => {
						fetch('/api/coffees/scrap');
					}}
				>
					Add coffee
				</button>
			</div>
		</div>

		<div class="mt-8 flow-root">
			<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
				<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
					<table class="min-w-full">
						<thead class="bg-white">
							<tr>
								<th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
								<th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Country</th>
								<th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
								<th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Process</th>
								<th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Varietal</th>
								<th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
									>Altitude (m)</th
								>
								<th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SCA Score</th>
								<th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Provider</th>
								<th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Link</th>
								<th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Extra</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each coffees as coffee}
								<tr>
									<td class="px-3 py-4 text-sm text-gray-900">{coffee.name}</td>
									<td class="px-3 py-4 text-sm text-gray-500">{coffee.country}</td>
									<td class="px-3 py-4 text-sm text-gray-500">{coffee.location ?? ''}</td>
									<td class="px-3 py-4 text-sm text-gray-500">{coffee.process ?? ''}</td>
									<td class="px-3 py-4 text-sm text-gray-500">{coffee.varietal ?? ''}</td>
									<td class="px-3 py-4 text-sm text-gray-500">
										{coffee.lowest_height ?? ''} - {coffee.highest_height ?? ''}
									</td>
									<td class="px-3 py-4 text-sm text-gray-500">
										{coffee.sca_score ?? ''}
									</td>
									<td class="px-3 py-4 text-sm text-indigo-600">
										<a href={coffee.provider} target="_blank">Provider</a>
									</td>
									<td class="px-3 py-4 text-sm text-indigo-600">
										<a href={coffee.link} target="_blank">Details</a>
									</td>
									<td class="px-3 py-4 text-sm">
										<button class="text-indigo-600 hover:underline">View JSON</button>
									</td>
								</tr>
							{/each}
							<!-- Repeat for other coffees -->
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>
