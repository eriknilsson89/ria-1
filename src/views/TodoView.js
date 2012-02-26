define(['Backbone','Underscore',"jQuery"], function(Backbone,_, $){

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

	return TodoView;
});

