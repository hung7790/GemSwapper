//This class is a particles engine. Used for the effect when pass a stage

import device;
import ui.ImageView as ImageView;
import ui.View;
import ui.Engine as Engine;
import ui.ParticleEngine as ParticleEngine;

exports = Class(ui.View, function(supr) {
    var PARTICLE_WIDTH = 30,
        PARTICLE_HEIGHT = 60,
        PARTICLE_R = -Math.PI / 18,
        PARTICLES = [
            "resources/images/particles/gleam_blue.png",
            "resources/images/particles/gleam_green.png",
            "resources/images/particles/gleam_purple.png",
            "resources/images/particles/gleam_red.png",
            "resources/images/particles/gleam_white.png",
            "resources/images/particles/round_blue.png",
            "resources/images/particles/round_green.png",
            "resources/images/particles/round_purple.png",
            "resources/images/particles/round_red.png",
            "resources/images/particles/round_white.png"
        ];
    this.init = function(opts) {
        opts = merge(opts, {
        });
        supr(this, 'init', [opts]);
        this.build();
    };
    // This is used by game screen class for show/hide particles
    this.showParticle = false;

    this.build = function() {
        this.pEngine = new ParticleEngine({
            parent: this,
            r: PARTICLE_R,
            width: PARTICLE_WIDTH,
            height: PARTICLE_HEIGHT,
            centerAnchor: true
        });
        gameEngine = Engine.get();
        gameEngine.on('Tick', bind(this, function(dt) {
            if (this.showParticle) {
                this.emitParticles();
            }
            this.pEngine.runTick(dt);
        }));
    }


    this.emitParticles = function() {
        var data = this.pEngine.obtainParticleArray(10);
        for (var i = 0; i < 10; i++) {
            var pObj = data[i];
            var ttl = Math.random() * 1200 + 400;
            var width = Math.random() * PARTICLE_WIDTH / 3 + 2 * PARTICLE_WIDTH / 3;
            var height = PARTICLE_HEIGHT * width / PARTICLE_WIDTH;

            pObj.image = PARTICLES[~~(Math.random() * PARTICLES.length)];
            pObj.x = Math.random() * 320 -40;
            pObj.y =  Math.random() * 360 + 80;
            pObj.dx = Math.random() * 50 - 25;
            pObj.dy = Math.random() * 150 - 75;
            pObj.width = width;
            pObj.height = height;
            pObj.opacity = 0.6;
            pObj.dopacity = -1000 / ttl;
            pObj.ddopacity = -Math.random() * 1000 / ttl;
            pObj.ttl = ttl;
        }
        this.pEngine.emitParticles(data);
    };
});
