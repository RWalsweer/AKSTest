Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {

	// melding schrijven naar de console van de browser	
	console.log('Starten van de applicatie');
	
	// Starten van de app
	this._loadData();
	},
	

	// Ophalen van de data bij Rally
	_loadData: function() {

		var myStore = Ext.create('Rally.data.wsapi.Store', {
    		model: 'User Story',
    	
    		// Direct na starten van de app wordt er data opgehaald
    		autoLoad: true,

   			// wordt aangeroepen wanneer de data terugkomt uit de store
    		listeners: {
    	    	load: function(myStore, myData, success) {
    	 
    	        	//process data
    	        	console.log('got data', myStore, myData, success);
    	        	this._loadGrid(myStore);
    	        },
	    
	    	    // maken van een reference naar de app
	    	    scope: this
    		},
	    	fetch: ['FormattedID','Name', 'ScheduleState']
		});
	},
    	        
    // Maakt en toont een grid met de geselecteerde stories
    _loadGrid: function(myStoryStore) {	        

        // Aanmaken van een grid om data te kunnen tonen
    	var myGrid = Ext.create('Rally.ui.grid.Grid', {
    	    store: myStoryStore,
    	    columnCfgs: [
    	        	'FormattedID','Name'
    	        ]
    	});
    	    
    	// Grid toevoegen aan de app
    	this.add(myGrid);
    	    console.log('what is this?', this);
    	}
	
});
