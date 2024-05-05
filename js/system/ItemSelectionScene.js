class ItemSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ItemSelectionScene' });
        this.rewardObjects = [];
        this.selectedRewardIndex = -1;
        this.selectedItems = [];
        this.itemsData = [];    // json배열 저장
        this.characterStatus;
        this.weapons;
        this.passives;
        this.masterController;
        this.selectionCount;

        this.rewordContainer;
        this.passivesContainer;
        this.weaponsContainer;
        this.statsContainer;
    }

    preload() {
        this.load.json('passives', 'js/character/passives.json');
        
    }

    create(data) {
        // 씬 배경
        const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x808080, 1);
        overlay.setOrigin(0);

        this.characterStatus = data.characterStatus;
        this.weapons = data.weapons;
        this.passives = data.passives;
        this.masterController = data.masterController;

        this.selectionCount = this.game.selectionCount;

        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        this.rewordContainer = this.add.container(gameWidth * 0.05, gameHeight * 0.05);
        this.passivesContainer = this.add.container(gameWidth * 0.15, gameHeight * 0.4);
        // 맥스가 8이면 0.58 , 6이면 0.7이 적당함
        this.weaponsContainer = this.add.container(gameWidth * 0.7, gameHeight * 0.7);
        this.statsContainer = this.add.container(gameWidth * 0.68, gameHeight * 0.05);

        // 셀렉트 버튼
        this.createSelectionButton();

        this.itemsData = this.cache.json.get('passives');

        this.loadItemImage();

        this.load.on('complete', () =>{

            this.rewardObjects.forEach(group => group.destroy());
            this.rewardObjects = [];

            this.displayRewardObjects();
            this.createPassiveSlots();
            this.createWeaponSlots();
            this.displayPlayerStats();

        });

        this.load.start();

    }

    loadItemImage(){
        const itemsData = this.itemsData;

        // 각 아이템의 이미지 preload
        for (const itemKey in itemsData) {
            const item = itemsData[itemKey];
            if (item.imagePath) {
                this.load.image(item.name, item.imagePath);
            }
        }
    }

    createSelectionButton() {
        this.selectionButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, 'Select', {
            fontSize: '20px',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive();

        this.selectionButton.on('pointerdown', () => this.completeSelection());
    }

    displayRewardObjects() {
        const itemsData = this.itemsData;
        const itemKeys = Object.keys(itemsData);
        
        Phaser.Utils.Array.Shuffle(itemKeys);
        
        const selectedItems = itemKeys.slice(0, Math.min(3, itemKeys.length));
        this.selectedItems = selectedItems;
        
        selectedItems.forEach((itemName, index) => {
            const item = itemsData[itemName];
            const x = this.cameras.main.width * 0.1 + (index * this.cameras.main.width * 0.2);
            const y = this.cameras.main.width * 0.1;
            const itemImage = this.add.image(x, y, item.name);
            itemImage.setScale(0.5);
    
            const itemText = this.createItemText(x, y, item, itemImage);
    
            const group = this.add.container();

            let interX = this.cameras.main.width * 0.25;

            group.add([itemImage, itemText]);
            group.setSize(interX, itemImage.height + itemText.height + this.cameras.main.height * 0.287);
            const rect = this.add.rectangle(x, y + this.cameras.main.height * 0.118, group.width - this.cameras.main.width * 0.069, group.height, 0xffffff, 0.3);
            rect.setStrokeStyle(2, 0xffffff); 
            group.addAt(rect, 0); 
    
            itemImage.setInteractive().on('pointerdown', () => {
                this.imageClick(group, index);
            });
    
            this.rewardObjects.push(group);
        });

        this.rewardObjects.forEach(group => this.rewordContainer.add(group));
    }

    imageClick(group, clickedIndex) {
        if (this.selectedRewardIndex !== clickedIndex) {
            this.selectedRewardIndex = clickedIndex;
            
            this.rewardObjects.forEach((grp, i) => {
                if (i === clickedIndex) {
                    grp.getAt(0).setFillStyle(0x808080, 0.3);
                } else {
                    grp.getAt(0).setFillStyle(0xffffff, 0.3); // 원래 색상으로 변경
                }
            });
        } else {
            //console.log(clickedIndex);
        }
    }

    createItemText(x, y, item, itemImage) {
        // 이름 관련된 text
        const group = this.add.container();
        
        const nameText = this.add.text(x, y + itemImage.height / 2, `${item.name}`, { fontSize: '25px', fill: '#FFFFFF' }).setOrigin(0.5, 0.5);
        group.add(nameText);

        let offsetY = nameText.height + 5;

        for (const prop in item) {
            if (prop !== 'name' && prop !== 'imagePath' && prop !== 'type') {
                const value = item[prop];
                const color = this.setColorForValue(value);
                const propText = this.add.text(x, y + offsetY + itemImage.height / 2 + 10, `${prop}: ${value}`, { fontSize: '20px', fill: color }).setOrigin(0.5, 0.5);
                offsetY += propText.height + 5;
                group.add(propText);
            }
        }
    
        return group;
    }

    
    setColorForValue(value) {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
            return numericValue >= 0 ? '#00FF00' : '#FF0000';
        } else {
            return '#FFFFFF';
        }
    } 

    completeSelection() {
        if(this.selectedRewardIndex !== -1) {
            const selectedItemIndex = this.selectedRewardIndex;
            const selectedItemKey = this.selectedItems[selectedItemIndex];

            const selectedItem = this.itemsData[selectedItemKey];

            this.masterController.updateItem(selectedItem);

            // 걍 이 씬에서 쓰는거 -- 해버리기
            this.selectionCount--;
            
            // 전역변수 -- 해버리기
            this.game.selectionCount--;

            // 인덱스 초기화.. 필요한거 같음 이거 떔에 버그있는듯?
            this.selectedRewardIndex = -1;

            if(this.selectionCount > 0) {
                this.scene.restart();
            } else {
                this.scene.stop('ItemSelectionScene');
                this.scene.resume('StageSuperMario');
            }
        } else {
            const messageText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '아이템을 선택하세요!', {
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
    }

    createPassiveSlots() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const spacing = gameWidth * 0.09;
        const slotWidth = this.cameras.main.width * 0.078;
        const slotHeight = this.cameras.main.height * 0.0908;

        const passiveSlots = [];

        let inter = 0;
        for(let key in this.passives) {
            const x = (inter % 5) * spacing;
            const y = (Math.floor(inter / 5) + 3) * spacing;

            const textPosition = spacing * 0.1;
            
            const value = this.passives[key];
            const passiveImage = this.add.image(x, y, key).setOrigin(0.6).setScale(0.5);
            const valueText = this.add.text(x+textPosition, y+textPosition, `x${value}`, { fill: '#000000'});


            this.passivesContainer.add(passiveImage);
            this.passivesContainer.add(valueText);
            passiveSlots.push(passiveImage);

            const imageWidth = passiveImage.width;
            const imageHeight = passiveImage.height;

            if (imageWidth > slotWidth || imageHeight > slotHeight) {
                const scaleFactor = Math.min(slotWidth / imageWidth, slotHeight / imageHeight);
                passiveImage.setScale(scaleFactor);
            } else {
                passiveImage.displayWidth = slotWidth; 
                passiveImage.displayHeight = slotHeight;
            }
            inter++
        }

        if(inter == 0) {
            const x = (inter % 5) * spacing;
            const y = (Math.floor(inter / 5) + 3) * spacing;
            const alretText = this.add.text(x, y, '패시브가 없습니다.', {fill: '#8A2BE2', fontSize: '32px'});
            this.passivesContainer.add(alretText);
        }

    }
    
    createWeaponSlots() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const spacing = gameWidth * 0.09;

        const weaponSlots = []; // 무기 영역
        const weapons = this.weapons;

        // 무기 슬롯 생성
        const maxWeaponSlots = this.characterStatus.maxEquipment;
        const slotWidth = this.cameras.main.width * 0.078;
        const slotHeight = this.cameras.main.height * 0.0908;

        for (let i = 0; i < maxWeaponSlots; i++) {
            const x = (i % 3) * spacing;
            const y = Math.floor(i / 3) * spacing;
            
            if (i < weapons.length) {
                // 카구팔 기준으로 setOrigin(0.6)정도 해야 크기가 맞네.. ㅠ
                const weaponImage = this.add.image(x, y, weapons[i].name).setOrigin(0.6).setScale(0.5);
                weaponImage.setInteractive();

                weaponImage.on('pointerdown', () =>{

                    this.showWeaponOptions(i);
                });


                this.weaponsContainer.add(weaponImage);
                weaponSlots.push(weaponImage);

                const imageWidth = weaponImage.width;
                const imageHeight = weaponImage.height;

                if (imageWidth > slotWidth || imageHeight > slotHeight) {
                    const scaleFactor = Math.min(slotWidth / imageWidth, slotHeight / imageHeight);
                    weaponImage.setScale(scaleFactor);
                } else {
                    weaponImage.displayWidth = slotWidth;
                    weaponImage.displayHeight = slotHeight;
                }
            } else {
                // weapons 배열에 무기가 없는 경우 사각형
                const rect = this.add.rectangle(x, y, slotWidth, slotHeight, 0xFFE4E1);
                this.weaponsContainer.add(rect);
                weaponSlots.push(rect);
            }
        }
    }

    showWeaponOptions(index) {
        const weaponContainerX = this.weaponsContainer.x;
        const weaponContainerY = this.weaponsContainer.y;

        const selectedWeaponImage = this.weaponsContainer.getAt(index);

        const x = selectedWeaponImage.x + weaponContainerX;
        const y = selectedWeaponImage.y + weaponContainerY;

        const optionsText = this.add.text(x, y - 50, '무기 작업을 선택하세요(취소)', { fontSize: '24px', fill: '#ffffff' }).setInteractive();
        const enhanceText = this.add.text(x, y, '1. 무기 강화하기', { fontSize: '20px', fill: '#ffffff' }).setInteractive();
        enhanceText.setY(enhanceText.y + enhanceText.height / 2);
        const removeText = this.add.text(x, y + 50, '2. 무기 제거하기', { fontSize: '20px', fill: '#ffffff' }).setInteractive();
        removeText.setY(removeText.y + removeText.height / 2);

        optionsText.on('pointerdown', () =>{
            optionsText.destroy();
            enhanceText.destroy();
            removeText.destroy();
        });

        enhanceText.on('pointerdown', () => {
            this.weaponClick(index);

            optionsText.destroy();
            enhanceText.destroy();
            removeText.destroy();
        });
    

        removeText.on('pointerdown', () => {
            this.removeWeapon(index);

            optionsText.destroy();
            enhanceText.destroy();
            removeText.destroy();
        });
    }

    weaponClick(index) {
        const clickedWeapon = this.weapons[index];

        const matchWeapon = this.weapons.find((weapon, i) => i !== index && weapon.name === clickedWeapon.name && weapon.grade === clickedWeapon.grade);

        if(matchWeapon){
            // 무기 강화 및 합성 후의 weapons 반환
            let controllWeapons = this.masterController.weaponController.combineWeapon('combine', clickedWeapon.name);
            
            this.weapons = controllWeapons;

            for(let i = 0; i < this.weaponsContainer.length; i++) {
                const weaponImage = this.weaponsContainer.getAt(i);
                weaponImage.destroy();
            }

            this.weaponsContainer.removeAll(true);
            
            this.createWeaponSlots();

        } else {
            //이거는 좀 뭔가 그 트윈스 알림마냥 강화 못한다고 꼽주기
            console.log('무기 강화할 수 없습니다.');
        }
    }

    removeWeapon(index){
        this.weapons.splice(index, 1);
        // 컨테이너 삭제 및.. 이미지를 리플레이스 가능하려나..
        this.weaponsContainer.remove(this.weaponsContainer.getAt(index));
    }

    displayPlayerStats() {
        // 캐릭터 스탯 표시
        const positionY = this.cameras.main.height * 0.035
        const playerData = this.characterStatus;
        const playerStats = [
            `Level: ${playerData.level}`,
            `MaxExperience: ${playerData.maxExperience}`,
            `MaxHealth: ${playerData.maxHealth}`,
            `Speed: ${playerData.speed}`,
            `Attack Power: ${playerData.power}`,
            `Attack Speed: ${playerData.attackSpeed}`,
            `Range: ${playerData.range}`,
            `Critical: ${playerData.critical}`,
            `Avoidance: ${playerData.avoidance}`,
            `Defence: ${playerData.defence}`,
            `Max Equipment: ${playerData.maxEquipment}`,
            `Luck: ${playerData.luck}`,
            `Absorption: ${playerData.absorption}`
        ];

        playerStats.forEach((stat, index) => {
            const text = this.add.text(0, index * positionY, stat, { fill: '#ffffff', fontSize:24 });
            this.statsContainer.add(text);
        });
    }

}
