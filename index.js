const { createApp } = Vue;

createApp({
    data() {
        return {
            hero: { life: 100, name: "Jubileu", defenseMode: false, potionUsed: false },
            villain: { life: 100, name: "Craudio", defenseMode: false, potionUsed: false },
            gameOver: false, // Controla o fim do jogo
            turn: 0, // Contador de turnos
            isNight: false, // Controla se é noite ou dia
            winnerMessage: '', // Mensagem de vencedor
            musicPlaying: false, // Para controlar se a música está tocando em loop após o fim do jogo
        }
    },
    mounted() {
        // Definir o fundo inicial como "dia"
        document.body.style.backgroundImage = "url('dia.gif')";
        this.isNight = false; // Garantir que o fundo inicial seja dia
        this.updateLifeBars(); // Atualizar as barras de vida inicialmente
        this.updateAttackUpVisibility(); // Garantir que a mensagem "Attack Up!" está oculta inicialmente
        this.playBackgroundMusic(); // Iniciar a música de fundo
    },
    methods: {
        attack(isHero) {
            const attacker = isHero ? this.hero : this.villain;
            const defender = isHero ? this.villain : this.hero;

            let damage = 10;

            // Verificar se o defensor estava em modo defesa no turno anterior
            if (defender.defenseMode) {
                damage /= 2; // Reduz o dano pela metade se estava em defesa
            }

            if (!isHero && this.isNight) {
                damage += 5; // Aumenta em 5 o dano do vilão à noite
            }

            if (!defender.defenseMode) {
                defender.life -= damage; // Ataque normal
            } else {
                defender.life -= damage / 2; // Dano reduzido em modo defesa
            }
            defender.defenseMode = false;
            this.incrementTurn();
            this.checkGameOver();

            // Atualizar a barra de vida
            this.updateLifeBars();

            // Atualizar a visibilidade da mensagem "Attack up!" após o ataque
            this.updateAttackUpVisibility();

            // Se o herói atacou, inicie a animação da katana
            if (isHero) {
                this.animateKatana();
            }

            // Vilão faz uma ação se for o turno do herói
            if (isHero && !this.gameOver) {
                setTimeout(this.villainAction, 1000); // Pequeno atraso para simular o turno do vilão
            }
        },
        defense(isHero) {
            const characterElement = isHero ? document.querySelector('.hero .sprite') : document.querySelector('.villain .sprite');
            const shieldElement = isHero ? document.getElementById('hero-shield') : document.getElementById('villain-shield');

            if (shieldElement && characterElement) {
                // Obter as dimensões e posição do personagem
                const characterRect = characterElement.getBoundingClientRect();
                const parentRect = characterElement.offsetParent.getBoundingClientRect(); // Posição relativa ao contêiner pai

                // Ajustar o escudo para cobrir o personagem e ser ligeiramente maior
                shieldElement.style.width = `${characterRect.width * 1.2}px`;  // 20% maior
                shieldElement.style.height = `${characterRect.height * 1.2}px`;  // 20% maior

                // Ajustar a posição do escudo em relação ao personagem
                if (isHero) {
                    // Posicionar sobre o herói
                    shieldElement.style.left = `${characterRect.left - parentRect.left}px`;
                    shieldElement.style.top = `${characterRect.top - parentRect.top}px`;
                } else {
                    // Posicionar abaixo do vilão
                    shieldElement.style.left = `${characterRect.left - parentRect.left}px`;
                    shieldElement.style.top = `${characterRect.bottom - parentRect.top}px`;
                }

                shieldElement.style.display = 'block';  // Mostrar o escudo
            }

            // Ativar modo defesa no personagem
            if (isHero) {
                this.hero.defenseMode = true;
            } else {
                this.villain.defenseMode = true;
            }

            // Ocultar o escudo após o turno do adversário
            const defenseDuration = 1000;  // Duração do turno do adversário
            setTimeout(() => {
                shieldElement.style.display = 'none';
            }, defenseDuration);

            this.incrementTurn();

            // Se o herói está defendendo, o vilão deve agir depois
            if (isHero && !this.gameOver) {
                setTimeout(this.villainAction, defenseDuration);
            }
        },
        usePotion(isHero) {
            const character = isHero ? this.hero : this.villain;
            if (!character.potionUsed) { // Usar poção apenas uma vez
                character.life = 100; // Restaurar 100% da vida
                character.potionUsed = true; // Marcar que a poção foi usada
            }
            this.incrementTurn();

            // Vilão faz uma ação se for o turno do herói
            if (isHero && !this.gameOver) {
                setTimeout(this.villainAction, 1000);
            }
        },
        villainAction() {
            if (this.gameOver) return;

            const actions = ['attack', 'defense'];

            // Adicionar 'usePotion' como opção somente se o vilão ainda não tiver usado a poção
            if (!this.villain.potionUsed) {
                actions.push('usePotion');
            }

            const randomAction = actions[Math.floor(Math.random() * actions.length)];

            if (randomAction === 'attack') {
                this.animateFireball(); // Inicie a animação da fireball ao atacar
            }

            this[randomAction](false); // Ações do vilão (sem fugir)
        },
        animateFireball() {
            const fireball = document.querySelector('.fireball');
            const villain = document.querySelector('.villain');
            const hero = document.querySelector('.hero');

            if (!fireball || !villain || !hero) return;

            // Obtenha as posições absolutas do vilão e do herói
            const villainRect = villain.getBoundingClientRect();
            const heroRect = hero.getBoundingClientRect();

            // Defina a posição inicial da fireball
            fireball.style.left = `${villainRect.left + window.scrollX + villainRect.width / 2}px`;
            fireball.style.top = `${villainRect.top + window.scrollY + villainRect.height / 2}px`;
            fireball.style.transform = 'translate(-50%, -50%)'; // Centralize a fireball em relação ao ponto inicial
            fireball.style.display = 'block'; // Torne a fireball visível

            // Calcule a distância e a duração da animação
            const distanceX = heroRect.left + window.scrollX - (villainRect.left + window.scrollX);
            const distanceY = heroRect.top + window.scrollY - (villainRect.top + window.scrollY);
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            // Defina a animação da fireball usando `transform` e `transition`
            fireball.style.transition = `transform ${distance / 1000}s linear`; // Ajuste a duração conforme necessário
            fireball.style.transform = `translate(${distanceX}px, ${distanceY}px)`;

            // Esconda a fireball após a animação e atualize a barra de vida
            setTimeout(() => {
                fireball.style.display = 'none';
                fireball.style.transform = 'translate(0, 0)'; // Restaure a posição original
            }, distance / 1000 * 1000); // Ajuste o tempo conforme a duração da animação
        },
        animateKatana() {
            const katana = document.querySelector('.katana');
            const hero = document.querySelector('.hero');
            const villain = document.querySelector('.villain');

            if (!katana || !hero || !villain) return;

            // Obtenha as posições absolutas do herói e do vilão
            const heroRect = hero.getBoundingClientRect();
            const villainRect = villain.getBoundingClientRect();

            // Defina a posição inicial da katana
            katana.style.left = `${heroRect.left + heroRect.width / 2}px`;
            katana.style.top = `${heroRect.top + heroRect.height / 2}px`;
            katana.style.transform = 'translate(-50%, -50%)'; // Centralize a katana
            katana.style.display = 'block'; // Torne a katana visível

            // Calcule a distância e a duração da animação
            const distanceX = villainRect.left + window.scrollX - (heroRect.left + heroRect.width / 2);
            const distanceY = villainRect.top + window.scrollY - (heroRect.top + heroRect.height / 2);
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            // Defina a animação da katana usando `transform` e `transition`
            katana.style.transition = `transform ${distance / 1000}s linear`; // Ajuste a duração conforme necessário
            katana.style.transform = `translate(${distanceX}px, ${distanceY}px)`;

            // Esconda a katana após a animação e atualize a barra de vida
            setTimeout(() => {
                katana.style.display = 'none';
                katana.style.transform = 'translate(0, 0)'; // Restaure a posição original
            }, distance / 1000 * 1000); // Ajuste o tempo conforme a duração da animação
        },
        incrementTurn() {
            this.turn++;
            if (this.turn % 6 === 0) {
                this.toggleDayNight(); // Mudar fundo a cada 6 turnos
            }
        },
        toggleDayNight() {
            this.isNight = !this.isNight;
            document.body.style.backgroundImage = this.isNight ? "url('noite.gif')" : "url('dia.gif')";
        },
        checkGameOver() {
            if (this.hero.life <= 0) {
                this.hero.life = 0; // Garantir que a vida do herói não seja negativa
                this.winnerMessage = "Vilão venceu!";
                this.gameOver = true;
                this.stopBackgroundMusic(); // Parar a música de fundo
                this.playEvilLaugh(); // Tocar risada do vilão
            } else if (this.villain.life <= 0) {
                this.villain.life = 0; // Garantir que a vida do vilão não seja negativa
                this.winnerMessage = "Herói venceu!";
                this.gameOver = true;
                this.stopBackgroundMusic(); // Parar a música de fundo
                this.playVictoryMusic(); // Tocar música de vitória
            }
        },
        restartGame() {
            // Reiniciar o jogo
            this.hero.life = 100;
            this.villain.life = 100;
            this.hero.potionUsed = false;
            this.villain.potionUsed = false;
            this.gameOver = false;
            this.turn = 0;
            this.isNight = false;
            document.body.style.backgroundImage = "url('dia.gif')";

            // Atualizar as barras de vida após reiniciar
            this.updateLifeBars();

            // Ocultar a mensagem "Attack up!" após reiniciar
            this.updateAttackUpVisibility();

            // Parar a música de vitória ou a risada do vilão se estiver tocando
            this.stopVictoryMusic();
            this.stopEvilLaugh();

            // Reiniciar a música de fundo
            this.playBackgroundMusic();
        },
        closeGame() {
            // Fechar a página
            window.close();
        },
        updateLifeBars() {
            // Atualizar a barra de vida do herói
            const heroLifeBar = document.getElementById('hero-life');
            if (heroLifeBar) {
                heroLifeBar.style.width = this.hero.life + '%';
            }

            // Atualizar a barra de vida do vilão
            const villainLifeBar = document.getElementById('villain-life');
            if (villainLifeBar) {
                villainLifeBar.style.width = this.villain.life + '%';
            }
        },
        updateAttackUpVisibility() {
            const attackUpElement = document.getElementById('attack-up');
            if (attackUpElement) {
                if (!this.isNight) {
                    attackUpElement.style.display = 'none';
                } else if (!this.villain.defenseMode) {
                    attackUpElement.style.display = 'block';
                } else {
                    attackUpElement.style.display = 'none'; // Ocultar "Attack Up!" quando o vilão estiver em defesa
                }
            }
        },
        playBackgroundMusic() {
            const backgroundMusic = document.getElementById('background-music');
            if (backgroundMusic) {
                backgroundMusic.play().catch(error => {
                    console.log("Não foi possível reproduzir a música de fundo: ", error);
                });
                backgroundMusic.loop = true; // Repetir a música de fundo
            }
        },
        stopBackgroundMusic() {
            const backgroundMusic = document.getElementById('background-music');
            if (backgroundMusic) {
                backgroundMusic.pause();
                backgroundMusic.currentTime = 0; // Reiniciar a música
            }
        },
        playVictoryMusic() {
            const victoryMusic = document.getElementById('victory-music');
            if (victoryMusic) {
                victoryMusic.play().catch(error => {
                    console.log("Não foi possível reproduzir a música de vitória: ", error);
                });
            }
        },
        stopVictoryMusic() {
            const victoryMusic = document.getElementById('victory-music');
            if (victoryMusic) {
                victoryMusic.pause();
                victoryMusic.currentTime = 0; // Reiniciar a música
            }
        },
        playEvilLaugh() {
            const evilLaugh = document.getElementById('evil-laugh');
            if (evilLaugh) {
                evilLaugh.play().catch(error => {
                    console.log("Não foi possível reproduzir a risada do vilão: ", error);
                });
            }
        },
        stopEvilLaugh() {
            const evilLaugh = document.getElementById('evil-laugh');
            if (evilLaugh) {
                evilLaugh.pause();
                evilLaugh.currentTime = 0; // Reiniciar a risada
            }
        },
    }
}).mount('#app');
