<template>
	<private-view v-if="!permission" title="401: Unauthorized">
		<v-info icon="block" title="Unauthorized Access" type="danger">
			You do not have permission to access this page
		</v-info>
	</private-view>
	<private-view v-else v-model:splitView="livePreviewMode" :split-view-min-width="310" :title="page_title">
		<template v-if="breadcrumb" #headline>
			<v-breadcrumb :items="breadcrumb" />
		</template>

		<template #title-outer:prepend>
			<v-button class="header-icon" rounded disabled icon secondary>
				<v-icon name="access_time" />
			</v-button>
		</template>

		<template #title-outer:append>
			<v-icon
				clickable
				name="add_circle"
			/>
		</template>

		<template #actions:prepend>
			ACTION PREPEND
		</template>

		<template #actions>
			<v-input class="module-search" :model-value="search">
				<template #prepend><v-icon name="search" /></template>
			</v-input>
			<v-button
				v-tooltip.bottom="livePreviewMode === null ? 'Enable Split View' : 'Disable Split View'"
				rounded
				icon
				class="action-preview"
				:secondary="livePreviewMode === null"
				@click="toggleSplitView"
			>
				<v-icon name="visibility" outline />
			</v-button>
			<v-button v-tooltip.bottom="'COOL'" icon rounded>
				<v-icon name="launch" />
			</v-button>
		</template>

		<template #navigation>
			<page-navigation :current="page" :pages="all_pages"/>
		</template>

		<div class="lp-container">
			<div class="lp-banner" v-if="page_banner">
				<img :src="page_banner" class="lp-banner-img" alt=""/>
				<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAdCAIAAADTrV4KAAAAY0lEQVR4nOzQQQ3AIADAwGWZf397YQARWKAvQnKnoOk3/vmw5z0dcBOzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCs4IVAAD//29qAuH1jYmeAAAAAElFTkSuQmCC" alt=""/>
			</div>
			<div class="lp-cards" v-if="page_cards">
				<div class="lp-card" v-for="card in page_cards.filter(item => (item.uri != page))" :key="card.uri" :style="`background-color: ${card.color}`" @click="change_page(card.to)">
					<v-icon :name="card.icon"/>
					<span class="lp-card-title">{{ card.label }}</span>
				</div>
			</div>
			<div class="lp-body" v-if="page_body" v-html="page_body"></div>
		</div>

		<template #splitView>
			<div ref="livePreviewEl" class="live-preview">
				<div class="container">
					<div class="iframe-view">
						<div
							ref="resizeHandle"
							class="resize-handle"
							:style="{
								width: '100%',
								height: '100%',
								resize: 'both',
							}"
						>
							<!-- <iframe id="frame" ref="frameEl" :src="url" @load="onIframeLoad" /> -->
							SPLIT VIEW
						</div>
					</div>
				</div>
			</div>
		</template>

		<template #sidebar>
			<sidebar-detail icon="info" title="Information" close>
				<div v-md="page_description" class="page-description" />
			</sidebar-detail>
			<sidebar-detail icon="layers" title="SIDEBAR ITEM">
				SIDEBAR ITEM CONTENT
			</sidebar-detail>
		</template>
		
		<router-view name="landing-page-more" :page="page" />
	</private-view>
</template>

<script>
import { ref, watch } from 'vue';
import { useApi, useStores } from '@directus/extensions-sdk';
import { useRouter } from 'vue-router';
import useDirectusToken from './use-directus-token';
import PageNavigation from './components/navigation.vue';

