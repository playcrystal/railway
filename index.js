const mineflayer = require('mineflayer');

// Configurações do bot
const bot = mineflayer.createBot({
  host: 'hub.playcrystalmc.xyz', // Substitua pelo IP do servidor
  port: 27411,   // Substitua pela porta do servidor
  username: 'CrystalMine',       // Substitua pelo nome do bot
  version: false,              // Deixe falso para detectar automaticamente a versão do servidor
});

// Evento ao conectar
bot.on('login', () => {
  console.log(${bot.username} conectado com sucesso ao servidor!);
});

// Evento para manter o bot ativo
bot.on('end', () => {
  console.log('Conexão encerrada. Tentando reconectar...');
  setTimeout(() => {
    bot.end(); // Encerra qualquer conexão ativa
    bot.connect(); // Reconnecta ao servidor
  }, 5000); // Tenta reconectar após 5 segundos
});

// Evento ao encontrar erros
bot.on('error', (err) => {
  console.error('Erro detectado:', err);
  setTimeout(() => {
    bot.end(); // Encerra qualquer conexão ativa
    bot.connect(); // Reconnecta ao servidor
  }, 5000); // Tenta reconectar após 5 segundos
});

// Manter o bot ativo mesmo que o servidor desconecte
bot.on('kicked', (reason) => {
  console.log(Bot expulso do servidor: ${reason});
  setTimeout(() => {
    bot.end();
    bot.connect();
  }, 5000);
});
