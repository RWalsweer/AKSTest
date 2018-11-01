
//  Handige Sneltoetsen
//  Command #    (kiest meteen de juiste browser tab.  1 tabbald 1 enz..  )
//  Command R    Refresh de pagina
////////////////////////////////////////////////////////////////////

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {

	// melding schrijven naar de console van de browser	
	console.log('Starten van de applicatie');
    this._LoadData();

    },

    // Laden van de Store en Data uit Rally
    _LoadData: function() {
        // Aanmaken van een Store  (records of data)
        var myStore = Ext.create('Rally.data.wsapi.Store', {
            // Welk type data wil je uit Rally halen
            model: 'User Story',
            // Geeft aan dat er direct data wordt geladen nadat de store actief is geworden.
            autoLoad: true,
           // Events die worden uitgevoerd 
            listeners: {
                load: function(myStore, myData, success) {
                    console.log("Data ontvangen", myStore, myData, success);

                // opgehaalde data plaatsen in een Grid
                // Op deze plaats zetten, anders wordt de grid niet geladen.
                this._LoadGrid(myStore)
                },
                
                // app op zichtzelf toevoegen aan de load function zodat de Grid zal worden getoond. 
                scope: this
            },
            // Aangeven welke velden je uit Rally wil halen.
            fetch: ['FormattedID', 'Name', 'ScheduleState']
        });
    },

    // Laden en tonen van de Grid
    _LoadGrid: function(myStoryStore) {
        var myGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myStoryStore,
            columnCfgs: [
                // Kolomnamen moeten voorkomen in de fetch
                'FormattedID',
                'Name'
            ],
        });

        // Manier om te kijken wat je exact terugkrijgt vanuit Rally
        this.add(myGrid);
        console.log('Wat is dit: ', this);
        }

});


	
