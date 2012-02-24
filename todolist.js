(function ($) {
    ListModel = Backbone.Model.extend({
        defaults: {
            title: '',
            order: '',
            status: 'unchecked',
        },
    });

    TodoModel = Backbone.Model.extend({
        defaults: {
            listModelCid: '',
            todo: '',
            order: '',
            status: 'unchecked',
        },
    });

    ListCollection = Backbone.Collection.extend({

        model: ListModel,

        //Save lists to localstorage. Use url
        //pointing serverscript if you use a 
        //nosql database.	
        localStorage: new Store("lists"),

        //This function maintain the collection
        //in sorting order.
        comparator: function (list) {
            return list.get('order');
        },

        //This function returns the finished lists. 
        getChecked: function () {
            return this.filter(function (list) {
                return list.get('checked');
            });
        },
    });

    TodoCollection = Backbone.Collection.extend({

        model: TodoModel,

        //Save lists to localstorage. Use url
        //pointing serverscript if you use a 
        //nosql database.	
        localStorage: new Store("todos"),

        //This function maintain the collection
        //in sorting order.
        comparator: function (list) {
            return list.get('order');
        },

        getTodosOnCid: function (list, id) {
            return this.filter(function (list) {
                return list.get('listModelCid') == id;
            });
        },


        //This function returns the finished lists. 
        getChecked: function () {
            return this.filter(function (list) {
                return list.get('checked');
            });
        },
    });

    ListView = Backbone.View.extend({

        tagName: "li",

        template: _.template($('#tmpList').html()),

        events: {
            "dblclick .listItem span:nth-child(2)": "edit",
            "click .listItem span:nth-child(2)": "showTodos",
            "click .listItem span:nth-child(1)": "clear",
            "keypress .editListItem input": "updateOnEnter",
            "blur .editListItem input": "close",
        },

        //Listen if a model change or is deleted.
        initialize: function (opt) {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },

        //Render the template
        render: function () {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },

        //When user click list title, we show them the todos
        //for that list.
        showTodos: function (e) {
            //User click the list title
            //Display the todolist that is connected to that list model
            //User creates a todo and keypress Enter
            //save the todo with the cid of the correct list model
            //Loop each todos but display only the ones with the same
            //cid as the current list model.
            $('#hide').removeAttr('id');
            $('#todoContainer input').attr('id', 'newTodo');
            $('.todoItem').empty();
            todos = new TodoCollection();
            //Send the model so you can save the todos with the correct cid, to
            //connect it to a specific list.
            this.todosView = new TodosView({
                collection: todos,
                model: this.model
            });
            this.todosView.render();
        },

        //Switch classes hide and show functionallity.
        //Then give the inputfield focus.
        edit: function () {
            console.log('clicked a Title');
            this.$('.listItem').addClass('hide');
            this.$('.editListItem').addClass('editing');
            this.$('input').focus();
        },

        //Remove element from scene.
        remove: function () {
            $(this.el).remove();
        },

        //When the input(edit list title) loses focus, we make it
        //disappear with help of Css.
        close: function () {
            $('.listItem').removeClass('hide');
            $('.editListItem').removeClass('editing');
        },

        //Destroy this model
        clear: function () {
            this.model.destroy();
        },

        //Check if the user clicked Enter and then save if
        //the value in the input field is not empty. Remove the added classes 
        //to show and hide the correct fields.
        updateOnEnter: function (e) {
            if (e.keyCode == 13) {
                if (this.$('input').val() != '') {
                    this.model.save({
                        title: this.$('input').val(),
                    });
                }
                this.close();
            }
        },
    });

    TodoView = Backbone.View.extend({

        tagName: "li",

        template: _.template($('#tmpTodo').html()),

        events: {
            "dblclick .todoItem span:nth-child(2)": "edit",
            "click .todoItem span:nth-child(1)": "clear",
            "keypress .editTodoItem input": "updateOnEnter",
            "blur .editTodoItem input": "close",
        },

        //Listen if a model change or is deleted.
        initialize: function (opt) {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },

        //Render the template
        render: function () {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },

        //Switch classes hide and show functionallity.
        //Then give the inputfield focus.
        edit: function () {
            this.$('.todoItem').addClass('hide');
            this.$('.editTodoItem').addClass('editing');
            this.$('input').focus();
        },

        //Remove element from scene.
        remove: function () {
            $(this.el).remove();
        },

        //When the input(edit list title) loses focus, we make it
        //disappear with help of Css.
        close: function () {
            $('.todoItem').removeClass('hide');
            $('.editTodoItem').removeClass('editing');
        },

        //Destroy this model
        clear: function () {
            this.model.destroy();
        },


        //Check if the user clicked Enter and then save if
        //the value in the input field is not empty. Remove the added classes 
        //to show and hide the correct fields.
        updateOnEnter: function (e) {
            if (e.keyCode == 13) {
                if (this.$('input').val() != '') {
                    this.model.save({
                        todo: this.$('input').val()
                    });
                }
                this.close();
            }
        },
    });

    ListsView = Backbone.View.extend({

        el: $("#container"),

        template: _.template($("#dataTemplate").html()),

        //Events
        events: {
            "keypress #newList": "createOnEnter"
        },

        initialize: function (opt) {
            _.bindAll(this, "render", "createOnEnter", 'addOne', 'addAll');
            this.collection.bind('add', this.addOne, this);
            this.collection.bind('reset', this.addAll, this);
            this.collection.bind('change', this.render, this);
            this.collection.bind('all', this.render, this);
            this.collection.fetch();

            //Todo: Remove this in production
            console.log('this is the list collection.');
            console.log(this.collection);

            //This handles the drag and drop functionality
            //with help of the, by default created, cid.	
            this.$("#lists").sortable({
                update: function (event, ui) {
                    $('div.item', this).each(function (i) {
                        var cid = $(this).attr('list-cid');
                        console.log(opt);
                        listItem = opt.collection.getByCid(cid);
                        listItem.save({
                            order: i + 1
                        });
                    });
                }
            });
        },

        render: function () {
            this.$('#listsData').html(this.template({
                total: this.collection.length,
                remaining: this.collection.getChecked().length,
            }));
            return this;
        },

        addOne: function (list) {
            console.log("add one");
            var view = new ListView({
                model: list
            });
            console.log(view.render().el);
            this.$('#lists').append(view.render().el);
        },

        addAll: function () {
            console.log("add all");
            this.collection.each(this.addOne);
        },

        createOnEnter: function (e) {
            var title = $('#newList').val();
            if (!title || e.keyCode != 13) return;
            this.collection.create({
                title: title
            });
            this.$('#newList').val('');
        },
    });

    TodosView = Backbone.View.extend({

        el: $("#container"),

        template: _.template($("#todoDataTemplate").html()),

        //Events
        events: {
            "keypress #newTodo": "createOnEnter"
        },

        initialize: function (opt) {

            _.bindAll(this, "render", "createOnEnter", 'addOne', 'addAll');
            this.collection.bind('add', this.addOne, this, opt.model.cid);
            this.collection.bind('reset', this.addAll, this);
            this.collection.bind('change', this.render, this);
            this.collection.bind('all', this.render, this);

            console.log('fetch');
            this.collection.fetch();

            console.log('this is the list collection.');
            console.log(this.collection);

            //Filter items on the id of the model clicked.
            //var sortedTodos = this.getByListModelCid(this.collection.models, opt.model.cid);
            //This handles the drag and drop functionality
            //with help of the, by default created, cid.	
            this.$("#todos").sortable({
                update: function (event, ui) {
                    $('div.todo', this).each(function (i) {
                        var cid = $(this).attr('todo-cid');
                        console.log(opt);
                        listItem = opt.collection.getByCid(cid);
                        listItem.save({
                            order: i + 1
                        });
                    });
                }
            });
        },

        render: function () {
            //Changed from #todosData
            sorted = this.collection.getTodosOnCid(this, this.model.cid);

            this.$('#todosData').html(this.template({
                total: sorted.length,
                remaining: this.collection.getChecked().length,
            }));
            return this;
        },

        //This function takes collection.models and an id.
        //It returns all the items with the listByModelCid id.
        getByListModelCid: function (todos) {
            return this.collection.filter(function (todos) {
                return todos.get("listModelCid") === todos.model.cid;
            });
        },

        addOne: function (todo) {

            var view = new TodoView({
                model: todo
            });
            console.log('add one');
            this.$('#todos').append(view.render().el);
        },

        //Get the clicked models cid and sort out the todos for that list.
        //Create a new view for each.
        addAll: function () {

            sorted = this.collection.getTodosOnCid(this, this.model.cid);
            console.log('You clicked model cid ' + this.model.cid);
            console.log(sorted);

            _.each(sorted, function (todos, key) {

                var view = new TodoView({
                    model: todos
                });
                console.log('add one');
                this.$('#todos').append(view.render().el);
            });
        },

        createOnEnter: function (e) {
            //Todo: what happens here? this.model.cid
            console.log('works here ' + this.model.cid);
            var todo = $('#newTodo').val();
            if (!todo || e.keyCode != 13) return;

            console.log('but not here... ' + this.model.cid);
            console.log(this);
            this.collection.create({
                todo: todo,
                listModelCid: this.model.cid
            });
            this.$('#newTodo').val('');
        },
    });

    TodoList = Backbone.Router.extend({
        routes: {
            '': 'index'
        },

        initialize: function () {
            lists = new ListCollection();
            this.listsView = new ListsView({
                collection: lists
            });
            //Todo: 
            /*todos = new TodoCollection();
			this.todosView = new TodosView({
				collection: todos 
			});*/
        },

        index: function () {
            this.listsView.render();
            //this.todosView.render();
        }
    });

    $(function () {
        new TodoList;
        Backbone.history.start();
    });
})(jQuery);