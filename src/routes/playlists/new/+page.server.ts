import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { SPOTIFY_BASE_URL } from "$env/static/private";

export const actions: Actions = {
    default: async ({ fetch, request, cookies }) => {
        const data = await request.formData();

        const name = data.get('name');
        const description = data.get('description');
        const userId = data.get('userId');

        if (!name) {
            return fail(400, {
                name,
                description,
                nameError: 'Playlist name is required!',
                apiError: false,
            })
        }

        const res = await fetch(`${SPOTIFY_BASE_URL}/users/${userId}/playlists`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${cookies.get('access_token')}`
            },
            body: JSON.stringify({ name, description })
        });

        if (!res.ok) {
            const errorJson = await res.json();
            return fail(res.status, {
                name,
                description,
                apiError: errorJson?.error?.message ?? 'An error has occurred',
                nameError: false,
            })
        } else {
            const resJson: SpotifyApi.CreatePlaylistResponse = await res.json();
            throw redirect(303, `/playlist/${resJson.id}`);
        }
    }
}