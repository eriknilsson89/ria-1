define(["jQuery", 'Backbone','Underscore',], function($, Backbone, _){

ListItemView = Backbone.View.extend({
        tagName: "li",

        template: _.template($('#tmpList').html()),

        events: {
            "dblclick .listItem span:nth-child(2)": "edit",
            "click .listItem span:nth-child(1)": "clear",
            "keypress .editListItem input": "updateOnEnter",
            "blur .editListItem input": "close",
            "keyup .editListItem input": "updateCounter"
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
                    var string = this.validate(this.$('input').val());
                    if(string.length > 100) return;
                    //rensar undan eventuella HTML-taggar
                    string = this.validate(string);
                    this.model.save({
                        title: string,
                    });
                }
                this.close();
            }
        },
        validate: function(string) {
            if(string){
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
          }
        },
        updateCounter: function(e) {

            //if not a enter push, then change counter
            if(e.keyCode != 13){
                var title = this.$('.editListItem input').val();
                var left = 100 - title.length;
                $(this.$('.editListCounter')).html(left);
            }
        }
    });


	return ListItemView;
});

