import { supabase } from '$lib/supabase/supabaseClient';

/** @type {import('./$types').PageLoad} */
export async function load() {
	const { data } = await supabase.from("coffees").select();
	return {
		coffees: data ?? [],
	};
}