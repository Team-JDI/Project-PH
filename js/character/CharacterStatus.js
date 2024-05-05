class CharacterStatus{
    constructor(scene, status){
        this.scene = scene;
        this.maxHealth = status.maxHealth;      //최대 체력
        this.nowHealth = 100;      //현재 체력 (스테이지 클리어시 자동으로 최대체력이 되도록 updateStatus에서 설정)
        this.speed = status.speed;              //캐릭터 속도
        this.attackSpeed = status.attackSpeed;  //공격속도
        this.power = status.power;              //캐릭터의 공격력
        this.range = status.range;              //캐릭터의 공격범위
        this.critical = status.critical;        //치명타확률
        this.avoidance = status.avoidance;      //회피율
        this.defence = status.defence;          //방어력
        this.luck = status.luck;                //운
        this.absorption = status.absorption;    //흡혈
        this.level = 1;
        this.maxExperience = 100;
        this.nowExperience = 0;
        this.maxEquipment = 6;

        this.ownPassive = {}; //소유한 패시브 이름 객체

        this.tagStatus = {}; //무기로 인해 추가된 스테이터스를 저장
    
        //스테이터스를 만들어 놓긴했지만 아직 이걸로 사용하는것은 구현을 못했습니다
        //크리티컬이나 흡혈 등 미구현
        //태그에 따른 것도 아직 미구현
    }

    takeDamage(damage){
        let beforeAvoidance = this.avoidance;
        const characterHit = Math.floor(Math.random() * 101);

        if(this.avoidance >= characterHit){
            // 회피
        }else{
            //this.nowHealth -= (damage - this.defence);
            this.scene.masterController.soundController.playEffectSound("characterHit");

            //맞은 직후 회피율 100
            this.avoidance = 100;

            this.scene.masterController.characterController.blink();// 깜빡임 효과 시작

            //0.2초후 회피율 복원 및 깜빡임 정지
            setTimeout(() =>{
                this.avoidance = beforeAvoidance;
                this.scene.masterController.characterController.stopBlink();
            }, 200)

            if(this.nowHealth <= 0){
                return 'gameOver';
            }
        }
    }

    //스테이터스 업데이트 + 스테이지 클리어시 현재체력 = 최대체력으로 변경
    updateStatus(data){
        if(data){
            //ownPassive에 아이템의 name이 있는지 확인 후 없으면 추가 있으면 갯수만 증가
            //다만 객체의 내부로 동적으로 유지 됩니다
            if(this.ownPassive.hasOwnProperty(data.name)){
                this.ownPassive[data.name]++;
            }else{
                this.ownPassive[data.name] = 1;
            }

            for(const status in data){
                //데이터가 %를 포함한다면 곱하는건 곱해지게 더해져야되는건 더해지도록 구성

                // 합연산, 곱연산
                // 합연산 전체의 몇퍼(증가량) 을 전체 + 증가량 으로 업데이트
                // 곱연산 전체를 * 증가량으로 업데이트
                // 대신 보통 곱연산은 맨 마지막 연산으로 빼서
                // 말 그대로 모든 수식의 마지막에 계산되도록 하는 방식이 보편적
                // => 최종뎀 ㅇㅇ

                //스테이터스 업데이트 완료
                if(status != 'name' && status != 'imagePath' && status != 'type' && status != 'activate' && status != 'grade'){
                    switch(true){
                        case status == 'critical' : case status == 'avoidance' : case status == 'luck' : case status == 'defence' :
                            this[status] += parseFloat(data[status]);
                            break;
                        case data[status] && data[status].includes("%") :
                            this[status] = Math.floor(this[status] * (1 + parseFloat(data[status].split("%")[0] / 100)));
                            break;
                        default : this[status] += parseFloat(data[status]);
                    }
                }
            };
        }
        this.scene.masterController.weaponController.updateWeaponData(this);
        this.nowHealth = this.maxHealth;
    }

    //슬라이딩할때 속도 조정을 위한 함수
    sliding(avoidance, speed){
        this.avoidance = avoidance;
        this.speed = speed;
    }

    getCharacterStatus() {
        return {
            maxHealth : this.maxHealth,
            nowHealth : this.nowHealth,
            speed : this.speed,
            attackSpeed : (this.attackSpeed/100),
            power : this.power,
            range : this.range,
            critical : this.critical,
            avoidance : this.avoidance,
            defence : this.defence,
            luck : this.luck,
            absorption : this.absorption,
            level : this.level,
            maxExperience : this.maxExperience,
            nowExperience : this.nowExperience,
            maxEquipment : this.maxEquipment
        };
    }

    //exp획득시 레벨업 로직
    getExp(exp){
        this.nowExperience += exp;
        this.scene.masterController.soundController.playEffectSound("expAcquisition");
        while(this.nowExperience >= Math.floor(this.maxExperience)){
            this.nowExperience -= Math.floor(this.maxExperience);
            this.level++;
            this.scene.masterController.soundController.playEffectSound("levelUpSound");;
            this.scene.masterController.effectController.activateLevelUp();
            this.maxHealth += 10;
            this.nowHealth += 10;
            this.scene.updateSettlement();
            this.maxExperience = Math.floor(this.maxExperience * 1.2);
        }
        return this.nowExperience;
    }

    //무기 태그로 업데이트된 스테이터스 변경
    tagStatusUpdate(status){
        //감소
        for(const beforeStatus in this.tagStatus){
            if(beforeStatus == "critical" || beforeStatus == "avoidance" || beforeStatus == "luck" || beforeStatus == "defence" || beforeStatus == "absorption"){
                this[beforeStatus] -= this.tagStatus[beforeStatus];
            }else{
                this[beforeStatus] = this[beforeStatus]/ (1 + this.tagStatus[beforeStatus]/100);
                this[beforeStatus] = Math.floor(this[beforeStatus]);
            }
        }


        //증가
        for(const nowStatus in status){
            if(nowStatus == "critical" || nowStatus == "avoidance" || nowStatus == "luck" || nowStatus == "defence" || nowStatus == "absorption"){
                this[nowStatus] += status[nowStatus];
            }else{
                this[nowStatus] = (1 + status[nowStatus]/100) * this[nowStatus];
                this[nowStatus] = Math.floor(this[nowStatus]);
            }
        }

        //감소를 위한 현재 정보 저장
        this.tagStatus = {};
        this.tagStatus = Object.assign(this.tagStatus, status);
        return this;
    }

    getPassives(){
        return this.ownPassive;
    }

    absorptionHealth(){
        if(this.nowHealth < this.maxHealth){
            this.nowHealth += 1;
        }
    }

    activateSonicSpecialStatus(characterName){
        if(this.extraAvoidance === undefined && characterName == "sonic"){
            this.extraAvoidance = 0;
            return;
        }

        if(this.extraAvoidance !== undefined){
            this.avoidance -= this.extraAvoidance;
            const extraSpeed = this.speed - 200;
            if(this.extraSpeed < 0){
                this.extraSpeed = 0;
            }
            this.extraAvoidance = Math.round(extraSpeed * 0.2);
            this.avoidance += this.extraAvoidance;
        }
    }
}
