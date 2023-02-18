/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
      fontFamily: {
        'logo': ['"Highway Gothic"', 'ui-sans-serif', 'system-ui']
      }
    }
	},
	plugins: [require('@tailwindcss/typography'), require('daisyui')],
	daisyui: {
		themes: [
			{
				light: {
					...require('daisyui/src/colors/themes')['[data-theme=light]'],
					primary: '#38bdf8'
				}
			},
			{
				dark: {
					...require('daisyui/src/colors/themes')['[data-theme=dark]'],
					primary: '#38bdf8'
				}
			}
		]
	}
};
