/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				logo: ['"Highway Gothic"', 'ui-sans-serif', 'system-ui']
			},
			transitionDuration: {
				0:	'0ms',
				25: '25ms'
			}
		}
	},
	plugins: [require('@tailwindcss/typography'), require('daisyui')],
	daisyui: {
		themes: [
			{
				light: {
					...require('daisyui/src/colors/themes')['[data-theme=light]'],
					primary: '#0284c7'
				}
			},
			{
				dark: {
					...require('daisyui/src/colors/themes')['[data-theme=dark]'],
					primary: '#0284c7',
					neutral: '#2B303B',
					'neutral-focus': '#434851',
					'neutral-content': '#DDE3EB',
					'base-100': '#24262C',
					'base-200': '#181B23',
					'base-300': '#0E1119',
					'base-content': '#C5CBD8'
				}
			}
		]
	}
};
