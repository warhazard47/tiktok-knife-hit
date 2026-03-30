const config = {
    type: Phaser.AUTO,
    width: 360,
    height: 640,
    backgroundColor: "#1a1a1a",
    pixelArt: true,
    roundPixels: true,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let target;
let rotatingKnives = [];
let canThrow = true;
let speed;
let score = 0;
let scoreText;
let level = 1;
let levelText;
let radius = 60;

function preload() {
    this.load.image('knife', 'assets/knife.png');
    this.load.image('target', 'assets/target.png');
    this.load.image('bg', 'assets/bg.jpg');
}

function create() {
    // ✅ background (fix depth)
    this.bg = this.add.image(180, 320, 'bg').setDisplaySize(360, 640);
    this.bg.setDepth(-1);

    // RESET STATE 
    rotatingKnives = [];
    score = 0;
    level = 1;
    canThrow = true;
    speed = Phaser.Math.FloatBetween(0.02, 0.05);

    target = this.add.sprite(180, 250, 'target')
        .setScale(0.5)
        .setOrigin(0.5, 0.5);

    // ✅ tambahan (depth + radius aman)
    target.setDepth(0);
    radius = target.displayWidth * 0.5;

    this.knife = this.add.sprite(180, 550, 'knife')
        .setScale(1)
        .setOrigin(0.5, 1);

    // ✅ tambahan (biar selalu di atas)
    this.knife.setDepth(2);

    scoreText = this.add.text(20, 20, 'Score: 0', {
        fontSize: '18px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 4
    });

    levelText = this.add.text(260, 20, 'Lv: 1', {
        fontSize: '18px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 4
    });

    this.input.on('pointerdown', () => {
        if (!canThrow) return;

        canThrow = false;

        this.tweens.add({
            targets: this.knife,
            y: target.y,
            duration: 120,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                checkHit.call(this);
            }
        });
    });

    // subtle animation
    this.tweens.add({
        targets: target,
        scale: 0.52,
        duration: 800,
        yoyo: true,
        repeat: -1
    });

    this.input.on('pointerdown', () => {
    if (!canThrow) return;

    canThrow = false;

    this.tweens.add({
        targets: this.knife,
        y: target.y,
        duration: 120,
        onComplete: () => {
            checkHit.call(this);
        }
    });
});
}

function update() {
    target.angle += speed * 50;

    rotatingKnives.forEach(k => {
        k.angle += speed * 50;

        let rad = Phaser.Math.DegToRad(k.angle);
        k.x = target.x + Math.cos(rad) * radius;
        k.y = target.y + Math.sin(rad) * radius;
    });
}

function checkHit() {
    let hitAngle = Phaser.Math.Angle.Between(
        target.x,
        target.y,
        this.knife.x,
        this.knife.y
    );

    for (let k of rotatingKnives) {
        let existingAngle = Phaser.Math.DegToRad(k.angle);
        let diff = Math.abs(hitAngle - existingAngle);

        if (diff < 0.25) {
            fail.call(this);
            return;
        }
    }

    let newKnife = this.add.sprite(
        target.x + Math.cos(hitAngle) * radius,
        target.y + Math.sin(hitAngle) * radius,
        'knife'
    )
        .setScale(0.5)
        .setOrigin(0.5, 0);

    newKnife.angle = Phaser.Math.RadToDeg(hitAngle) + 180;

    // ✅ tambahan (depth biar di atas target)
    newKnife.setDepth(1);

    rotatingKnives.push(newKnife);

    // target pulse
    this.tweens.add({
    targets: target,
    scale: target.scale + 0.05,
    duration: 100,
    yoyo: true
    });

    // flash effect (quick brightness)
    target.setTint(0xffffff);

    this.time.delayedCall(50, () => {
    target.clearTint();
    });
    

    this.cameras.main.shake(100, 0.005);

    score++;
    scoreText.setText('Score: ' + score);

    if (score % 5 === 0) {
        level++;
        levelText.setText('Lv: ' + level);

        speed += 0.005;

        this.tweens.add({
            targets: levelText,
            scale: 1.5,
            duration: 150,
            yoyo: true
        });
    }

    this.knife.y = 550;
    this.knife.rotation = 0;
    canThrow = true;
}

function fail() {
    canThrow = false;

    this.cameras.main.shake(200, 0.01);

    this.tweens.add({
        targets: this.knife,
        y: 700,
        rotation: 4,
        duration: 300
    });

    let overText = this.add.text(90, 300, 'GAME OVER', {
        fontSize: '28px',
        fill: '#ff4444',
        stroke: '#000',
        strokeThickness: 6
    });

    this.tweens.add({
        targets: overText,
        scale: 1.2,
        duration: 300,
        yoyo: true
    });

    this.time.delayedCall(1000, () => {
        this.scene.restart();
    });
}

function showAd() {
    console.log("Rewarded Ad Triggered");
}

function shareGame() {
    console.log("Share Triggered");
}