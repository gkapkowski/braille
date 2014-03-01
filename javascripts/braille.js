$(function(){


    Braille = {};

    Braille.Input = function (root) {
        this.initialize.apply(this, arguments);
    };

    _.extend(Braille.Input.prototype, Backbone.Events, {
        pressedKeys: {},

        initialize: function (root) {
            this.root = root;
            _(this).bindAll('keydown', 'keyup', 'getCurrentKeyCodes');
            $(this.root).keydown(this.keydown);
            $(this.root).keyup(this.keyup);
        },

        keydown: function (event) {
            this.pressedKeys[event.keyCode] = true;
            this.trigger('change', this.getCurrentKeyCodes());
        },

        keyup: function (event) {
            this.pressedKeys[event.keyCode] = false;
            this.trigger('change', this.getCurrentKeyCodes());
        },

        getCurrentKeyCodes: function () {
            var self = this;
            var combination = _.filter(_.keys(this.pressedKeys), function (keycode) { 
                return self.pressedKeys[keycode];
            });
            var key = _.map(combination, function (code) { return String.fromCharCode(code); });
            return key.sort().join('').toLowerCase();
        }

    });


    Braille.Application = Backbone.View.extend({
        templateName: 'mainTemplate',
        prev: null,
        lastPrint: 0,
        timeLimit: 500,  // miliseconds
        combinations: {
            b: 0x2820,
            bc: 0x2824,
            bcm: 0x282C,
            bcmn: 0x283C,
            bcmnx: 0x283E,
            bcmnxz: 0x283F,
            bcmnz: 0x283D,
            bcmx: 0x282E,
            bcmxz: 0x282F,
            bcmz: 0x282D,
            bcn: 0x2834,
            bcnx: 0x2836,
            bcnxz: 0x2837,
            bcnz: 0x2835,
            bcx: 0x2826,
            bcxz: 0x2827,
            bcz: 0x2825,
            bm: 0x2828,
            bmn: 0x2838,
            bmnx: 0x283A,
            bmnxz: 0x283B,
            bmnz: 0x2839,
            bmx: 0x282A,
            bmxz: 0x282B,
            bmz: 0x2829,
            bn: 0x2830,
            bnx: 0x2832,
            bnxz: 0x2833,
            bnz: 0x2831,
            bx: 0x2822,
            bxz: 0x2823,
            bz: 0x2821,
            c: 0x2804,
            cm: 0x280C,
            cmn: 0x281C,
            cmnx: 0x281E,
            cmnxz: 0x281F,
            cmnz: 0x281D,
            cmx: 0x280E,
            cmxz: 0x280F,
            cmz: 0x280D,
            cn: 0x2814,
            cnx: 0x2816,
            cnxz: 0x2817,
            cnz: 0x2815,
            cx: 0x2806,
            cxz: 0x2807,
            cz: 0x2805,
            m: 0x2808,
            mn: 0x2818,
            mnx: 0x281A,
            mnxz: 0x281B,
            mnz: 0x2819,
            mx: 0x280A,
            mxz: 0x280B,
            mz: 0x2809,
            n: 0x2810,
            nx: 0x2812,
            nxz: 0x2813,
            nz: 0x2811,
            x: 0x2802,
            xz: 0x2803,
            z: 0x2801,
        },
        prefix: '>>> ',
        text: '',

        initialize: function () {
            this.compileTemplate();
            this.input = new Braille.Input($('body'));
            this.listenTo(this.input, 'change', this.resolveCombination);
        },

        start: function () {
            this.render();
        },

        getContext: function () {
            return {};
        },

        getTemplate: function () {
            return $('#'+this.templateName);
        },

        compileTemplate: function () {
            this._template = swig.compile(this.getTemplate().html());
        },

        renderTemplate: function () {
            return this._template(this.getContext());
        },

        render: function () {
            this.$el.html(this.renderTemplate());
        },

        resolveCombination: function (combination) {
            if (_.isEqual(this.prev, combination)) {
                var now = Date.now();
                if (now - this.lastPrint > this.timeLimit) {
                    this.lastPrint = now;
                    this.text += String.fromCharCode(this.combinations[combination]);
                    this.$el.html(this.prefix + this.text);
                }
            } else {
                this.prev = combination;
            }
        }

    });

    var App = new Braille.Application({
        el: $('section')
    });
    App.start();

});