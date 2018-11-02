
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

    items: [
        {    
        xtype: 'container',             // defineren van een container via xtype.  fullname is : Ext.container.Container
        itemId:'pulldown-container',    // deze container geeft ons controle over de layout van de comboboxen
        layout: {
            type: 'hbox',
            align: 'stretch'
            }
        }
    ],


    // aangeven welke objecten er op de app aanwezig zijn, beter leesbaarheid wanneer iemand er naar kijkt.
    defectStore: undefined,
    myGrid: undefined,

    launch: function() {

	// melding schrijven naar de console van de browser	
	console.log('Starten van de applicatie');
 
    this._loadIterations();

    },


    // Laden van de Iterations combobox
    _loadIterations() {
        var me = this;                              // Gebruik me om aan te geven dat je verwijst naar de app (hoogste niveau)

        var iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox' , {
            itemId: 'iteration-combobox',
            // Naam en positie van de label voor de Combobox
            fieldLabel: 'Iteration :',
            labelAlign: 'right',

            // Breedte van de combobox aanpassen zodat alle data wordt getoond. 
            width: 400,

            listeners: {
                ready: me._onIterationsReady,     // event wanneer de combobox is opgebouwd.
                                                    // omdat er data wordt doorgegeven dan ook this._LoadServerities hier worden neergezet
                select: me._LoadData,             // event wanneer er data wordt geselecteerd.
                scope: me
            }

        });
        // Tonen van de Combobox op het scherm  (app niveau)
        //this.add(this.iterComboBox);

        // Tonen van de Combobox in de pulldownContainer
        //this.pulldownContainer.add(this.iterComboBox);

        // this is de app en met down gaan we in de app zoeken
        //var container = this.down('#pulldown-container');
        //console.log('Gezochte container met down', container);
        me.down('#pulldown-container').add(iterComboBox);

    },


    _onIterationsReady: function(combobox, eOpts) {
        var me = this;
        me._LoadSeverities();
    },


    // Laden van de Combobox Severities
    _LoadSeverities: function() {
        var me = this;

        var severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
            itemId: 'severity-combobox',
            model: 'Defect',
            field: 'Severity',

            fieldLabel: 'Severity :',
            labelAlign: 'right',
            listeners: {
                ready: me._LoadData,
                select: me._LoadData,
                scope: me
            }
        });

        me.down('#pulldown-container').add(severityComboBox);
    },

    // Aanmaken van de filters voor de Grid met de iteration & sevirity waardes
    _getFilters: function(iterationValue, severityValue) {
        // aanmaken van filter op de Iteration Combobox
        var iterationFilter = Ext.create('Rally.data.wsapi.Filter' , {
                property: 'Iteration',
                operation: '=',
                value: iterationValue
        });
        //console.log('Iteration filter' , iterationFilter, iterationFilter.toString());

        // aanmaken van een filter op de Severity Combobox
        var severityFilter = Ext.create('Rally.data.wsapi.Filter', {
                property: 'Severity',
                operation: '=',
                value: severityValue
        });


        // aanmaken van een extra filter 
        var blockedFilter = Ext.create('Rally.data.wsapi.Filter', {
                property: 'Blocked',
                operation: '=',
                value: true
        });

        // Aan elkaar koppelen van de filters
        // in dit geval via een AND  Zie Rally.data.wsapi.Filter voor meer opties zoals OR
        return iterationFilter.and(severityFilter);

        // Koppelen van meerdere filters met een OR optie
        // Wordt verder niet gebruikt in de app maar staat er als een voorbeeld.
        //var myComboFilters = blockedFilter.or(myFilters);
        //console.log('My filters gecombineerd', myComboFilters.toString());

    },

    // Laden van de Store en Data uit Rally
    _LoadData: function() {
        var me = this;
        console.log('Wie is me', me); 

        // tonen van de geselecteerde record (referentie)
        var selectedIterRef = me.down('#iteration-combobox').getRecord().get('_ref');
        // ophalen waarde uit de sevirity combobox
        var selectedSeverityValue = me.down('#severity-combobox').getRecord().get('value');

        var myFilters = me._getFilters(selectedIterRef, selectedSeverityValue);
        console.log('mijn Filters', myFilters.toString())



        // Bepalen of de store al bestaat.  Zoja refreshen, Zonee aanmaken
        if (me.defectStore) {

            me.defectStore.setFilter(myFilters);
            me.defectStore.load();
        } else {

            // Aanmaken van een Store  (records of data)
            me.defectStore = Ext.create('Rally.data.wsapi.Store', {
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
                        if (!me.myGrid) {                 // ! beteken ongelijk/niet aanwezig
                         me._createGrid(myStore)
                        }
                    },
                    
                    // app op zichtzelf toevoegen aan de load function zodat de Grid zal worden getoond. 
                    scope: me
                },
                // Aangeven welke velden je uit Rally wil halen.
                fetch: ['FormattedID', 'Name', 'Severity', 'Iteration']
            });
        }   
    },

    // Laden en tonen van de Grid
    _createGrid: function(myStoryStore) {
        var me = this;
        
        me.myGrid = Ext.create('Rally.ui.grid.Grid', {
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
        me.add(me.myGrid);
        console.log('Wat is dit: ', me);
        }

});


	
