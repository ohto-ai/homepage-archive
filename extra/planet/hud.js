pc.script.attribute('html', 'asset', [ ], {
    max: 1,
    type: 'html'
});

pc.script.attribute('css', 'asset', [ ], {
    max: 1,
    type: 'css'
});

pc.script.create('hud', function (app) {
    // Creates a new Hud instance
    var Hud = function (entity) {
        this.entity = entity;
    };

    Hud.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        // get assets from attributes
            this.assetHtml = app.assets.get(this.html);
            this.assetCss = app.assets.get(this.css);
            
            // div element
            this.element = document.createElement('div');
            this.element.id = 'login';
            document.body.appendChild(this.element);
            // set resource if already available
            if (this.assetHtml.resource)
                this.element.innerHTML = this.assetHtml.resource;
            // when source changes, update
            this.assetHtml.on('load', function(asset) {
                this.element.innerHTML = asset.resource;
            }, this);
            
            // style element
            this.style = document.createElement('style');
            document.head.appendChild(this.style);
            // set resource if available
            if (this.assetCss.resource)
                this.style.innerHTML = this.assetCss.resource;
            // when source changes, update
            this.assetCss.on('load', function(asset) {
                this.style.innerHTML = asset.resource;
            }, this);
        }
    };

    return Hud;
});