export default {
	components: {
		PageNavigation,
	},
	props: {
		page: {
			type: String,
			default: 'home',
		},
	},
	setup(props) {
		const router = useRouter();
		const api = useApi();
		const { usePermissionsStore } = useStores();
		const { hasPermission } = usePermissionsStore();
		const permission = hasPermission('page', 'read');
		const { addTokenToURL } = useDirectusToken(api);
		const page_title = ref('');
		const page_banner = ref('');
		const page_cards = ref([]);
		const page_body = ref('');
		const page_description = ref('');
		const livePreviewMode = ref(null);
		const breadcrumb = ref([
            {
                name: 'Home',
                to: `/landing-page-more`,
            },
        ]);
		const search = ref('');
		const all_pages = ref([]);

		render_page(props.page);
		fetch_all_pages();

		watch(
            () => props.page,
            () => {
                render_page(props.page);
            }
        );

		function change_page(to){
			const next = router.resolve(`${to}`);
			router.push(next);
		}

		function toggleSplitView() {
			if (livePreviewMode.value === null) {
				livePreviewMode.value = 'split';
			} else {
				livePreviewMode.value = null;
			}
		}

		return { page_title, page_description, page_banner, page_cards, page_body, breadcrumb, all_pages, change_page, search, toggleSplitView, livePreviewMode, permission };

		function render_page(page){
			page_cards.value = all_pages.value;
			if(page === null){
				page_title.value = '500: Internal Server Error';
				page_description.value = '';
				breadcrumb.value.splice(1, 1);
				page_banner.value = '';
				page_cards.value = [];
				page_body.value = '';
			} else {
				switch(page) {
					case 'home':
						page_title.value = 'Home';
						page_description.value = 'Everything you need to know about this module';
						page_banner.value = addTokenToURL('/assets/f0235fcc-8152-4a56-839a-c48b4a58aa50?width=2000&height=580&fit=cover');
						page_body.value = '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>';
						break;
					case 'hello-world':
						page_title.value = 'Hello World';
						page_description.value = 'This is a test page';
						page_banner.value = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAdCAIAAADTrV4KAAAAYUlEQVR4nOzQUQnAMBTAwMeY4xma1FpovkrhTkHI+8837HlOB9zErMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKzArMCswKxgBQAA//8GggFQj7SQ/wAAAABJRU5ErkJggg==';
						page_body.value = '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>';
						break;
					case 'contact':
						page_title.value = 'Contact Us';
						page_description.value = 'Get in contact with us to discuss your options.';
						page_banner.value = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAdCAIAAADTrV4KAAAAYklEQVR4nOzQUQnAIAAA0TGWbNlMYVoreF8ivJfguO8f82HPezrgJmYFZgVmBWYFZgVmBWYFZgVmBWYFZgVmBWYFZgVmBWYFZgVmBWYFZgVmBWYFZgVmBWYFZgVmBSsAAP//R34BnbH9ApEAAAAASUVORK5CYII=';
						page_body.value = '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>';
						break;
					default:
						page_title.value = '404: Not Found';
						page_description.value = '';
				}

				if(page === 'home'){
					breadcrumb.value.splice(1, 1);
				} else {
					breadcrumb.value[1] = {
						name: page_title.value,
						to: `/landing-page-more/${page}`,
					};
				}
			}
		}

		function fetch_all_pages(){
			all_pages.value = [
				{
					label: 'Home',
					uri: 'landing-page-more',
					to: '/landing-page-more',
					icon: 'home',
					color: '#6644FF',
				},
				{
					label: 'Hello World',
					uri: 'hello-world',
					to: '/landing-page-more/hello-world',
					icon: 'public',
					color: '#2ECDA7',
				},
				{
					label: 'Contact Us',
					uri: 'contact',
					to: '/landing-page-more/contact',
					icon: 'phone',
					color: '#3399FF',
				},
			];
			page_cards.value = all_pages.value;
		}
	},
};
</script>
<style lang="scss">
	.lp-container {
		padding: var(--content-padding);
		padding-top: 0;
		width: 100%;
		max-width: 1024px;

		&> div {
			margin-bottom: var(--content-padding);
		}
	}

	.lp-banner {
		position: relative;
		border-radius: var(--border-radius);
		overflow: hidden;

		img {
			display: block;
			width: 100%;
		}

		.lp-banner-img {
			position: absolute;
			top:0;
			right:0;
			bottom:0;
			left:0;
			z-index: 1;
		}
	}

	.lp-cards {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		column-gap: var(--input-padding);
    	row-gap: var(--input-padding);

		.lp-card {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: center;
			text-align: center;
			border-radius: var(--border-radius);
			padding: var(--input-padding);
			color: white;

			.v-icon {
				width: 100%;
				height: 50px;
				margin-bottom: 6px;

				i {
					font-size: 50px;
    				color: white;
				}
			}

			.lp-card-title {
				display: block;
				font-weight: bold;
				font-size: 1.4em;
				line-height: 1.2;
			}
		}
	}

	.v-input.full-width.module-search {
		display: flex;
		width: 300px;
		height: 44px;

		.input {
			width: auto;
			padding: 0 10px;
			overflow: hidden;
			color: var(--theme--foreground);
			text-overflow: ellipsis;
			background-color: var(--theme--background);
			border-radius: 22px;
		}
	}

	.live-preview {
		width: 100%;
		height: 100%;

		.container {
			width: 100%;
			height: calc(100% - 44px);
			overflow: auto;
		}

		.iframe-view {
			width: 100%;
			height: 100%;
			overflow: auto;
			display: grid;
			padding: 48px;

			#frame {
				width: 100%;
				height: 100%;
				border: 0;
			}

			.resize-handle {
				overflow: hidden;
				box-shadow: 0px 4px 12px -4px rgba(0, 0, 0, 0.2);
			}
		}
	}
</style>