class VictoryScene extends Phaser.Scene {
    constructor() {
        super('VictoryScene');
        this.bgm;
    }

    preload(){
        this.load.audio('victoryBGM', 'assets/sounds/victoryBGM.mp3');
    }

    create() {
        // 출처 기입
        // 마우스 클릭 또는 스페이스바 또는 엔터 시 씬으로 넘어가기
        // bgm 조금 더 자연스럽게 끝나도록 연구 ㅇㅇ
        // 게임 플레이 데이터도 화면에 보이게

        this.bgm = this.sound.add('victoryBGM', { loop: true, volume: 0.3});
        this.bgm.play();

        // Not decided yet => 나중에 추가 예정


        const textGroup = this.add.group();

        const  infoTexts = [
            { text: '[ 개발자 ]', fontSize: '32px', fill: '#32CD32' },
            { text: '팀명 : [ JDI(Just Do It) ]', fontSize: '20px', fill: '#ffffff' },
            { text: '프로젝트명 : [ Project PH ]', fontSize: '20px', fill: '#ffffff' },
            { text: '크리에이티브 디렉터 : Everyone participates', fontSize: '20px', fill: '#ffffff' },
            { text: '프로듀서 : No corresponding occupation', fontSize: '20px', fill: '#ffffff' },
            { text: '프로그래머 : [ 임화진, 최재영, 김용우, 박성운 ]', fontSize: '20px', fill: '#ffffff' },
            { text: '자료 총괄 : [ 박성운 ]', fontSize: '20px', fill: '#ffffff' },
            { text: '캐릭터 개발 책임 : [ 김용우 ]', fontSize: '20px', fill: '#ffffff' },
            { text: '보스 개발 책임 : [ 최재영 ]', fontSize: '20px', fill: '#ffffff' },
            { text: '몬스터 개발 책임 : [ 박성운 ]', fontSize: '20px', fill: '#ffffff' },
            { text: '시스템 개발 책임 : [ 임화진 ]', fontSize: '20px', fill: '#ffffff' },

            { text: '밸런싱 디자이너 : Not decided yet', fontSize: '20px', fill: '#ffffff' },
            { text: '메커니즘 디자이너 : Not decided yet', fontSize: '20px', fill: '#ffffff' },
            { text: '게임플레이 디자이너 : Not decided yet', fontSize: '20px', fill: '#ffffff' },
            { text: '유저 스트레스 설계 : Not decided yet', fontSize: '20px', fill: '#ffffff' },
            { text: '몬스터 디자이너 : Not decided yet', fontSize: '20px', fill: '#ffffff' },
            { text: '내러티브 디자이너 : Not decided yet', fontSize: '20px', fill: '#ffffff' },

            { text: '사운드 : Everyone participates', fontSize: '20px', fill: '#ffffff' },
            { text: '작가 : Not decided yet', fontSize: '20px', fill: '#ffffff' },
            { text: '테스터(QA) : Not decided yet', fontSize: '20px', fill: '#ffffff' },
            { text: '컨셉 아티스트 : Everyone participates', fontSize: '20px', fill: '#ffffff' },

        ]

        const toolTexts = [
            { text: '[ Developer ]', fontSize: '32px', fill: '#32CD32' },
            { text: '게임 엔진 : Phaser3 Framework', fontSize: '20px', fill: '#ffffff' },
            { text: '도구 : VSCode, Notion, Github', fontSize: '20px', fill: '#ffffff' },
            { text: '클라이언트 : Not decided yet', fontSize: '20px', fill: '#ffffff' },
            { text: '네트워크 : Not decided yet', fontSize: '20px', fill: '#ffffff' },
            { text: '서버 : Not decided yet', fontSize: '20px', fill: '#ffffff' },
        ]

        const sendTexts = [
            { text: '[ 감사의 말 ]', fontSize: '32px', fill: '#32CD32' },
            { text: '플레이해주신 분들께,\n Project PH를 즐겨주셔서 정말 감사합니다. 2D 로그라이크 액션 게임에 첫 도전이지만 여러분들의 호응 덕분에 성공적으로 완성되었습니다. 여러분들이 열정적으로 게임을 즐겨주시고 관심어린 피드백을 주신 덕분에 게임을 좋은 방향으로 발전시키고 완성도를 높일 수 있었습니다. 여러분의 지지와 참여에 다시 한 번 진심으로 감사드립니다. 개발을 하고 여러가지 조정을 해나가던 이 시간은 저희에게 큰 경험과 보람이 되었습니다!! \n\n Project PH 개발팀 드림', fontSize: '20px', fill: '#ffffff' },

        ]

        const notifyTexts = [         
            { text: '[ 출처 및 라이센스 ]', fontSize: '32px', fill: '#32CD32' },

            { text: '[ 음악 ]', fontSize: '32px', fill: '##9ACD32' },
            { text: '오디오 원본 이름: 오디오 제공자 또는 웹사이트 이름', fontSize: '20px', fill: '#ffffff' },
            { text: '오디오 원본 이름: 오디오 제공자 또는 웹사이트 이름', fontSize: '20px', fill: '#ffffff' },
            { text: '오디오 원본 이름: 오디오 제공자 또는 웹사이트 이름', fontSize: '20px', fill: '#ffffff' },
            { text: '오디오 원본 이름: 오디오 제공자 또는 웹사이트 이름', fontSize: '20px', fill: '#ffffff' },

            { text: '[ 이미지 ]', fontSize: '32px', fill: '#9ACD32' },
            { text: '이미지 원본 이름: 이미지 제공자 또는 웹사이트 이름', fontSize: '20px', fill: '#ffffff' },
            { text: '이미지 원본 이름: 이미지 제공자 또는 웹사이트 이름', fontSize: '20px', fill: '#ffffff' },
            { text: '이미지 원본 이름: 이미지 제공자 또는 웹사이트 이름', fontSize: '20px', fill: '#ffffff' },
            { text: '이미지 원본 이름: 이미지 제공자 또는 웹사이트 이름', fontSize: '20px', fill: '#ffffff' },

            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
            { text: '제작에 참여한 모든 분들께 감사의 말씀을 올립니다.', fontSize: '20px', fill: '#ffffff' },
        ];


        const startY = this.cameras.main.height * 0.108;
        let currentY = startY;
        const spacing = this.cameras.main.height * 0.108 * 0.2;

        // 카테고리별로 텍스트 배열 생성
        const categories = [
            { name: 'info', texts: infoTexts },
            { name: 'tool', texts: toolTexts },
            { name: 'send', texts: sendTexts},
            { name: 'notify', texts: notifyTexts }
        ];
        
        const overlay = this.add.rectangle(0, 0, this.cameras.main.width + 100, this.cameras.main.height * 6, 0x000000);
        // 1143, 936
        overlay.setOrigin(0);

        const title = this.add.text(
            this.cameras.main.width * 0.25,
            currentY,
            '[ Pixel Heroes ]',
            { fontSize: '50px', fill: '#FF0000' }
        );

        currentY += title.height * 2;
        for (const category of categories) {
            for (const text of category.texts) {
                const textObj = this.add.text(0, 0, text.text, {
                    fontSize: text.fontSize,
                    fill: text.fill,
                    wordWrap: { width: this.cameras.main.width * 0.709, useAdvancedWrap: true },
                    lineSpacing: this.cameras.main.height * 0.02,
                    align: 'left'
                }).setOrigin(0);
                
                textObj.setY(currentY);
                textObj.setX(this.cameras.main.width * 0.025);

                currentY += textObj.height + spacing;
            }

            currentY += spacing;
        }

        this.scrollSpeed = 1;

        this.tweens.add({
            targets: this.cameras.main,
            scrollY: { value: this.cameras.main.scrollY, duration: 1000 },
            duration: 2000,
            onComplete: () => {
                // 2초 후에 MainMenu 씬으로 전환
                this.time.delayedCall(20000, () => {

                    const thankYouText = this.add.text(
                        this.cameras.main.width * 0.15,
                        this.cameras.main.scrollY + this.cameras.main.height - startY * 1.2,
                        '지금까지 플레이해주셔서 감사합니다',
                        { fontSize: '40px', fill: '#7FFFD4' }
                    );

                    this.time.delayedCall(8500, () => {
                        this.scene.stop('StageSuperMario');
                        this.scene.stop('VictoryScene');
                        this.bgm.stop();
                        this.scene.start('MainMenu');

                    })
                    
                });
            }
        });
    }

    update(){
        this.cameras.main.scrollY += this.scrollSpeed;
    }
}