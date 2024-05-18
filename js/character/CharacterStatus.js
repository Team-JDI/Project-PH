class CharacterStatus{
    constructor(scene, status){
        this.scene = scene;

        this.characterName = status.spriteKey;

        this.maxHealth = status.maxHealth;      //최대 체력
        this.nowHealth = 10;      //현재 체력 (스테이지 클리어시 자동으로 최대체력이 되도록 updateStatus에서 설정)
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

        //캐릭터의 기본 스테이터스
        this.originalStatus = {
            "maxHealth" : status.maxHealth,
            "speed" : status.speed,
            "attackSpeed" : status.attackSpeed,
            "power" : status.power,
            "range" : status.range,
            "critical" : status.critical,
            "avoidance" : status.avoidance,
            "defence" : status.defence,
            "luck" : status.luck,
            "absorption" : status.absorption
        };

        this.ownPassive = {}; //소유한 패시브 이름 객체

        this.tagStatus = {}; //무기로 인해 추가된 스테이터스를 저장

        //추가 되는 스텟 // 지수 / 퍼센트 구분
        this.additionalStatus = {
            "maxHealth" : 0,
            "speed" : 0,
            "attackSpeed" : 0,
            "power" : 0,
            "range" : 0,
            "critical" : 0,
            "avoidance" : 0,
            "defence" : 0,
            "luck" : 0,
            "absorption" : 0,
            "maxHealthPer" : 0,
            "speedPer" : 0,
            "attackSpeedPer" : 0,
            "powerPer" : 0,
            "rangePer" : 0,
            "defencePer" : 0,
            "luckPer" : 0,
        };

        this.activateSonicSpecialStatus();

        this.expRatio = 1;

        this.expEventRatio = 10;

        this.expRecovery = [false, 0];
    
        //스테이터스를 만들어 놓긴했지만 아직 이걸로 사용하는것은 구현을 못했습니다
        //크리티컬이나 흡혈 등 미구현
        //태그에 따른 것도 아직 미구현
    }

    //무기 태그로 업데이트된 스테이터스 변경
    tagStatusUpdate(status){

        //이전에 있던 태그의 세트효과가 있다면 제거
        if(Object.keys(this.tagStatus).length != 0){
            for(const [statusName, value] of Object.entries(this.tagStatus)){
                if(typeof value == "string" && value.includes("%") && !['critical', 'avoidance', 'absorption'].includes(statusName)){
                    this.additionalStatus[statusName + "Per"] -= parseFloat(value.split("%")[0])
                }else{
                    this.additionalStatus[statusName] -= parseFloat(value);
                }
            }
        }

        //새로 들어온 태그의 세트효과 추가
        for(const [statusName, value] of Object.entries(status)){
            if(typeof value === 'string' && value.includes("%") && !['critical', 'avoidance', 'absorption'].includes(statusName)){
                this.additionalStatus[statusName + "Per"] += parseFloat(value.split("%")[0]);
            }else{
                this.additionalStatus[statusName] += parseFloat(value);
            }
        }

        //업데이트된 값으로 캐릭터 스테이터스 조정
        this.updateStatus();

        //감소를 위한 현재 정보 저장
        this.tagStatus = {};
        this.tagStatus = Object.assign(this.tagStatus, status);
        return this;
    }

    //스테이터스 업데이트 + 스테이지 클리어시 현재체력 = 최대체력으로 변경
    updatePassiveStatus(data){
        if(data){
            //ownPassive에 아이템의 name이 있는지 확인 후 없으면 추가 있으면 갯수만 증가
            //다만 객체의 내부로 동적으로 유지 됩니다
            if(this.ownPassive.hasOwnProperty(data.name)){
                this.ownPassive[data.name]++;
            }else{
                this.ownPassive[data.name] = 1;
            }

            console.log("check1");

            if(data.activate == true){
                return;
            }

            console.log("check2");

            //패시브로 들고 온 스테이터스를 순환하며 값을 추가 - 패시브는 없어지지 않기에 제거 x
            for(const [statusName, value] of Object.entries(data)){
                if(statusName != 'name' && statusName != 'imagePath' && statusName != 'type' && statusName != 'activate' && statusName != 'grade'){
                    if(typeof data[statusName] == 'string' && data[statusName].includes("%") && !['critical', 'avoidance', 'absorption'].includes(statusName)){
                        this.additionalStatus[statusName + "Per"] += parseFloat(value.split("%")[0]);
                    }else{
                        this.additionalStatus[statusName] += parseFloat(value);
                    }
                }
            }
        }

        //업데이트된 값으로 캐릭터 스테이터스 조정
        this.updateStatus();
        //업데이트 된 값으로 무기 업데이트
        this.scene.masterController.weaponController.updateWeaponData(this);
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
        this.nowExperience += exp * this.expRatio;
        //경험치 획득 사운드 재생
        this.scene.masterController.soundController.playEffectSound("expAcquisition");

        if(this.expRecovery[0] && this.nowHealth < this.maxHealth && (Math.floor(Math.random() * 100) + 1) < this.expRecovery[1]){
            this.nowHealth++;
        }

        while(this.nowExperience >= Math.floor(this.maxExperience)){
            this.nowExperience -= Math.floor(this.maxExperience);
            this.level++;
            //레벨업 사운드 재생
            this.scene.masterController.soundController.playEffectSound("levelUpSound");;
            //레벨업 파티클 재생
            this.scene.masterController.effectController.activateLevelUp();
            this.maxHealth += 10;
            this.nowHealth += 10;
            this.scene.updateSettlement();
            this.maxExperience = Math.floor(this.maxExperience * 1.2);
        }
        return this.nowExperience;
    }

    getPassives(){
        return this.ownPassive;
    }

    //흡혈
    absorptionHealth(){
        if(this.nowHealth < this.maxHealth){
            this.nowHealth += 1;
        }
    }

    //소닉 - 캐릭터 이동속도 비례해서 회피 증가 (추가 이동속도의 20%로 설정)
    activateSonicSpecialStatus(){
        //추가 회피가 없으면서 소닉일때 추가 회피 생성(아니라면 return)
        if(this.extraAvoidance === undefined && this.characterName == "sonic"){
            this.extraAvoidance = 0;
            return;
        }else if(this.characterName != "sonic"){
            return;
        }

        //추가 회피가 존재할때
        if(this.extraAvoidance !== undefined){
            //추가 속도 = 현재 속도 - 캐릭터 기본속도
            this.extraSpeed = this.speed - this.originalStatus["speed"];
            //음수 값 안나오도록 제거
            if(this.extraSpeed < 0){
                this.extraSpeed = 0;
            }

            // 20퍼센트를 추가 회피로 설정
            this.extraAvoidance = Math.round(this.extraSpeed * 0.2);
            //더해줌 - 캐릭터 스테이터스를 먼저 업데이트하기때문에 굳이 삭제를 해줄 필요가 없음
            this.avoidance += this.extraAvoidance;
        }
    }

    //커비 - 캐릭터 스텟 상승(기본캐릭터의 스텟이 증가)
    activateKirbySpecialStatus(kirbyUpdate){
        //객체의 값으로 받아온후 순회하면서 해당하는 속성이 있다면 기본값에 더해줌 (업데이트할때도 유리하게 적용됨)
        for(const [statusName] of Object.entries(this.originalStatus)){
            if(kirbyUpdate[statusName]){
                this.originalStatus[statusName] += kirbyUpdate;
            }
        }
        this.updateStatus();
    }

    //캐릭터 스텟 업데이트
    updateStatus(){
        for(const [statusName] of Object.entries(this.originalStatus)){
            let percentage;
            if(this.additionalStatus[statusName + "Per"] == undefined){
                percentage = 0;
            }else{
                percentage = this.additionalStatus[statusName + "Per"] / 100
            }
            this[statusName] = Math.floor((this.originalStatus[statusName] + this.additionalStatus[statusName]) * (1 + percentage));
        }

        if(this.characterName == "sonic"){
            this.activateSonicSpecialStatus();
        }

        //this.nowHealth = this.maxHealth;
    }
    
}
