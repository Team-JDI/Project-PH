class Monster extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, monsterInfo, player,stage) {
    super(scene, x, y, monsterInfo.spriteKey);
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.player = player;
    this.stage = stage;
    //기본 속성 초기화
    this.spriteKey = monsterInfo.spriteKey;
    this.animations = monsterInfo.animations;
    this.stat = this.growthInfo(monsterInfo,stage);
    this.health = this.stat.health;
    this.speed = this.stat.speed;
    this.attack = this.stat.attack;
    this.lastSkillTime = 0;
    
    this.skill = monsterInfo.skill || "none";
    this.skillCool = monsterInfo.skillCool || 0;
    this.skillDuration = monsterInfo.skillDuration || 0;
    this.type = monsterInfo.type || "nomal";
    this.attackRange = monsterInfo.attackRange || 300; // 공격 범위
    this.attackCooldown = monsterInfo.attackCooldown || 0; // 공격 쿨다운
    this.lastAttackTime = 0; // 마지막 공격 시간 초기화
    this.isAttacking = false; 


    this.reverseFlip = monsterInfo.reverseFlip || false;

    this.setScale(monsterInfo.scale);
    this.setDepth(1);
    this.setupAnimations(); 

    //추가
    this.damageTimers = Array(6).fill(0);
  }

  growthInfo(monsterInfo, stage) {
    let healthGrowthRate, speedGrowthRate, attackGrowthRate;

    switch (monsterInfo.level) {
      case 1:
        healthGrowthRate = 0.05;
        speedGrowthRate = 0.03;
        attackGrowthRate = 0.04;
        break;
      case 2:
        healthGrowthRate = 0.10;
        speedGrowthRate = 0.05;
        attackGrowthRate = 0.06;
        break;
      case 3:
        healthGrowthRate = 0.15;
        speedGrowthRate = 0.07;
        attackGrowthRate = 0.08;
        break;
      default:
        healthGrowthRate = 0.05;
        speedGrowthRate = 0.03;
        attackGrowthRate = 0.04;
    }

    return {
      health: monsterInfo.health * Math.pow(1 + healthGrowthRate, stage),
      speed: monsterInfo.speed * Math.pow(1 + speedGrowthRate, stage),
      attack: (monsterInfo.attack || 10) * Math.pow(1 + attackGrowthRate, stage)
    };
  }

  setupAnimations() {
    Object.keys(this.animations).forEach(key => {
        const anim = this.animations[key];
        if (anim && anim.frames && 'start' in anim.frames && 'end' in anim.frames) {
            const fullAnimKey = this.spriteKey + '_' + key;
            if (!this.scene.anims.exists(fullAnimKey)) {
                this.scene.anims.create({
                    key: fullAnimKey,
                    frames: this.scene.anims.generateFrameNumbers(this.spriteKey, { 
                        start: anim.frames.start, 
                        end: anim.frames.end 
                    }),
                    frameRate: anim.framerate,
                    repeat: anim.repeat
                });
            }
        } else {
            console.error(`Animation data for key ${key} is incomplete:`, anim);
        }
    });
    
    this.play(this.spriteKey + '_move');
  }


  update() {
    if (this.skill != "none") this.checkSkill();

    const speed = this.speed;
    // 플레이어와 몬스터 사이의 거리를 계산합니다.
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 플레이어를 향해 천천히 이동합니다.
    this.setVelocity((dx / distance) * speed, (dy / distance) * speed);
    if(this.attackCooldown != 0){
      if (distance <= this.attackRange && !this.isAttacking && this.scene.time.now > this.lastAttackTime + this.attackCooldown) {
        this.attacking();
      }
    }

    if (this.reverseFlip) {
        this.setFlipX(this.player.x > this.x);
    } else {
        this.setFlipX(this.player.x < this.x);
    }
  }

  attacking() {
    this.isAttacking = true;
    this.lastAttackTime = this.scene.time.now;
    this.play(this.spriteKey + '_attack');

    this.on('animationupdate', (animation, frame) => {
      if (frame.index === 3 && this.isAttacking) { // 공격 애니메이션의 특정 프레임에서 공격 실행
        this.attackAction();
      }
    });

    this.once('animationcomplete', () => {
      this.isAttacking = false;
      this.play(this.spriteKey + '_move');
    });
  }

  attackAction() {
    const missile = new Missile(this.scene, this.x, this.y, 'missile');
    this.scene.masterController.monsterController.missilesGroup.add(missile);
    missile.fire(this.x, this.y, Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y)));
  }
  // 이 부분 지금 플레이어와 몬스터가 부딪히면 몬스터가 데미지를 받네요..
  checkCollision(monster, player) {
    const masterController = this.scene.masterController;
    masterController.characterTakeDamage(10);
  }

  // 몬스터 깜빡이기
  blink() {
    this.isBlinking = true;
    this.setVisible(!this.visible); // 스프라이트 가시성을 토글

    // 일정 시간 후에 깜빡임 멈추도록 타이머 설정
    this.scene.time.delayedCall(2000, () => {
      this.stopBlink(); // 깜빡임 중지
    });

    // 일정 시간마다 깜빡이도록 타이머 설정
    this.blinkTimer = this.scene.time.addEvent({
      delay: 200, // 깜빡임 간격
      callback: () => {
        this.setVisible(!this.visible); // 스프라이트 가시성을 토글
      },
      callbackScope: this,
      loop: true, // 무한 반복
    });
  }

  // 깜빡임 멈추기
  stopBlink() {
    this.isBlinking = false;
    this.setVisible(true); // 몬스터 가시성을 다시 활성화
    if (this.blinkTimer) {
      this.blinkTimer.remove(); // 깜빡임 타이머 제거
    }
  }

  hit(damage, weaponIndex, absorption) {
    //////////////추가된 부분
    if(weaponIndex !== undefined){
      const currentTime = this.scene.time.now;

        // 무기별 타이머를 확인하여 일정 기간 동안 같은 무기로부터 데미지를 입지 않도록 함
        if (currentTime < this.damageTimers[weaponIndex]) {
            return; // 현재 시간이 이전 데미지 타이머 내에 있는 경우 바로 반환
        }

        // 무기 인덱스별 타이머 갱신 (예: 1000ms 동안 같은 무기로부터 데미지를 받지 않도록 설정)
        this.damageTimers[weaponIndex] = currentTime + 300;
    }

    if (Math.floor(Math.random() * 100) + 1 <= absorption) {
      this.scene.masterController.characterController.characterStatus.absorptionHealth();
    }
    //////////////////////

    this.health -= damage;

    this.monsterback();
    if (!this.isBlinking) {
      this.blink(); // 깜빡임 효과 시작
    }

    if (this.health <= 0) {

      this.destroyMonster();
    }
  }

  monsterback() {
    const knockbackDistance = 50; // 넉백 거리를 설정하세요.

    // 플레이어와 몬스터 사이의 방향 벡터 계산
    const directionX = this.x - this.player.x;
    const directionY = this.y - this.player.y;

    // 방향 벡터를 정규화하여 거리가 1인 벡터로 변환
    const distance = Math.sqrt(
      directionX * directionX + directionY * directionY
    );
    const normalizedDirectionX = directionX / distance;
    const normalizedDirectionY = directionY / distance;

    // 넉백할 위치 계산
    const knockbackX = this.x + normalizedDirectionX * knockbackDistance;
    const knockbackY = this.y + normalizedDirectionY * knockbackDistance;

    // 넉백 적용
    this.setPosition(knockbackX, knockbackY);
  }

  //플레이어 Status

  dropRate(){
    //현 확률 luck 90 일경우 상자 드랍률 2%
    const masterController = this.scene.masterController;
    const playerStatus = masterController.getCharacterStatus();
    const playerLuck = playerStatus.luck;

    //기본 드랍 확률 0.5%
    const baseDropDate = 0.005;

    //드랍률 증가량
    const growthFactor = 1.5874;

    //30기준으로 한단계 증가
    const scale = playerLuck / 30;

    const totalDropRate = baseDropDate * Math.pow(growthFactor, scale);

    return totalDropRate;
  }

  destroyMonster() {
    const boxRate= this.dropRate();

    //몬스터 죽은 횟수 올리기
    this.scene.masterController.gameDataManager.updateMonstersKilled();
    if(this.spriteKey != "Lv3_0002-2"){
      // 경험치 구슬 생성
      for (let i = 0; i < 2; i++) {
        const expBead = new ExpBead(this.scene, this.x, this.y);
        this.scene.masterController.monsterController.expBeadsGroup.add(expBead);
      }
      // 확률적으로 보너스 상자 생성
      if (Math.random() <= boxRate) {
        const bonusBox = new BonusBox(this.scene, this.x, this.y);
        this.scene.masterController.monsterController.bonusBoxGroup.add(bonusBox);
      }
    }
    if (this.spriteKey === 'Lv3_0002') {
      this.spawnSurroundingMonsters();
    }

    this.destroy();
  }

  spawnSurroundingMonsters() {
    const spawnCount = 5; // 소환할 몬스터의 수
    const spawnRadius = 100; // 소환 반경 (픽셀 단위)
    const verticalSpeed = 300;

    // 소환할 몬스터 정보 로드
    const monsterData = this.scene.cache.json.get('monsterData')['Lv3_0002-2'];

    for (let i = 0; i < spawnCount; i++) {
        // 사망 위치 주변에서 랜덤 위치 계산
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * spawnRadius;
        const x = this.x + distance * Math.cos(angle);
        const y = this.y + distance * Math.sin(angle);

        // 몬스터 생성 및 그룹에 추가
        const newMonster = new Monster(this.scene, x, y, monsterData, this.player);
        this.scene.masterController.monsterController.monstersGroup.add(newMonster);

        this.scene.physics.world.enable(newMonster);
        newMonster.body.setVelocity(
            Math.cos(angle) * verticalSpeed, // 수평 속도
            Math.sin(angle) * verticalSpeed - 400 // 수직 속도 (위로 투사)
        );
        newMonster.body.setGravityY(500);
    }
  }
  //스킬 적용 부분
  checkSkill() {
    if (this.scene.time.now > this.lastSkillTime + this.skillCool) {
        this.executeSkill(this.skill);
        this.lastSkillTime = this.scene.time.now;
    }
  }

  //스킬 적용 스위치문
  executeSkill(skillName) {
    switch(skillName) {
        case 'vanish':
            this.vanish();
            break;
        case 'dash':
            this.dash();
            break;
        case 'explosion':
            this.explosion();
            break;
        default:
            console.log('No skill or invalid skill name');
    }
  }

  //스킬 모음집
  vanish() {
    this.isVanishing = true; // Vanishing 상태로 설정
  
    // 가시성을 주기적으로 토글합니다
    this.blinkEvent = this.scene.time.addEvent({
      delay: 400,  // 깜빡임 간격을 짧게 설정
      callback: () => {
        this.setVisible(!this.visible); // 스프라이트 가시성을 토글
      },
      callbackScope: this,
      loop: true
    });
  
    // 지정된 스킬 지속 시간 후에 깜빡임을 중지하고 가시성을 복원
    this.scene.time.delayedCall(this.skillDuration, () => {
      this.blinkEvent.remove(); // 깜빡임 이벤트 제거
      this.setVisible(true);    // 몬스터를 다시 보이게 함
      this.isVanishing = false; // Vanishing 상태 해제
    });
  }
  
  //대쉬
  dash(){

  }

  //대쉬
  explosion(){

  }
}