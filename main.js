require.config({
	paths: {
		jQuery : 'jquery',
		Underscore : 'underscore',
		Backbone : 'backbone',
		ListModel: 'src/models/ListModel',
		TodoModel: 'src/models/TodoModel',
		FullListView: 'src/views/FullListView',
		ListCollectionView: 'src/views/ListCollectionView',
		ListItemView: 'src/views/ListItemView',
		TodoView: 'src/views/TodoView',
		MainRouter: 'src/routers/main',
		ListCollection: 'src/collections/ListCollection',
		TodoCollection: 'src/collections/TodoCollection'
	}
});

require( ['src/app'], function( App ) { App.init(); } );
