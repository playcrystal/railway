const express = require("express");
const http = require("http");
const mineflayer = require('mineflayer');
const pvp = require('mineflayer-pvp').plugin;
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const armorManager = require('mineflayer-armor-manager');
const AutoAuth = require('mineflayer-auto-auth');
const app = express();

app.use(express.json());

app.get("/", (_, res) => res.sendFile(__dirname + "/index.html"));
app.listen(process.env.PORT);

setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.repl.co/`);
}, 224000);

// Função para criar o bot
function createBot() {
  const bot = mineflayer.createBot({
    host: 'hub.playcrystalmc.xyz',
    version: false, // Pode ser alterado para uma versão específica, ex: '1.16.5'
    username: 'CrystalMine',
    port: 27411,
    plugins: [AutoAuth],
    AutoAuth: 'bot112022'
  });

  // Carregar plugins
  bot.loadPlugin(pvp);
  bot.loadPlugin(armorManager);
  bot.loadPlugin(pathfinder);

  // Reconexão automática com delay
  bot.on('end', () => {
    console.log('Bot desconectado. Reconectando em 5 segundos...');
    setTimeout(createBot, 5000); // Reconecta após 5 segundos
  });

  // Tratamento de erros
  bot.on('error', (err) => {
    console.error('Erro no bot:', err);
  });

  bot.on('kicked', (reason) => {
    console.log('Bot kickado:', reason);
  });

  // Ações periódicas para evitar inatividade
  setInterval(() => {
    if (bot.entity) {
      bot.setControlState('jump', true); // Pula periodicamente
      setTimeout(() => bot.setControlState('jump', false), 500); // Para de pular após 0.5s
      bot.chat('Estou aqui!'); // Envia uma mensagem no chat
    }
  }, 60000); // Executa a cada 60 segundos

  // Comandos de guarda (opcional)
  let guardPos = null;

  function guardArea(pos) {
    guardPos = pos.clone();
    if (!bot.pvp.target) {
      moveToGuardPos();
    }
  }

  function stopGuarding() {
    guardPos = null;
    bot.pvp.stop();
    bot.pathfinder.setGoal(null);
  }

  function moveToGuardPos() {
    const mcData = require('minecraft-data')(bot.version);
    bot.pathfinder.setMovements(new Movements(bot, mcData));
    bot.pathfinder.setGoal(new goals.GoalBlock(guardPos.x, guardPos.y, guardPos.z));
  }

  bot.on('stoppedAttacking', () => {
    if (guardPos) {
      moveToGuardPos();
    }
  });

  bot.on('physicTick', () => {
    if (bot.pvp.target) return;
    if (bot.pathfinder.isMoving()) return;

    const entity = bot.nearestEntity();
    if (entity) bot.lookAt(entity.position.offset(0, entity.height, 0));
  });

  bot.on('physicTick', () => {
    if (!guardPos) return;
    const filter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 16 &&
      e.mobType !== 'Armor Stand';
    const entity = bot.nearestEntity(filter);
    if (entity) {
      bot.pvp.attack(entity);
    }
  });

  bot.on('chat', (username, message) => {
    if (message === 'guard') {
      const player = bot.players[username];
      if (player) {
        bot.chat('I will!');
        guardArea(player.entity.position);
      }
    }
    if (message === 'stop') {
      bot.chat('I will stop!');
      stopGuarding();
    }
  });
}

// Iniciar o bot
createBot();
