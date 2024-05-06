class CharacterSelect extends Phaser.Scene {
    constructor() {
        super('CharacterSelect');
        this.thumbnails = [];
        this.selectedIndex = -1;
        this.cursorKeys = null;
        this.moveDelay = 200;
        this.lastMoveTime = 0;
        this.bgm;
        this.characters = {};
        this.selectedCharacterName;
        this.descriptionText;

        this.descriptionContainer;
        
        this.backWidth;
        this.backHeight;
    }

    preload() {
        this.load.image('selectBackground', "assets/background/space0506.jpg");
        this.load.image('megamanThumb', "assets/characterThumbnail/megaman2.png");
        this.load.image('linkThumb', "assets/characterThumbnail/link3.png");
        this.load.image('kirbyThumb', "assets/characterThumbnail/kirby.png");
        this.load.image('sonicThumb', "assets/characterThumbnail/sonic.png");
        this.load.image('bulletkingThumb', "assets/characterThumbnail/bulletking.png");
        this.load.image('redThumb', "assets/characterThumbnail/red.png");
        this.load.spritesheet('playButton', 'assets/buttons/playButton.png', { frameWidth: 726, frameHeight: 452 });

        
        //this.load.image('selectBackground', "assets/background/helloWorldBG.gif");
        

        this.load.json('characters', 'js/character/character.json');

        this.load.audio('Bubble-clickBGM', 'assets/sounds/Bubble-click.mp3');
        this.load.audio('Game-selectBGM', 'assets/sounds/Game-select.mp3');
    }

    create(data) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.bgm = data.lobyBGM;

        // 사운드
        this.moveBgm = this.sound.add('Bubble-clickBGM', {volume: 0.3});
        this.choiceBgm = this.sound.add('Game-selectBGM', {volume: 0.3});

        this.characters = this.cache.json.get('characters');

        let background = this.add.image(centerX ,centerY, 'selectBackground')
            .setOrigin(0.5)
            .setDepth(0);

        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.backWidth = background.displayWidth;
        this.backHeight = background.displayHeight;

        this.createThumbnails();

        this.createDescriptionContainer();
        
        this.cursorKeys = this.input.keyboard.createCursorKeys();

        // 키업 or 키다운 뭘로 할 지 고민해봐야할듯?
        this.input.keyboard.on('keydown-SPACE', this.startSelectedCharacterStage, this);
        this.input.keyboard.on('keydown-ENTER', this.startSelectedCharacterStage, this);
    }

    createDescriptionContainer() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const containerWidth = this.backWidth * 0.9;
        const containerHeight = this.backHeight * 0.5;

        const containerX = centerX - containerWidth / 2;
        const containerY = centerY - containerHeight / 2;

        this.descriptionContainer = this.add.container(containerX, containerY);

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.7);
        graphics.fillRect(0, 0, containerWidth, containerHeight);
        this.descriptionContainer.add(graphics);

        this.titleText = this.add.text(
            containerWidth * 0.5, 
            containerHeight * 0.08,
            '캐릭터 설명',
            { fill: '#ffffff', fontSize: '30px', align: 'center' }
        );
        this.titleText.setOrigin(0.5, 0);

        this.descriptionText = this.add.text(
            containerWidth * 0.5,
            containerHeight * 0.3,
            '',
            { fill: '#ffffff', fontSize: '18px', align: 'left', wordWrap: { width: containerWidth * 0.4 }, lineSpacing: containerHeight * 0.032 }
        );
        this.descriptionText.setOrigin(0, 0);

        this.statsContainer = this.add.container(0, 100);

        this.descriptionContainer.add([this.descriptionText, this.titleText, this.statsContainer]);
    }

    createThumbnails() {
        
        console.log(this.cameras.main.width);
        console.log(this.backWidth);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        let thumbnailWidth = width * 1/7;
        
        let spacing = thumbnailWidth * 1/9;

        if(thumbnailWidth > 200) {
            thumbnailWidth = 200;
            spacing = (Math.floor(width - (thumbnailWidth * 7))) * 1/6;
        }

        let thumbnailHeight = thumbnailWidth;

        // 142 142 15.8

        // 274.28 274.28 30.4



        const startButton = this.add.sprite(width / 2, height * 0.85, 'playButton', 0)
            .setOrigin(0.5)
            .setInteractive()
            .setScale(0.2);

        startButton.on('pointerover', () => {
            startButton.setFrame(1);
        });

        startButton.on('pointerout', () => {
            startButton.setFrame(0);
        });

        startButton.on('pointerdown', () => {
            this.startSelectedCharacterStage();
        });
    
        const totalThumbnails = 6;
        this.thumbnails = ['megamanThumb', 'linkThumb', 'kirbyThumb', 'sonicThumb', 'bulletkingThumb', 'redThumb'].map((thumbnailKey, index) => {
                
            const containerWidth = 0;

            const containerX = (width - containerWidth) / 10;
            const containerY = height / 7;
            const characterContainer = this.add.container(containerX + index * (width * 1/6)-20, containerY);


    
            const characterThumbnail = this.add.image(0, 0, thumbnailKey)
                .setInteractive()

    
            characterThumbnail.setScale(thumbnailWidth / characterThumbnail.width, thumbnailHeight / characterThumbnail.height);
            characterThumbnail.setData('index', index);
    

            const characterGraphics = this.add.graphics();
            characterGraphics.lineStyle(2, 0xffffff);
            characterGraphics.strokeRect(
                -thumbnailWidth / 2,
                -thumbnailHeight / 2,
                thumbnailWidth,
                thumbnailHeight
            );

            characterThumbnail.on('pointerdown', () => {
                this.handleThumbnailClick(characterThumbnail);
            });
    
            characterContainer.add([characterThumbnail, characterGraphics]);
            this.add.existing(characterContainer);

            return characterThumbnail;
        });
    }
    
    handleThumbnailClick(characterThumbnail) {
        this.selectedIndex = characterThumbnail.getData('index');

        this.moveBgm.play();

        this.highlightSelectedThumbnail();

        this.updateCharacterDescription();
    }

    updateCharacterDescription() {
        this.selectedCharacterName = this.getCharacterNameByIndex(this.selectedIndex);

        const description = this.characters[this.selectedCharacterName].description;
        this.descriptionText.setText(description);

        const stats = this.characters[this.selectedCharacterName].descriptionStats;

        this.updateCharacterStats(stats);
    }

    updateCharacterStats(stats){
        const statKeys = Object.keys(stats);

        const statWidth = this.backWidth * 0.02;
                            // == this.backHeight * 0.023
        const statHeight = this.backWidth * 0.02;
        const statTextSpacing = this.backHeight * 0.058

        let yPos = this.backHeight * 0.056;

        statKeys.forEach((key, index) => {
            const statValue = stats[key];

            const statText = this.add.text(10, yPos, `${key}:`, { fill: '#ffffff', fontSize: '22px' });
            this.statsContainer.add(statText);

            for (let i = 0; i < 10; i++) {
                const fillStyle = i < statValue ? 0x00ff00 : 0x000000;
                const rect = this.add.rectangle(statWidth * 6 + i * (statWidth + 2), yPos, statWidth, statHeight, fillStyle);
                rect.setOrigin(0);
                this.statsContainer.add(rect);
            }

            yPos += statTextSpacing;
        });

    }

    highlightSelectedThumbnail() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        let thumbnailWidth = width * 1/7;
        
        let spacing = thumbnailWidth * 1/9;

        if(thumbnailWidth > 200) {
            thumbnailWidth = 200;
            spacing = (Math.floor(width - (thumbnailWidth * 7))) * 1/6;
        }

        let thumbnailHeight = thumbnailWidth;

        this.thumbnails.forEach((thumbnail, index) => {
            const container = thumbnail.parentContainer;
            if (container && container.list.length >= 2) {
                const graphics = container.list[1];
    
                if (index === this.selectedIndex) {
                    graphics.clear();
                    graphics.lineStyle(4, 0xff0000); // 빨간색 테두리 두께 4px
                    graphics.strokeRect(
                        -thumbnailWidth/ 2,
                        -thumbnailHeight / 2,
                        thumbnailWidth,
                        thumbnailHeight
                    );
                } else {
                    graphics.clear();
                    graphics.lineStyle(2, 0xffffff); // 흰색 테두리 두께 2px
                    graphics.strokeRect(
                        -thumbnailWidth/ 2,
                        -thumbnailHeight / 2,
                        thumbnailWidth,
                        thumbnailHeight
                    );
                }
            }
        });
    }
    
    startSelectedCharacterStage() {
        this.choiceBgm.play();

        let selectedCharacterName = null;
        if(this.selectedIndex != -1) {
            this.selectedCharacterName = this.getCharacterNameByIndex(this.selectedIndex);
        } else {  
            const messageText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '캐릭터를 선택해주세요!!', {
                fontSize: '36px',
                fill: '#fff',
                alpha: 0
            }).setOrigin(0.5);

            this.tweens.add({
                targets: messageText,
                alpha: 1, 
                duration: 500,
                ease: 'Power2',
                yoyo: true,
                delay: 500, 
                onComplete: () => {
                    this.tweens.add({
                        targets: messageText,
                        alpha: 0,
                        duration: 1000,
                        delay: 1200,  
                        onComplete: () => {  
                            messageText.destroy();
                        }
                    });
                }
            });
        }
    
        // 여긴 초기화도 잘 해놨고 선택된 캐릭터 이름 잘 보냄.
        if (this.selectedCharacterName != null) {
            this.bgm.stop();
            this.scene.stop();
            this.scene.start('StageSuperMario', { characterName: this.selectedCharacterName });

            this.selectedCharacterName = null;

            this.selectedIndex = -1;
        }
    }

    // 썸네일이랑 순서는 무조건 맞춰야함 ㅇㅋ?
    getCharacterNameByIndex(index) {
        switch (index) {
            case 0:
                return 'megaman';
            case 1:
                return 'link';
            case 2:
                return 'kirby';
            case 3:
                return 'sonic';
            case 4:
                return 'bulletking';
            case 5:
                return 'red';
            default:
                return 'sonic';
        }
    }

    handleLeftKey() {
        this.moveThumbnails(-1);
    }

    handleRightKey() {
        this.moveThumbnails(1);
    }

    update() {
        if (this.cursorKeys.left.isDown && this.time.now > this.lastMoveTime + this.moveDelay) {
            this.moveThumbnails(-1);
            this.lastMoveTime = this.time.now;
        } else if (this.cursorKeys.right.isDown && this.time.now > this.lastMoveTime + this.moveDelay) {
            this.moveThumbnails(1);
            this.lastMoveTime = this.time.now;
        }
    }

    moveThumbnails(direction) {
        const newIndex = Phaser.Math.Clamp(this.selectedIndex + direction, 0, this.thumbnails.length - 1);

        if (newIndex !== this.selectedIndex) {
            this.selectedIndex = newIndex;

            this.moveBgm.play();

            this.highlightSelectedThumbnail();
            this.updateCharacterDescription();
        }
    }
}
