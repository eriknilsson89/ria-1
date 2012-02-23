
(function($) {
    window.List = Backbone.Model.extend({
		defaults: {
			id: _.isUndefined(this.id) ? this.id : null,
			title: '',
			order: '',
			status: 'unchecked',
		},
		
		//When all todos inside a list is done it automatically
		//get status checked.
		//Todo: toogle function for checked : unchecked
	});
    
    window.Lists = Backbone.Collection.extend({
        
        model: List,
        
        //Save lists to localstorage. Use url
		//pointing serverscript if you use a 
		//nosql database.	
        localStorage: new Store("lists"),  
		
		//This function maintain the collection
		//in sorting order.
		comparator: function(list) {
			return list.get('order');
		},
		
		//This function returns the finished lists. 
		getChecked: function() {
			return this.filter(function(list){ return list.get('checked'); });
		},
    });  
	
	window.listsview = Backbone.View.extend({
		
        tagName:  "li",
		
		template: _.template($('#tmpListItems').html()),
		
        events: {
			  "dblclick ..listItem span:nth-child(2)" : "edit",
			  "click ..listItem span:nth-child(2)" : "showTodoList",
			  "click .listItem span:nth-child(1)" : "clear",
			  "keypress .editListItem input" : "updateOnEnter",
			  "blur .editListItem input" : "close",
		},
 
        initialize: function(opt) {
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);
        },
        
        render : function () {
			$(this.el).html(this.template(this.model.toJSON()));
			this.setText();
			return this;
        },
		
		//When user click list title, we show them the todos
		//for that list.
		showTodoList: function() {
			console.log('Show me the list, please!');
		},
		
		//Set the list title
		setText: function() {
			this.$('.listItem span:nth-child(2)').text(this.model.get('title'));
		},
		
		//Switch classes hide and show functionallity.
		//Then give the inputfield focus.
		edit: function() {
			console.log('clicked a Title');
			this.$('.listItem').addClass('hide');
			this.$('.editListItem').addClass('editing');
			this.$('input').focus();
		},
		
		//Remove element from scene.
		remove: function() {
			$(this.el).remove();
		},
		
		//When the input(edit list title) loses focus, we make it
		//disappear with help of Css.
        close: function() {
			$('.listItem').removeClass('hide');
			$('.editListItem').removeClass('editing');
		},
		
		//Destroy this model
		clear: function() {
			this.model.destroy();
		},
		
		//Check if the user clicked Enter and then save if
		//the value in the input field is not empty. Remove the added classes 
		//to show and hide the correct fields.
        updateOnEnter: function(e) {
			if (e.keyCode == 13){
				if(this.$('input').val() != ''){
					this.model.save({title: this.$('input').val()});
				}
				this.$('.listItem').removeClass('hide');
				this.$('.editListItem').removeClass('editing', true);
			} 
        },
    });
	
    window.InitView = listsview.extend({
        
        el : $("#container"),
		
		template: _.template( $("#dataTemplate").html()),
		
        events: {
          "keypress #newList":  "createOnEnter"
        },
 
        initialize: function(opt) {
			_.bindAll(this,"render", "createOnEnter", 'addOne', 'addAll');
			this.collection.bind('add',   this.addOne, this);
			this.collection.bind('reset', this.addAll, this);
			this.collection.bind('change', this.render, this);
            this.collection.bind('all', this.render, this);	
			this.collection.fetch();
			
			//Todo: Remove this in production
			console.log(this.collection);
			
			//This handles the drag and drop functionality
			//with help of the, by default created, id.	
			this.$("#lists").sortable({
                update: function(event, ui) {
                    $('div.item',this).each(function(i){
                        var id = $(this).attr('list-id');
							console.log(id);
                            listItem = opt.collection.get(id);
							listItem.save({order: i + 1});
                    });
                }
            });
        },
        
        render : function () {
			this.$('#listsData').html(this.template({
				total:      this.collection.length,
				remaining:  this.collection.getChecked().length,
			}));
			return this;
        },
		
		addOne: function(list) {
			console.log("add one");
			var view = new listsview({model: list});
			console.log(view.render().el);
			$('#lists').append(view.render().el);
		},
		
		addAll: function() {
			console.log("add all");
			this.collection.each(this.addOne);
		},
        
        createOnEnter: function(e) {
			var title = $('#newList').val();
            if (!title || e.keyCode != 13) return;
            this.collection.create({title: title});
			$('#newList').val('');
			
        },
    });
	
	window.Flamingolist = Backbone.Router.extend({
        routes: {
            '': 'index'
        },
        
        initialize: function() {
			lists = new Lists();
            this.initView = new InitView({collection:  lists});
        },
        
        index: function() {
            this.initView.render();
        }
    });
	
	$(function(){
		flamingolist = new Flamingolist;
		Backbone.history.start();
	});
})(jQuery);

