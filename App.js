
//  Handige Sneltoetsen
//  Command #    (kiest meteen de juiste browser tab.  1 tabbald 1 enz..  )
//  Command R    Refresh de pagina
////////////////////////////////////////////////////////////////////
//
// tonen van een interactive Grid op defects in een bepaalde iteration.
// beschreven op youTube:   https://www.youtube.com/watch?v=jr7-VYFmDTw&index=4&list=PL3PQ-IsMxhG14aDViKxlPZASIrHatNkft

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    // aangeven welke objecten er op de app aanwezig zijn, beter leesbaarheid wanneer iemand er naar kijkt.
    myStore: undefined,
    myGrid: undefined,

    launch: function() {

	// melding schrijven naar de console van de browser	
	console.log('Starten van de applicatie');

    // this.  wil zeggen dat je het item op app niveau declareert
    //
    this.pulldownContainer = Ext.create('Ext.container.Container', {
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
    });

    // toevoegen van de container aan de app en deze tonen
    this.add(this.pulldownContainer);
    
    this._loadIterations();

    },

    // Laden van de Iterations combobox
    _loadIterations() {
        this.iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox' , {
            // Naam en positie van de label voor de Combobox
            fieldLabel: 'Iteration :',
            labelAlign: 'right',

            // Breedte van de combobox aanpassen zodat alle data wordt getoond. 
            width: 400,

            listeners: {
                // event wanneer de combobox is opgebouwd.
                ready: function(combobox) {
                //  console.log('Gekozen record by Ready Event', combobox.getRecord());
                //  var selectedIterRef2 = combobox.getRecord().get('_ref');
                //  console.log('Geselecteerde record bij Ready Event ', selectedIterRef2);
                    this._LoadSevereties();
                },

                // event wanneer er iets wordt geslecteerd in de combobox
                select: function(combobox, records) {
                    this._LoadData();
                },

                scope: this
            }

        });
        // Tonen van de Combobox op het scherm  (app niveau)
        //this.add(this.iterComboBox);

        // Tonen van de Combobox in de pulldownContainer
        this.pulldownContainer.add(this.iterComboBox);
    },

    // Laden van de Combobox Severities
    _LoadSevereties: function() {
        this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
            model: 'Defect',
            field: 'Severity',

            fieldLabel: 'Severity :',
            labelAlign: 'right',
            listeners: {
                ready: function(combobox) {
                    this._LoadData();
                },
                select: function(combobox, records) {
                    this._LoadData();
                },
            scope: this
            }
        });

        this.pulldownContainer.add(this.severityComboBox);
    },

    // Laden van de Store en Data uit Rally
    _LoadData: function() {

        // tonen van de geselecteerde record (referentie)
        var selectedIterRef = this.iterComboBox.getRecord().get('_ref');
        console.log('Geselecteerde record bij Ready Event ', selectedIterRef);

        // checken wat je exact terugkrijgt vanuit de combobox (severity)
        //var selectedSeverityValue2 = this.severityComboBox.getRecord();
        //console.log('Sevirity combobox select record', selectedSeverityValue2);

        // ophalen waarde uit de sevirity combobox
        var selectedSeverityValue = this.severityComboBox.getRecord().get('value');

        // aanmaken van een array met filters die gebruikt kunnen worden in de store om de deze te kunnen filteren
        var myFilters = [
            // filter op Waarde  uit de Iteration combobox
            {
                property: 'Iteration',
                operation: '=',
                value: selectedIterRef
            },
            // filter op Waarde  uit de Sevirity combobox
            {
                property: 'Severity',
                operation: '=',
                value: selectedSeverityValue
            }
        ];

        // Bepalen of de store al bestaat.  Zoja refreshen, Zonee aanmaken
        if (this.defectStore) {

            this.defectStore.setFilter(myFilters);
            this.defectStore.load();
        } else {

            // Aanmaken van een Store  (records of data)
            this.defectStore = Ext.create('Rally.data.wsapi.Store', {
                // Welk type data wil je uit Rally halen
                model: 'defect',
                // Geeft aan dat er direct data wordt geladen nadat de store actief is geworden.
                autoLoad: true,
                // Filters geplaatst op de store.  
                filters: myFilters,
               // Events die worden uitgevoerd 
                listeners: {
                    load: function(myStore, myData, success) {
                        console.log("Data ontvangen", myStore, myData, success);

                    // opgehaalde data plaatsen in een Grid
                    // Op deze plaats zetten, anders wordt de grid niet geladen.
                    // Wel checken of de grid al is aangemaakt, anders krijg je 2 grids.
                        if (!this.myGrid) {                 // ! beteken ongelijk/niet aanwezig
                         this._createGrid(myStore)
                        }
                    },
                    
                    // app op zichtzelf toevoegen aan de load function zodat de Grid zal worden getoond. 
                    scope: this
                },
                // Aangeven welke velden je uit Rally wil halen.
                fetch: ['FormattedID', 'Name', 'Severity', 'Iteration']
            });
        }   
    },

    // Laden en tonen van de Grid
    _createGrid: function(myStoryStore) {
        this.myGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myStoryStore,
            columnCfgs: [
                // Kolomnamen moeten voorkomen in de fetch
                'FormattedID',
                'Name', 
                'Severity',
                'Iteration'
            ],
        });

        // Manier om te kijken wat je exact terugkrijgt vanuit Rally
        this.add(this.myGrid);
        console.log('Wat is dit: ', this);
        }

});


	
