import ModuleComponent from './module.vue';

export default {
	id: 'landing-page-more', // root URI
	name: 'Landing Page',
	icon: 'rocket_launch',
	routes: [
		{
			name: 'home',
			path: '',
			props: true,
			component: ModuleComponent,
		},
		{
			name: 'page',
			path: ':page',
			props: true,
			component: ModuleComponent,
		},
	],
};