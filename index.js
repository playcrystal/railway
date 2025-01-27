const mineflayer = require('mineflayer');
const pvp = require('mineflayer-pvp').plugin;
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const armorManager = require('mineflayer-armor-manager');
const AutoAuth = require('mineflayer-auto-auth');

function createBot() {
  const bot = mineflayer.createBot({
    host: 'hub.playcrystalmc.xyz', // IP do servidor
    port: 27411, // Porta do servidor
    username: 'CrystalMine', // Nome do bot
    plugins: [AutoAuth],
    AutoAuth: { password: 'bot112022' } // Senha do bot
  });

  bot.loadPlugin(pvp);
  bot.loadPlugin(armorManager);
  bot.loadPlugin(pathfinder);

  bot.on('spawn', () => {
    console.log(${bot.username} conectado ao servidor!);
  });

  bot.on('kicked', (reason) => {
    console.log(Fui desconectado: ${reason});
  });

  bot.on('error', (err) => {
    console.log(Erro: ${err});
  });

  bot.on('end', () => {
    console.log('Reconectando...');
    setTimeout(createBot, 5000); // Tenta reconectar após 5 segundos
  });

  // Funcionalidade de patrulha
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
    if (!guardPos) return;
    const filter = (e) => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 16 &&
                          e.mobType !== 'Armor Stand';
    const entity = bot.nearestEntity(filter);
    if (entity) {
      bot.pvp.attack(entity);
    }
  });

  bot.on('chat', (username, message) => {
    const player = bot.players[username];
    if (!player || !player.entity) return;

    if (message === 'guard') {
      bot.chat('Vou proteger esta área!');
      guardArea(player.entity.position);
    }

    if (message === 'stop') {
      bot.chat('Parando proteção.');
      stopGuarding();
    }
  });
}

createBot();
