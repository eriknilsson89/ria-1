define(['Backbone','Underscore',"jQuery","ListItemView"], function(Backbone,_,$,ListItemView){

	ListCollectionView = Backbone.View.extend({

        el: $("#container"),

        template: _.template($("#dataTemplate").html()),

        //Events
        events: {
            "keypress #newList": "createOnEnter",
            "keyup #newList": "updateCounter",
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
            if(title.length > 100)return;
            title = this.validate(title);
            this.collection.create({
                title: title,
                order: this.nextOrder()
            });
            this.$('#newList').val('');
            $('#listCounter').html('100');
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
          }        },
        updateCounter: function(e) {

            //if not a enter push, then change counter
            if(e.keyCode != 13){
                var title = $('#newList').val();
                var left = 100 - title.length;
                $('#listCounter').html(left);
            }
        }
    });

	return ListCollectionView;
});

