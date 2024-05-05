//CharacterController - 오직 캐릭터의 움직임에 한해서만 정의함


class CharacterController {
    constructor(scene, selectedCharacterName){
        this.scene = scene;
        this.slidePossible = true;
        this.nowSliding = false;

        this.selectedCharacterName = selectedCharacterName;

        this.player = this.createCharacter(this.getCharacterInfo(selectedCharacterName));

        this.characterStatus = new CharacterStatus(this.scene, this.getCharacterInfo(selectedCharacterName));

        this.scene.physics.add.existing(this.player);
        this.player.setScale(this.getCharacterInfo(selectedCharacterName).scale)
        this.player.setDepth(1);

        this.keyboardInput = this.scene.input.keyboard.createCursorKeys();

        this.isBlinking = false;
        this.visible = true;

        this.slidingCoolDown = [3500, 5000];

    }

    update(){
        //방향키에 따른 움직임
        if(!this.nowSliding){
            this.move(this.player);
        }
        
        //슬라이드 => 회피율 100 속도는 설정 가능
        if(this.slidePossible && !this.nowSliding){
            this.slide(this.player);
        }


        
    }
    
    //캐릭터 선택에 따른 캐릭터 정보 반환
    getCharacterInfo(selectedCharacterName){
        const characterData = this.scene.cache.json.get('characterData'); // preload에 있는 json 데이터를 가지고 옴
        return characterData[selectedCharacterName];
    }

    createCharacter(characterData){

        const spriteKey = characterData.spriteKey;

        const player = this.scene.physics.add.sprite(0, 0, characterData.spriteKey);

        // 기존 애니메이션 키 할당이 되어있다면 제거해줘야 함 ㅋㅋ
        Object.keys(characterData.animations).forEach(animationKey => {
            const animationData = characterData.animations[animationKey];
            if (this.scene.anims.exists(`${animationKey}`)) {
                this.scene.anims.remove(`${animationKey}`);
            }
        });

        this.scene.anims.create({
            key : "move",
            frames : this.scene.anims.generateFrameNumbers(characterData.spriteKey,
                {start : characterData.animations.move.frames.start, end : characterData.animations.move.frames.end}),
            frameRate : characterData.animations.move.frameRate,
            repeat : characterData.animations.move.repeat
        });

        this.scene.anims.create({
            key : "stop",
            frames : this.scene.anims.generateFrameNumbers(characterData.spriteKey,
                {start : characterData.animations.stop.frames.start, end : characterData.animations.stop.frames.end}),
            frameRate : characterData.animations.stop.frameRate,
            repeat : characterData.animations.stop.repeat
        });

        this.scene.anims.create({
            key : "slide",
            frames : this.scene.anims.generateFrameNumbers(characterData.spriteKey,
                {start : characterData.animations.slide.frames.start, end : characterData.animations.slide.frames.end}),
            frameRate : characterData.animations.slide.frameRate,
            repeat : characterData.animations.slide.repeat
        });

        return player;
    }

    //움직임
    move(player){
        if (this.keyboardInput.left.isDown || this.keyboardInput.right.isDown || this.keyboardInput.up.isDown || this.keyboardInput.down.isDown) {
            if (!this.nowSliding) { // 슬라이드 상태가 아닐 때만 move 애니메이션 실행
                player.anims.play("move", true);
            }
        }else{
            if (!this.nowSliding) { // 슬라이드 상태가 아닐 때만 stop 애니메이션 실행
                player.anims.play("stop", true);
            }
        }
    
        if(this.keyboardInput.left.isDown){
            player.setVelocityX(-this.characterStatus.speed); //= 이동할때
            player.flipX = true;
        } else if(this.keyboardInput.right.isDown){
            player.setVelocityX(this.characterStatus.speed);
            player.flipX = false;
        } else {
            player.setVelocityX(0);
        }
    
        if(this.keyboardInput.up.isDown){
            player.setVelocityY(-this.characterStatus.speed);
        } else if(this.keyboardInput.down.isDown) {
            player.setVelocityY(this.characterStatus.speed);
        } else {
            player.setVelocityY(0);
        }
    }
    
    //슬라이드
    slide(player){
        let beforeAvoidance = this.characterStatus.avoidance;
        let beforeSpeed = this.characterStatus.speed;

        if(this.keyboardInput.space.isDown && (this.keyboardInput.left.isDown || this.keyboardInput.right.isDown || this.keyboardInput.up.isDown || this.keyboardInput.down.isDown)){
            //회피율 / 슬라이드 속도
            this.characterStatus.sliding(100, 800);

            //이게 없으면 속도변화가 없음
            if(this.keyboardInput.left.isDown){
                player.setVelocityX(-this.characterStatus.speed);
            } else if(this.keyboardInput.right.isDown){
                player.setVelocityX(this.characterStatus.speed);
            } else {
                player.setVelocityX(0);
            }
        
            if(this.keyboardInput.up.isDown){
                player.setVelocityY(-this.characterStatus.speed);
            } else if(this.keyboardInput.down.isDown) {
                player.setVelocityY(this.characterStatus.speed);
            } else {
                player.setVelocityY(0);
            }

            this.slidePossible = false;
            this.nowSliding = true;
            
            this.player.anims.play('slide', true);

            //bind를 사용하지 않고 그냥 setTimeout을 작성하면 this가 window를 가르킨다
            //따라서 bind로 지정해줘야 한다

            setTimeout(function(){
                this.nowSliding = false; // 슬라이드 상태 해제
                this.characterStatus.sliding(beforeAvoidance, beforeSpeed);
            }.bind(this),200);


            setTimeout(function(){
                this.slidePossible = true;
            }.bind(this),this.selectedCharacterName == 'sonic' ? this.slidingCoolDown[0] : this.slidingCoolDown[1]);

        }
    }


    //캐릭터 적중시 반짝임
    blink() {
        this.isBlinking = true;
        this.player.setVisible(!this.player.visible); // 스프라이트 가시성을 토글
    
        // 일정 시간 후에 깜빡임 멈추도록 타이머 설정
        this.scene.time.delayedCall(2000, () => {
          this.stopBlink(); // 깜빡임 중지
        });
    
        // 일정 시간마다 깜빡이도록 타이머 설정
        this.blinkTimer = this.scene.time.addEvent({
            delay: 50, // 깜빡임 간격
            callback: () => {
                this.player.setVisible(!this.player.visible); // 스프라이트 가시성을 토글
            },
            callbackScope: this,
            loop: true, // 무한 반복
        });
    }

    stopBlink() {
        this.isBlinking = false;
        this.player.setVisible(true); // 몬스터 가시성을 다시 활성화
        if (this.blinkTimer) {
          this.blinkTimer.remove(); // 깜빡임 타이머 제거
        }
    }

    ghostTag(tagCount){
        if(this.selectedCharacterName == "sonic"){
            switch(tagCount){
                case 3 :
                    this.slidingCoolDown[0] = 3000;
                    break;

                default : 
                this.slidingCoolDown[0] = 4000;
                    break;
            }
        }else{
            switch(tagCount){
                case 3 :
                    this.slidingCoolDown[1] = 4000;
                    break;

                default : 
                this.slidingCoolDown[1] = 5000;
                    break;
            }
        }
    }
}