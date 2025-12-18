// Estado do Jogo
        
const state = {
    view: {
        squares: document.querySelectorAll('.square'),
        enemy: null,
                timeLeft: document.querySelector('#time-left'),
                score: document.querySelector('#score'),
                lives: document.querySelector('#lives')
            },
            values: {
                gameVelocity: 1000,
                hitPosition: 0,
                result: 0,
                currentTime: 60,
                lives: 3
            },
            actions: {
                timerId: null,
                countDownTimerId: null
            }
        };

        // Sons
        function playSound() {
            const audio = document.getElementById('hit-sound');
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play failed:', e));
            
            // Som alternativo usando Web Audio API
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (e) {
                console.log('Web Audio API failed:', e);
            }
        }

        // Mover Ralph para quadrado aleatório
        function randomSquare() {
            state.view.squares.forEach(square => {
                square.classList.remove('enemy');
            });

            let randomNumber = Math.floor(Math.random() * 9);
            let randomSquare = state.view.squares[randomNumber];
            randomSquare.classList.add('enemy');
            state.values.hitPosition = randomSquare.id;
        }

        // Timer para mover Ralph
        function moveEnemy() {
            state.actions.timerId = setInterval(randomSquare, state.values.gameVelocity);
        }

        // Adicionar listeners de click
        function addListenerHitBox() {
            state.view.squares.forEach(square => {
                square.addEventListener('mousedown', () => {
                    if (square.id === state.values.hitPosition) {
                        // ACERTOU!
                        state.values.result++;
                        state.view.score.textContent = state.values.result;
                        state.values.hitPosition = null;
                        
                        // Tocar som
                        playSound();
                        
                        // Adicionar classe hit (mostra Ralph acertado)
                        square.classList.add('hit');
                        
                        // Criar efeito de partículas
                        createParticles(square);
                        
                        // Remover efeito depois
                        setTimeout(() => {
                            square.classList.remove('hit');
                            square.classList.remove('enemy');
                        }, 300);
                        
                    } else {
                        // ERROU - Penalidade
                        state.values.lives--;
                        state.view.lives.textContent = `x${state.values.lives}`;
                        
                        // Efeito visual de erro
                        square.style.background = 'rgba(255, 0, 0, 0.5)';
                        setTimeout(() => {
                            square.style.background = '';
                        }, 200);
                        
                        if (state.values.lives <= 0) {
                            endGame();
                        }
                    }
                });
            });
        }

        // Criar efeito de partículas ao acertar
        function createParticles(square) {
            const rect = square.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Criar partículas circulares
            for (let i = 0; i < 12; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const angle = (i / 12) * Math.PI * 2;
                const distance = 120;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                
                particle.style.cssText = `
                    left: ${centerX}px;
                    top: ${centerY}px;
                    --tx: ${tx}px;
                    --ty: ${ty}px;
                `;
                
                document.body.appendChild(particle);
                
                setTimeout(() => particle.remove(), 800);
            }
            
            // Criar estrelas
            const stars = ['⭐', '✨', '💫', '🌟'];
            for (let i = 0; i < 4; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.textContent = stars[i];
                
                const angle = (i / 4) * Math.PI * 2;
                const distance = 60;
                const offsetX = Math.cos(angle) * distance;
                const offsetY = Math.sin(angle) * distance;
                
                star.style.cssText = `
                    left: ${centerX + offsetX}px;
                    top: ${centerY + offsetY}px;
                `;
                
                document.body.appendChild(star);
                
                setTimeout(() => star.remove(), 800);
            }
        }

        // Countdown
        function countDown() {
            state.actions.countDownTimerId = setInterval(() => {
                state.values.currentTime--;
                state.view.timeLeft.textContent = state.values.currentTime;

                if (state.values.currentTime <= 0) {
                    endGame();
                }
            }, 1000);
        }

        // Fim de jogo
        function endGame() {
            clearInterval(state.actions.countDownTimerId);
            clearInterval(state.actions.timerId);
            
            document.getElementById('final-score').textContent = `Sua pontuação: ${state.values.result}`;
            document.getElementById('game-over').classList.add('show');
            document.getElementById('restart-btn').classList.add('show');
        }

        // Reiniciar jogo
        function restartGame() {
            // Reset valores
            state.values.currentTime = 60;
            state.values.result = 0;
            state.values.lives = 3;
            
            // Reset display
            state.view.timeLeft.textContent = state.values.currentTime;
            state.view.score.textContent = state.values.result;
            state.view.lives.textContent = `x${state.values.lives}`;
            
            // Esconder game over
            document.getElementById('game-over').classList.remove('show');
            document.getElementById('restart-btn').classList.remove('show');
            
            // Limpar quadrados
            state.view.squares.forEach(square => {
                square.classList.remove('enemy');
            });
            
            // Reiniciar jogo
            initialize();
        }

        // Inicializar
        function initialize() {
            moveEnemy();
            countDown();
        }

        // Iniciar quando carregar
        window.addEventListener('DOMContentLoaded', () => {
            addListenerHitBox();
            initialize();
        });
    