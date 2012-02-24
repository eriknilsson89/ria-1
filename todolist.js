(function ($) {


    /**********************************************************************************************
     *
     * Implementera:
     *		När en lista tas bort skall alla todos också raderas
     *		När en lista är vald skall den markeras
     *		Spara i en databas
     *		När man klickar på en todo skall den genomstrykas och ändra status till checked
     *
     **********************************************************************************************/

    ListModel = Backbone.Model.extend({
        defaults: {
            status: 'unchecked',
        },
    });

    TodoModel = Backbone.Model.extend({
        defaults: {
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

        //Return only the lists that has requested id
        getTodosByCid: function (list, id) {
            return this.filter(function (list) {
                return list.get('listModelId') == id;
            });
        },

        //This function returns the finished lists. 
        getChecked: function () {
            return this.filter(function (list) {
                return list.get('checked');
            });
        },
    });


    ListItemView = Backbone.View.extend({
        tagName: "li",

        template: _.template($('#tmpList').html()),

        events: {
            "dblclick .listItem span:nth-child(2)": "edit",
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

        //Switch classes hide and show functionallity.
        //Then give the inputfield focus.
        edit: function () {
            this.$('.listItem').addClass('hide');
            this.$('.editListItem').addClass('editing');
            this.$('input').focus();
        },

        //Remove element from scene.
        remove: function () {
            $(this.el).remove();
        },

        //When the input(edit listtitle) loses focus, we make it
        //disappear with the help of Css.
        close: function () {
            $('.listItem').removeClass('hide');
            $('.editListItem').removeClass('editing');
        },

        //Destroy this model
        clear: function () {
            this.model.destroy();
        },

        //Check if the user clicked Enter and then save if
        //a value exists in the input field. Remove the added classes 
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

        //Count collection and return the lenght
        nextOrder: function () {
            if (!this.length) return 1;
            return this.collection.lenght + 1;
        },

        //Check if the user clicked enter and then save if
        //a value exists in the input. Remove the added classes 
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

    ListCollectionView = Backbone.View.extend({

        el: $("#container"),

        template: _.template($("#dataTemplate").html()),

        //Events
        events: {
            "keypress #newList": "createOnEnter",
            "click .listItem span:nth-child(2)": "showList" // flyttad till ListCollectionView
        },

        //Send upwards in backbone hierarchy. Let the router handle it!
        showList: function (e) {
            cid = $(e.target).parent().parent().attr("list-cid");
            this.trigger("showlist", cid);
        },

        initialize: function (opt) {
            _.bindAll(this, "render", "createOnEnter", 'addOne', 'addAll');
            this.collection.bind('add', this.addOne, this);
            this.collection.bind('reset', this.addAll, this);
            this.collection.bind('change', this.render, this);
            this.collection.bind('all', this.render, this);
            this.collection.fetch();

            //This handles the drag and drop functionality
            //with help of the, by default created, cid.	
            this.$("#lists").sortable({
                update: function (event, ui) {
                    $('div.item', this).each(function (i) {
                        var cid = $(this).attr('list-cid');
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

        //Render one item
        addOne: function (list) {
            var view = new ListItemView({
                model: list
            });
            this.$('#lists').append(view.render().el);
        },

        //Render all the items in list
        addAll: function () {
            this.collection.each(this.addOne);
        },

        //Count collection and return the lenght
        nextOrder: function () {
            if (!this.collection.length) return 1;
            return this.collection.length + 1;
        },

        //Create a new item in list
        createOnEnter: function (e) {
            var title = $('#newList').val();
            if (!title || e.keyCode != 13) return;
            this.collection.create({
                title: title,
                order: this.nextOrder()
            });
            this.$('#newList').val('');
        },
    });

    FullListView = Backbone.View.extend({

        el: $("#container"),

        template: _.template($("#todoDataTemplate").html()),

        //Events
        events: {
            "keypress #newTodo": "createOnEnter"
        },

        initialize: function (opt) {

            _.bindAll(this, "render", "createOnEnter", 'addOne', 'addAll');
            this.collection.bind('add', this.addOne, this);
            this.collection.bind('reset', this.addAll, this);
            this.collection.bind('change', this.render, this);
            this.collection.bind('all', this.render, this);
            this.collection.fetch();

            //This handles the drag and drop functionality
            //with help of the, by default created, cid.	
            this.$("#todos").sortable({
                update: function (event, ui) {
                    $('div.todo', this).each(function (i) {
                        var cid = $(this).attr('todo-cid');
                        listItem = opt.collection.getByCid(cid);
                        listItem.save({
                            order: i + 1
                        });
                    });
                }
            });
        },

        render: function () {
            sorted = this.collection.getTodosByCid(this, list.id);
            this.$('#todosData').html(this.template({
                total: sorted.length,
                remaining: this.collection.getChecked().length,
            }));
            return this;
        },

        addOne: function (todo) {

            var view = new TodoView({
                model: todo
            });
            this.$('#todos').append(view.render().el);
        },

        //Get the clicked models id and sort out the todos for that list.
        //Create a new view for each.
        addAll: function () {

            sorted = this.collection.getTodosByCid(this, list.id);
            _.each(sorted, function (todos, key) {

                var view = new TodoView({
                    model: todos
                });
                this.$('#todos').append(view.render().el);
            });
        },

        nextOrder: function () {
            if (!this.collection.length) return 1;
            return this.collection.length + 1;
        },

        createOnEnter: function (e) {
            var todo = $('#newTodo').val();
            if (!todo || e.keyCode != 13) return;

            this.collection.create({
                todo: todo,
                listModelId: list.id,
                order: this.nextOrder()
            });
            this.$('#newTodo').val('');
        },
    });

    TodoList = Backbone.Router.extend({
        routes: {
            '': 'index'
        },

        initialize: function () {
            this.lists = new ListCollection();
            this.listCollectionView = new ListCollectionView({
                collection: this.lists
            });
            this.listCollectionView.bind("showlist", this.showList, this);
        },

        index: function () {
            this.listCollectionView.render();
        },

        //When user click list title, we show them the todos
        //for that list.
        showList: function (cid) {
            list = this.lists.getByCid(cid);

            $('#hide').removeAttr('id');
            $('#todoContainer input').attr('id', 'newTodo');
            $('.todoItem').empty();
            todos = new TodoCollection();
            //Send the model so you can save the todos with the correct id, to
            //connect it to a specific list.
            this.todosView = new FullListView({
                collection: todos,
                model: list
            });
            this.todosView.render();
        },
    });

    $(function () {
        new TodoList;
        Backbone.history.start();
    });
})(jQuery);