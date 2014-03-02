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
            var key = _.map(combination, function (code) { 
                return String.fromCharCode(code).toLowerCase(); 
            });
            return key.sort();
        }

    });


    Braille.Application = Backbone.View.extend({
        templateName: 'mainTemplate',
        prev: null,
        lastPrint: 0,
        timeLimit: 500,  // miliseconds
        combinations: {
            //'': 0x2800,
            '1': 0x2801,
            '2': 0x2802,
            '12': 0x2803,                                                                                                                                                 
            '3': 0x2804,
            '13': 0x2805,
            '23': 0x2806,
            '123': 0x2807,
            '4': 0x2808,
            '14': 0x2809,
            '24': 0x280A,
            '124': 0x280B,
            '34': 0x280C,
            '134': 0x280D,
            '234': 0x280E,
            '1234': 0x280F,
            '5': 0x2810,
            '15': 0x2811,
            '25': 0x2812,
            '125': 0x2813,
            '35': 0x2814,
            '135': 0x2815,
            '235': 0x2816,
            '1235': 0x2817,
            '45': 0x2818,
            '145': 0x2819,
            '245': 0x281A,
            '1245': 0x281B,
            '345': 0x281C,
            '1345': 0x281D,
            '2345': 0x281E,
            '12345': 0x281F,
            '6': 0x2820,
            '16': 0x2821,            
            '26': 0x2822,
            '126': 0x2823,
            '36': 0x2824,
            '136': 0x2825,
            '236': 0x2826,
            '1236': 0x2827,
            '46': 0x2828,
            '146': 0x2829,
            '246': 0x282A,
            '1246': 0x282B,
            '346': 0x282C,
            '1346': 0x282D,
            '2346': 0x282E,
            '12346': 0x282F,
            '56': 0x2830,
            '156': 0x2831,
            '256': 0x2832,
            '1256': 0x2833,
            '356': 0x2834,
            '1356': 0x2835,
            '2356': 0x2836,
            '12356': 0x2837,
            '456': 0x2838,
            '1456': 0x2839,
            '2456': 0x283A,
            '12456': 0x283B,
            '3456': 0x283C,
            '13456': 0x283D,
            '23456': 0x283E,
            '123456': 0x283F,
        },
        prefix: '>>> ',
        space: ' &nbsp',
        text: [],
        keyMap: 'fdsjkl',
        outputSelector: 'p',

        initialize: function (options) {
            this.compileTemplate();
            this.input = new Braille.Input($('body'));
            this.outputSelector = options.outputSelector || this.outputSelector;
            this.listenTo(this.input, 'change', this.resolveCombination);
        },

        start: function () {
            this.render();
        },

        getContext: function () {
            return {keys: this.keyMap.split('')};
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
            this.output = this.$(this.outputSelector);
            this.output.html(this.prefix + this.text);
        },

        resolveCombination: function (comb) {
            var self = this;
            if (this.isBackSpace(comb)) {
                if (this.text.length > 0) {
                    this.text.pop();
                    this.output.html(this.prefix + this.text.join(''));
                }
                this.prev = null;
                return;
            }

            if (_.isEqual(this.prev, comb)) {
                var now = Date.now();
                if (now - this.lastPrint > this.timeLimit) {
                    this.lastPrint = now;

                    var newChar = this.isSpace(comb) ? this.space : this.getBrailleChar(comb); 

                    elem = $("<span>" + newChar + "</span>");
                    elem.hide();
                    self.output.append(elem);
                    elem.effect(
                        'highlight', 
                        {color: '#6495ED'}, 
                        500, 
                        function () {
                            elem.remove();
                            self.text.push(newChar);
                            self.output.html(self.prefix + self.text.join(''));
                    });
                }
            } else {
                this.prev = comb;
            }
        },

        getNumericCombination: function (combination) {
            //Get `123456`-like version of keys configured in `keyMap`
            var self = this;
            return _.map(combination, function (char) {
                return self.keyMap.indexOf(char) + 1;
            }).sort().join('');
        },

        getBrailleChar: function (combination) {
            var key = this.getNumericCombination(combination);
            return String.fromCharCode(this.combinations[key]); 
        },

        isSpace: function (combination) {
            return _.isEqual(combination, [' ']);
        },

        isBackSpace: function (combination) {
            return _.isEqual(combination, [String.fromCharCode(0x0008)]);  
        }

    });

});