pc.script.attribute('speed', 'number', 15, {
    min: 0.001,
    max: 360
});

pc.script.create('rotate', function (app) {
    var Rotate = function (entity) {
        this.entity = entity;
    };

    Rotate.prototype = {
        initialize: function () { },

        update: function (dt) {
            // rotate some degrees in a second
            this.entity.rotateLocal(this.speed * 0.6 * dt, this.speed * dt, 0);
        }
    };

    return Rotate;
});