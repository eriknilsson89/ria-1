define(['Backbone','Underscore',"jQuery" ,"TodoView"], function(Backbone,_,$, TodoView){

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
            todo = this.validate(todo);
            this.collection.create({
                todo: todo,
                listModelId: list.id,
                order: this.nextOrder()
            });
            this.$('#newTodo').val('');
        },
        validate: function(string) {            if(string){
               var mydiv = document.createElement("div");
               mydiv.innerHTML = string;
 
                if (document.all) // IE Stuff
                {
                    return mydiv.innerText;
               
                }   
                else // Mozilla does not work with innerText
                {
                    return mydiv.textContent;
                }                           
          }        }
    });

	return FullListView;
});
