/* ============================================================
   SUNDERFALL - card data, banners, keywords, campaign
   ============================================================ */

var BANNERS = {
  auric: {
    name: 'Auric Dominion', short: 'Dominion', icon: 'crown',
    col: '#d9a441', ink: '#fff1cf', sky: ['#3a240c', '#8a5a1a'], ground: '#1d1206',
    tag: 'Shields, steadfast knights, holy light',
    blurb: 'A star-born theocracy that descended from the void in burning cathedral-ships to reclaim the shards of their murdered god as holy relics.'
  },
  eld: {
    name: 'Verdant Eld', short: 'Eld', icon: 'tree',
    col: '#5fb38a', ink: '#e4fff1', sky: ['#0b2a22', '#2f6b55'], ground: '#06150f',
    tag: 'Growth, flyers, healing, ramp',
    blurb: 'The ancient wardens of the starwood. They remember the world before the Sunderfall and mean to see it outlast the strangers from the sky.'
  },
  hollow: {
    name: 'Hollow Host', short: 'Host', icon: 'skull',
    col: '#9d7be0', ink: '#f1e8ff', sky: ['#140b22', '#45286a'], ground: '#0a0612',
    tag: 'Venom, sacrifice, the dead that return',
    blurb: 'The dead of the Sunderfall, risen where the shards burned deepest and bound to the will of the Hollow King.'
  },
  forge: {
    name: 'Forgeborn Clans', short: 'Clans', icon: 'hammer',
    col: '#e2703a', ink: '#fff0e2', sky: ['#2a0d06', '#8f3412'], ground: '#160603',
    tag: 'Charge, overrun, fire and fury',
    blurb: 'Dwarven forge-holds and orc war-clans sworn together around the Shardforge, a furnace lit by a piece of the dead god itself.'
  },
  unbound: {
    name: 'Unbound', short: 'Unbound', icon: 'eye',
    col: '#8f9bb0', ink: '#eef2f8', sky: ['#14171d', '#3a4252'], ground: '#0a0b0e',
    tag: 'Mercenaries and constructs for any deck',
    blurb: 'Sellswords, shard-constructs and things from the rifts. They answer to no banner and fit into any warband.'
  }
};
var BANNER_ORDER = ['auric', 'eld', 'hollow', 'forge'];

var KEYWORDS = {
  charge:   { name: 'Charge',   desc: 'Can attack the turn it is deployed.' },
  skyborne: { name: 'Skyborne', desc: 'Can only be blocked by units with Skyborne or Reach.' },
  reach:    { name: 'Reach',    desc: 'Can block Skyborne units.' },
  vigil:    { name: 'Vigil',    desc: 'Attacking does not exhaust this unit, so it can still block next turn.' },
  swift:    { name: 'Swift',    desc: 'Deals combat damage before units without Swift.' },
  venom:    { name: 'Venom',    desc: 'Any combat damage this deals to a unit destroys it.' },
  siphon:   { name: 'Siphon',   desc: 'Combat damage this deals also restores that much health to your Warden.' },
  overrun:  { name: 'Overrun',  desc: 'When blocked, damage beyond what kills the blocker hits the enemy Warden.' },
  bulwark:  { name: 'Bulwark',  desc: 'Cannot attack.' },
  warded:   { name: 'Warded',   desc: 'Cannot be targeted by enemy cards.' },
  shielded: { name: 'Shielded', desc: 'The first time this would take damage, prevent it and remove Shielded.' }
};
var KW_ORDER = ['charge', 'skyborne', 'reach', 'vigil', 'swift', 'venom', 'siphon', 'overrun', 'shielded', 'warded', 'bulwark'];

var TRIGGERS = {
  deploy:   { name: 'Deploy',      desc: 'Happens when you play this unit.' },
  death:    { name: 'Last Breath', desc: 'Happens when this unit is destroyed.' },
  dawn:     { name: 'Dawn',        desc: 'Happens at the start of your turn.' },
  dusk:     { name: 'Dusk',        desc: 'Happens at the end of your turn.' },
  assault:  { name: 'Assault',     desc: 'Happens when this unit attacks.' },
  allyDies: { name: 'Harvest',     desc: 'Happens whenever another friendly unit is destroyed.' },
  spell:    { name: 'Empower',     desc: 'Happens whenever you cast a spell.' }
};

var RARITY = {
  C: { name: 'Common',   craft: 40,   salvage: 5,   col: '#b9b4a7' },
  U: { name: 'Uncommon', craft: 100,  salvage: 20,  col: '#86bcd9' },
  R: { name: 'Rare',     craft: 400,  salvage: 80,  col: '#e6b94f' },
  M: { name: 'Mythic',   craft: 1200, salvage: 300, col: '#ef6a3d' }
};

var CARDS = [];
var CARD = {};

function U_(id, name, banner, cost, atk, hp, rar, kw, fx, icon, lore, ext) {
  var c = { id: id, name: name, banner: banner, type: 'unit', cost: cost, atk: atk, hp: hp, rarity: rar,
            kw: kw || [], fx: fx || [], icon: icon, lore: lore || '' };
  if (ext) { for (var k in ext) { if (ext.hasOwnProperty(k)) c[k] = ext[k]; } }
  return c;
}
function S_(id, name, banner, cost, rar, fx, icon, lore, ext) {
  var c = { id: id, name: name, banner: banner, type: 'spell', cost: cost, rarity: rar,
            kw: [], fx: fx || [], icon: icon, lore: lore || '' };
  if (ext) { for (var k in ext) { if (ext.hasOwnProperty(k)) c[k] = ext[k]; } }
  return c;
}
function F(on, d, t, more) {
  var e = { on: on, 'do': d, t: t || null };
  if (more) { for (var k in more) { if (more.hasOwnProperty(k)) e[k] = more[k]; } }
  return e;
}

var CARD_LIST = [
  /* ---------------- AURIC DOMINION ---------------- */
  U_('a01', 'Candle Acolyte', 'auric', 1, 1, 2, 'C', [], [F('spell', 'buff', 'self', { a: 1, h: 1 })], 'flame',
     'She carries the last light of a dead star in a cup of brass.'),
  U_('a02', 'Gilded Sentinel', 'auric', 2, 2, 3, 'C', ['vigil'], [F('dusk', 'heal', 'myWarden', { n: 1 })], 'shield',
     'It has stood watch for nine hundred years and does not intend to stop.'),
  U_('a03', 'Cathedral Herald', 'auric', 2, 2, 2, 'C', [], [F('deploy', 'buff', 'otherFriendly', { a: 1, h: 1 })], 'scroll',
     'Every proclamation ends the same way: kneel, or be knelt.'),
  U_('a04', 'Bastion Servitor', 'auric', 2, 1, 5, 'C', ['bulwark', 'reach'], [], 'tower',
     'Half pilgrim, half wall, wholly devoted.'),
  U_('a05', 'Descent Lancer', 'auric', 3, 2, 2, 'C', ['swift', 'shielded'], [], 'spear',
     'They fall from the void-ships in burning shells and land already charging.'),
  S_('a06', 'Litany of Steel', 'auric', 1, 'C', [F('cast', 'shield', 'friendlyUnit'), F('cast', 'buff', 'it', { a: 1, h: 0 })], 'rune',
     'Recited once, the words become armor.', { text: 'Give a friendly unit Shielded and +1/+0.' }),
  U_('a07', 'Penitent Blade', 'auric', 4, 4, 4, 'C', ['swift'], [], 'sword',
     'Atonement is measured in edges.'),
  S_('a08', 'Sanctified Ray', 'auric', 3, 'C', [F('cast', 'damage', 'enemyUnit', { n: 3 }), F('cast', 'heal', 'myWarden', { n: 3 })], 'star',
     'The light judges. The light forgives. The light does not miss.'),
  U_('a09', 'Choir-Captain', 'auric', 3, 2, 3, 'U', [], [], 'helm',
     'Her hymn is a war-march sung at the pitch of a dying sun.', { aura: { atk: 1, who: 'otherFriendly' } }),
  U_('a10', 'Ash Inquisitor', 'auric', 4, 3, 3, 'U', [], [F('deploy', 'destroy', 'enemyUnit', { f: { maxAtk: 2 } })], 'eye',
     'Doubt is a wound. She is a surgeon.'),
  S_('a11', 'Hymn of the Descent', 'auric', 4, 'U', [F('cast', 'summon', null, { token: 't_trooper', n: 2 })], 'wing',
     'When the choir sings, the sky opens and soldiers fall like rain.'),
  U_('a12', 'Aegis Bearer', 'auric', 5, 4, 6, 'U', ['vigil'], [F('deploy', 'shield', 'otherFriendly')], 'shield',
     'Behind her tower shield, a whole company sleeps soundly.'),
  U_('a13', 'Reliquary Knight', 'auric', 4, 3, 4, 'R', [], [F('dawn', 'buff', 'randomFriendly', { a: 1, h: 1 })], 'helm',
     'The shard in his breastplate still burns. He calls it a blessing.'),
  U_('a14', 'Gunship Seraph', 'auric', 6, 4, 4, 'R', ['skyborne', 'vigil'], [F('assault', 'damage', 'allEnemyUnits', { n: 1 })], 'wing',
     'Its engines sing hymns. Its cannons sing louder.'),
  S_('a15', 'Edict of Ash', 'auric', 7, 'R', [F('cast', 'destroy', 'allUnits'), F('cast', 'heal', 'myWarden', { n: 6 })], 'crown',
     'Purity is a field of ash with nothing left in it to doubt.'),
  U_('a16', 'Saint-Regent Aurelia', 'auric', 7, 6, 6, 'M', ['vigil', 'shielded'],
     [F('deploy', 'buff', 'otherFriendlyUnits', { a: 1, h: 1 }), F('deploy', 'shield', 'otherFriendlyUnits')], 'crown',
     'She wears the god\'s crown-shard. She is the god\'s last word.', { legendary: true }),

  /* ---------------- VERDANT ELD ---------------- */
  U_('e01', 'Moonmoth', 'eld', 1, 1, 2, 'C', ['skyborne'], [], 'wing',
     'Where moonmoths gather, the old paths still open.'),
  U_('e02', 'Glade Archer', 'eld', 2, 2, 1, 'C', ['reach'], [F('deploy', 'damage', 'enemyAny', { n: 1 })], 'bow',
     'She fires before you see the bow, and you never see the bow.'),
  S_('e03', 'Bloom', 'eld', 1, 'C', [F('cast', 'buff', 'friendlyUnit', { a: 1, h: 2 })], 'tree',
     'Spring comes when the Eld command it.'),
  S_('e04', 'Wildgrowth', 'eld', 2, 'C', [F('cast', 'ramp', null, { n: 1 }), F('cast', 'draw', null, { n: 1 })], 'tree',
     'The roots remember how deep the world goes.'),
  U_('e05', 'Rootwarden', 'eld', 3, 2, 5, 'C', ['reach'], [], 'tree',
     'Patient as stone. Faster than stone. Angrier than stone.'),
  U_('e06', 'Hawk Rider', 'eld', 3, 2, 3, 'C', ['skyborne', 'swift'], [], 'beast',
     'The silverhawks choose their riders. Most are chosen only once.'),
  U_('e07', 'Elder Stag', 'eld', 4, 4, 4, 'C', [], [F('deploy', 'heal', 'myWarden', { n: 3 })], 'beast',
     'Wounds close in its shadow.'),
  S_('e15', 'Starsong Volley', 'eld', 3, 'C', [F('cast', 'damage', 'enemyUnit', { n: 2 }), F('cast', 'draw', null, { n: 1 })], 'bow',
     'The archers sing as they loose. The song is the aim.'),
  U_('e08', 'Saplingkin', 'eld', 2, 1, 2, 'U', [], [F('dawn', 'buff', 'self', { a: 1, h: 1 })], 'tree',
     'Every dawn a little taller. Every dusk a little hungrier.'),
  U_('e09', 'Moonwell Oracle', 'eld', 3, 2, 3, 'U', [], [F('deploy', 'draw', null, { n: 1 })], 'orb',
     'She reads the future in still water, and rarely likes it.'),
  S_('e10', 'Entangling Roots', 'eld', 2, 'U', [F('cast', 'exhaust', 'enemyUnit'), F('cast', 'draw', null, { n: 1 })], 'rune',
     'The forest does not fight. It simply refuses to let you leave.'),
  U_('e11', 'Grove Shepherd', 'eld', 5, 4, 5, 'U', ['reach'], [F('deploy', 'summon', null, { token: 't_thornling', n: 1 })], 'tree',
     'It tends the young groves. It does not like visitors.'),
  U_('e12', 'Silverwing Roc', 'eld', 5, 4, 3, 'R', ['skyborne'], [F('deploy', 'bounce', 'enemyUnit')], 'wing',
     'Its shadow alone has ended wars.'),
  S_('e13', 'Thornstorm', 'eld', 5, 'R', [F('cast', 'damage', 'allEnemyUnits', { n: 2 })], 'claw',
     'A thousand thorns, each one an accusation.'),
  U_('e14', 'Ancient of Whispers', 'eld', 6, 5, 7, 'R', ['reach', 'vigil'], [], 'tree',
     'It has heard every secret ever spoken in the wood, and keeps them all.'),
  U_('e16', 'Eldmother Ysolde', 'eld', 7, 6, 6, 'M', ['reach'],
     [F('deploy', 'heal', 'myWarden', { n: 5 }), F('dawn', 'summon', null, { token: 't_thornling', n: 1 })], 'crown',
     'She planted the first tree. She intends to plant the last.', { legendary: true }),

  /* ---------------- HOLLOW HOST ---------------- */
  U_('h01', 'Gravecrawler', 'hollow', 1, 1, 1, 'C', [], [F('death', 'summon', null, { token: 't_husk', n: 1 })], 'skull',
     'It was buried twice. Neither burial took.'),
  U_('h02', 'Ashen Thrall', 'hollow', 2, 3, 1, 'C', [], [F('death', 'damage', 'enemyWarden', { n: 1 })], 'claw',
     'It feels nothing, and it is very good at that.'),
  U_('h03', 'Rot Adder', 'hollow', 2, 1, 2, 'C', ['venom'], [], 'fang',
     'One bite. One funeral.'),
  S_('h04', 'Offering of Bone', 'hollow', 1, 'C', [F('cast', 'destroy', 'friendlyUnit'), F('cast', 'draw', null, { n: 2 })], 'rune',
     'The Host gives nothing freely, least of all its dead.'),
  S_('h05', 'Siphon Soul', 'hollow', 2, 'C', [F('cast', 'damage', 'enemyAny', { n: 2 }), F('cast', 'heal', 'myWarden', { n: 2 })], 'orb',
     'Warmth is wasted on the living.'),
  U_('h06', 'Wailing Shade', 'hollow', 3, 2, 3, 'C', ['skyborne', 'siphon'], [], 'ghost',
     'Its scream is the sound of a name being forgotten.'),
  U_('h07', 'Barrow Knight', 'hollow', 4, 3, 5, 'C', ['siphon'], [], 'helm',
     'He swore to guard the king beyond death. He meant it.'),
  U_('h15', 'Cairn Wight', 'hollow', 5, 4, 5, 'C', [], [F('deploy', 'summon', null, { token: 't_husk', n: 2 })], 'ghost',
     'It rises with an honor guard of the unremembered.'),
  U_('h08', 'Carrion Glutton', 'hollow', 3, 3, 3, 'U', [], [F('allyDies', 'buff', 'self', { a: 1, h: 1 })], 'claw',
     'Every fallen ally is a feast.'),
  S_('h09', 'Blightfog', 'hollow', 2, 'U', [F('cast', 'buff', 'allEnemyUnits', { a: -1, h: -1 })], 'ghost',
     'Breathe deep. Everyone does, eventually.'),
  U_('h10', 'Necrovox Adept', 'hollow', 4, 3, 3, 'U', [], [F('deploy', 'resurrect', null)], 'book',
     'Death is a door. She keeps the key on a chain of finger bones.'),
  U_('h12', 'Bone Colossus', 'hollow', 6, 6, 5, 'U', [], [F('death', 'summon', null, { token: 't_husk', n: 3 })], 'skull',
     'Built from an army, and still marching like one.'),
  U_('h11', 'Dirge Choir', 'hollow', 4, 3, 5, 'R', [], [F('allyDies', 'damage', 'enemyWarden', { n: 1 }), F('allyDies', 'heal', 'myWarden', { n: 1 })], 'ghost',
     'They sing for every soul the Host collects.'),
  U_('h13', 'Nightwing Reaver', 'hollow', 5, 4, 4, 'R', ['skyborne', 'venom'], [], 'wing',
     'It hunts by the warmth of a heartbeat.'),
  S_('h14', 'Grave Verdict', 'hollow', 4, 'R', [F('cast', 'destroy', 'enemyUnit')], 'skull',
     'No appeal. No reprieve. No grave deep enough.'),
  U_('h16', 'Morvain, the Hollow King', 'hollow', 7, 5, 6, 'M', ['venom', 'siphon'],
     [F('deploy', 'destroy', 'allEnemyUnits', { f: { maxHp: 2 } })], 'crown',
     'He was the first to die in the Sunderfall. He will be the last to stay dead.', { legendary: true }),

  /* ---------------- FORGEBORN CLANS ---------------- */
  U_('f01', 'Ironhide Runt', 'forge', 1, 2, 1, 'C', ['charge'], [], 'hammer',
     'Small. Loud. Bites ankles. Wins anyway.'),
  U_('f02', 'Blast Sapper', 'forge', 2, 2, 2, 'C', [], [F('death', 'damage', 'randomEnemy', { n: 2 })], 'flame',
     'Lit fuse, short temper, shorter life expectancy.'),
  S_('f03', 'Cinderbolt', 'forge', 1, 'C', [F('cast', 'damage', 'enemyAny', { n: 2 })], 'flame',
     'Forge-slag, flung hard.'),
  U_('f04', 'Warg Rider', 'forge', 3, 3, 3, 'C', ['charge'], [], 'beast',
     'The warg decides where they go. The rider decides who dies.'),
  U_('f05', 'Hammerguard', 'forge', 3, 3, 4, 'C', [], [F('assault', 'tempAtk', 'self', { a: 1 })], 'hammer',
     'Slow to swing. Slower to stop.'),
  S_('f06', 'Molten Volley', 'forge', 3, 'C', [F('cast', 'damage', 'enemyUnit', { n: 4 })], 'flame',
     'The Clans do not aim. They fill the sky and let it sort itself out.'),
  U_('f07', 'Shieldbreaker Berserker', 'forge', 4, 5, 4, 'C', ['overrun'], [], 'axe',
     'Shields are a suggestion.'),
  S_('f15', 'Throwing Axe', 'forge', 2, 'C', [F('cast', 'damage', 'enemyAny', { n: 3 })], 'axe',
     'Every clan-child learns to throw before they learn to read. Most never bother with reading.'),
  U_('f08', 'Skull Drummer', 'forge', 2, 2, 2, 'U', [], [F('deploy', 'buff', 'otherFriendly', { a: 2, h: 0 }), F('deploy', 'grant', 'it', { kw: 'overrun' })], 'skull',
     'The beat of the war-drum becomes the beat of every heart in the horde.',
     { text: 'Deploy: Give another friendly unit +2/+0 and Overrun.' }),
  S_('f09', 'Warcry', 'forge', 3, 'U', [F('cast', 'tempAtk', 'allFriendlyUnits', { a: 2 })], 'rune',
     'Heard across three valleys. Felt across four.'),
  U_('f10', 'Flame Cannoneer', 'forge', 4, 3, 4, 'U', [], [F('spell', 'damage', 'randomEnemy', { n: 1 }), F('dusk', 'damage', 'randomEnemyUnit', { n: 1 })], 'tower',
     'Dwarven engineering: if it does not work, add powder.'),
  U_('f11', 'Ironjaw Siege-Rig', 'forge', 5, 5, 4, 'U', ['charge', 'overrun'], [], 'golem',
     'Siege engines are meant to be slow. Nobody told the orcs.'),
  U_('f12', 'Gyro-Bombardier', 'forge', 5, 3, 4, 'R', ['skyborne'], [F('deploy', 'damage', 'enemyAny', { n: 2 })], 'wing',
     'Dwarves cannot fly. They have simply chosen to ignore this.'),
  S_('f13', 'Eruption', 'forge', 5, 'R', [F('cast', 'damage', 'allUnits', { n: 3 })], 'flame',
     'Now and then the Shardforge clears its throat.'),
  U_('f14', 'Forgeheart Colossus', 'forge', 6, 6, 6, 'R', ['overrun'], [F('assault', 'damage', 'enemyWarden', { n: 2 })], 'golem',
     'Its heart is a shard. Its temper is a furnace.'),
  U_('f16', 'Grukk Ironmaw, Forgelord', 'forge', 6, 5, 5, 'M', ['charge', 'overrun'], [], 'crown',
     'He forged the Clans into one blade. Now he wants something to cut.',
     { legendary: true, aura: { kw: 'charge', who: 'otherFriendly' } }),

  /* ---------------- UNBOUND ---------------- */
  U_('u01', 'Shard Prospector', 'unbound', 2, 1, 2, 'C', [], [F('deploy', 'draw', null, { n: 1 })], 'orb',
     'Every shard has a price. Every prospector has a grave.'),
  U_('u02', 'Roadwarden Sellsword', 'unbound', 2, 2, 3, 'C', [], [], 'sword',
     'Loyal to the end of the contract. Not a moment after.'),
  U_('u03', 'Rift Stalker', 'unbound', 4, 3, 4, 'C', ['skyborne'], [], 'claw',
     'Something came through the rifts when the star fell. Several somethings.'),
  U_('u04', 'Shardstone Golem', 'unbound', 4, 3, 6, 'C', ['bulwark', 'reach'], [], 'golem',
     'Built to guard a vault that is long gone. It guards anyway.'),
  U_('u05', 'Vault Breaker', 'unbound', 3, 3, 3, 'U', ['warded'], [], 'eye',
     'No ward has held her. No lock has kept her.'),
  U_('u06', 'Shard Hunter', 'unbound', 5, 4, 4, 'U', [], [F('deploy', 'damage', 'enemyUnit', { n: 3 })], 'bow',
     'Paid by the shard. Paid well.'),
  U_('u07', 'Shardbound Titan', 'unbound', 8, 8, 8, 'R', ['warded', 'overrun'], [], 'golem',
     'A fragment of the god\'s own engine, walking.'),
  U_('u08', 'Ashmaw, Devourer of Stars', 'unbound', 10, 9, 9, 'M', ['skyborne'], [F('deploy', 'destroy', 'allOtherUnits')], 'drake',
     'It ate the star\'s heart. It is still hungry.', { legendary: true })
];

var TOKEN_LIST = [
  U_('t_trooper', 'Dominion Trooper', 'auric', 0, 2, 2, 'C', ['shielded'], [], 'spear', 'Drop-pod infantry of the Descent.', { token: true }),
  U_('t_thornling', 'Thornling', 'eld', 0, 2, 2, 'C', ['reach'], [], 'tree', 'A sapling with opinions.', { token: true }),
  U_('t_husk', 'Husk', 'hollow', 0, 1, 1, 'C', [], [], 'skull', 'What remains, remains.', { token: true }),
  U_('t_recruit', 'Drill Recruit', 'unbound', 1, 2, 2, 'C', [], [], 'spear', 'Six weeks of drill and a borrowed spear.', { token: true }),
  S_('t_spark', 'Shard Spark', 'unbound', 0, 'C', [F('cast', 'mana', null, { n: 1 })], 'star', 'A sliver of borrowed light.', { token: true })
];

(function () {
  var i;
  for (i = 0; i < CARD_LIST.length; i++) { CARDS.push(CARD_LIST[i]); CARD[CARD_LIST[i].id] = CARD_LIST[i]; }
  for (i = 0; i < TOKEN_LIST.length; i++) { CARD[TOKEN_LIST[i].id] = TOKEN_LIST[i]; }
})();

function maxCopies(id) { return CARD[id] && CARD[id].legendary ? 1 : 2; }

/* ---------- rules text generator (keeps text and effects in sync) ---------- */
var TARGET_TEXT = {
  any: 'any target', enemyAny: 'any enemy', unit: 'a unit', enemyUnit: 'an enemy unit',
  friendlyUnit: 'a friendly unit', otherFriendly: 'another friendly unit', self: 'this unit',
  myWarden: 'your Warden', enemyWarden: 'the enemy Warden', allEnemyUnits: 'all enemy units',
  allUnits: 'all units', allOtherUnits: 'all other units', allFriendlyUnits: 'all friendly units',
  otherFriendlyUnits: 'all other friendly units', randomEnemy: 'a random enemy',
  randomEnemyUnit: 'a random enemy unit', randomOtherFriendly: 'a random other friendly unit',
  randomFriendly: 'a random friendly unit', it: 'it'
};
var NUM_WORD = ['zero', 'a', 'two', 'three', 'four', 'five'];

function targetPhrase(e) {
  var t = TARGET_TEXT[e.t] || 'a target';
  if (e.f) {
    if (e.f.maxAtk !== undefined) t += ' with ' + e.f.maxAtk + ' or less attack';
    if (e.f.maxHp !== undefined) t += ' with ' + e.f.maxHp + ' or less health';
  }
  return t;
}
function signed(n) { return (n >= 0 ? '+' : '') + n; }

function effectText(e) {
  var tp = targetPhrase(e);
  switch (e['do']) {
    case 'damage': return 'Deal ' + e.n + ' damage to ' + tp + '.';
    case 'heal': return 'Restore ' + e.n + ' health to ' + tp + '.';
    case 'draw': return e.n === 1 ? 'Draw a card.' : 'Draw ' + e.n + ' cards.';
    case 'buff':
      if (e.t === 'self') return 'Gain ' + signed(e.a) + '/' + signed(e.h) + '.';
      return 'Give ' + tp + ' ' + signed(e.a) + '/' + signed(e.h) + '.';
    case 'tempAtk':
      if (e.t === 'self') return 'Gain +' + e.a + ' attack this turn.';
      return 'Give ' + tp + ' +' + e.a + ' attack this turn.';
    case 'destroy': return 'Destroy ' + tp + '.';
    case 'summon':
      var tk = CARD[e.token];
      var desc = tk.atk + '/' + tk.hp + ' ' + tk.name + (e.n > 1 ? 's' : '');
      if (tk.kw.length) desc += ' with ' + tk.kw.map(function (k) { return KEYWORDS[k].name; }).join(' and ');
      return 'Summon ' + (NUM_WORD[e.n] || e.n) + ' ' + desc + '.';
    case 'shield': return 'Give ' + tp + ' Shielded.';
    case 'grant': return 'Give ' + tp + ' ' + KEYWORDS[e.kw].name + '.';
    case 'ramp': return 'Gain ' + (e.n === 1 ? 'an empty Shard' : e.n + ' empty Shards') + '.';
    case 'mana': return 'Gain ' + e.n + ' Shard this turn.';
    case 'exhaust': return 'Exhaust ' + tp + '. It cannot block this turn.';
    case 'resurrect': return 'Return the last friendly non-token unit that died this game to the battlefield.';
    case 'bounce': return 'Return ' + tp + ' to its owner\'s hand.';
  }
  return '';
}

function cardText(c) {
  if (c.text) return c.text;
  var parts = [];
  var groups = {}, order = [];
  for (var i = 0; i < c.fx.length; i++) {
    var e = c.fx[i];
    if (!groups[e.on]) { groups[e.on] = []; order.push(e.on); }
    groups[e.on].push(effectText(e));
  }
  for (var j = 0; j < order.length; j++) {
    var on = order[j];
    var body = groups[on].join(' ');
    if (on === 'cast') parts.push(body);
    else parts.push(TRIGGERS[on].name + ': ' + body);
  }
  if (c.aura) {
    if (c.aura.atk) parts.push('Other friendly units have +' + c.aura.atk + ' attack.');
    if (c.aura.kw) parts.push('Other friendly units have ' + KEYWORDS[c.aura.kw].name + '.');
  }
  return parts.join('\n');
}

/* ---------- starter decks ---------- */
function starterDeck(banner) {
  var deck = [], i;
  var byR = function (b, r) { return CARDS.filter(function (x) { return x.banner === b && x.rarity === r; }); };
  var commons = byR(banner, 'C'), uncommons = byR(banner, 'U'), rares = byR(banner, 'R');
  var ub = byR('unbound', 'C');
  for (i = 0; i < commons.length; i++) { deck.push(commons[i].id, commons[i].id); }
  for (i = 0; i < uncommons.length; i++) { deck.push(uncommons[i].id); }
  for (i = 0; i < ub.length; i++) { deck.push(ub[i].id, ub[i].id); }
  deck.push(rares[0].id);
  deck.push('u05');
  return deck;
}

/* ---------- campaign ---------- */
var CAMPAIGN = [
  { id: 1, icon: 'flame', name: 'Brother Cael', title: 'The Wayward Acolyte', banners: ['auric'], level: 1, life: 18, quality: 0, reward: 150,
    text: 'A disgraced acolyte keeps a minor shard on the Pilgrim Road, convinced it still speaks to him. It is your first claim. He will not give it up gently.' },
  { id: 2, icon: 'ghost', name: 'The Barrow-Wife', title: 'Keeper of the Low Cairns', banners: ['hollow'], level: 1, life: 20, quality: 0, reward: 150,
    text: 'In the cairn-fields the dead sleep lightly. The Barrow-Wife sings them awake whenever the living come digging for shards.' },
  { id: 3, icon: 'axe', name: 'Skarn Emberjaw', title: 'Raid-Chief of the Red Pass', banners: ['forge'], level: 2, life: 20, quality: 0, reward: 200,
    text: 'Skarn\'s raiders burn every caravan that crosses the Red Pass. He wants your shard for the Forge. He wants your skull for his drum.' },
  { id: 4, icon: 'bow', name: 'Warden Lirael', title: 'Voice of the Silverglade', banners: ['eld'], level: 2, life: 18, quality: 1, reward: 200,
    text: 'The Silverglade is closed to outsiders. Lirael has turned back armies with a word and a wall of thorns. She will not be moved by one Warden.' },
  { id: 5, icon: 'eye', name: 'Inquisitor-General Varn', title: 'Hand of the Descent', banners: ['auric', 'unbound'], level: 2, life: 20, quality: 1, reward: 250, pack: true,
    text: 'The Dominion has declared every free shard-bearer a heretic. Varn has come down from the void-ships personally to collect yours.' },
  { id: 6, icon: 'tree', name: 'The Rotwood Choir', title: 'Where the Forest Died', banners: ['hollow', 'eld'], level: 3, life: 22, quality: 1, reward: 300,
    text: 'A grove of the Eld fell to the Host and kept singing. Its trees are bone now, and its song draws the dead from miles around.' },
  { id: 7, icon: 'hammer', name: 'Grukk Ironmaw', title: 'Forgelord of the Clans', banners: ['forge', 'unbound'], level: 3, life: 22, quality: 2, reward: 300, pack: true, include: ['f16'],
    text: 'The Forgelord has heard a lone Warden is gathering shards. He has decided this is a challenge, and he has never once lost a challenge.' },
  { id: 8, icon: 'crown', name: 'Morvain', title: 'The Hollow King', banners: ['hollow', 'forge'], level: 3, life: 26, quality: 2, reward: 500, mythic: true, include: ['h16'],
    text: 'At the heart of the Sunderfall crater the Hollow King waits on a throne of shards. He was the first to die when the star fell. Every shard you carry, he can feel.' }
];

var SKIRMISH_LEVELS = [
  { level: 1, name: 'Squire',  quality: 0, reward: 60,  life: 20, desc: 'A forgiving opponent. Good for testing a new deck.' },
  { level: 2, name: 'Knight',  quality: 1, reward: 90,  life: 20, desc: 'Trades well, blocks sensibly, punishes open boards.' },
  { level: 3, name: 'Warlord', quality: 2, reward: 130, life: 22, desc: 'Plays to win: lethal checks, careful attacks, stronger decks.' }
];
var SKIRMISH_NAMES = {
  auric: ['Sister Maelis, Lantern-Bearer', 'Castellan Dorne', 'Vicar Aldous Vane'],
  eld: ['Thessaly of the Hollow Oak', 'Ranger Caedric', 'The Briar Warden'],
  hollow: ['Lady Ossuary', 'The Mourning Knight', 'Grave-Cantor Ulm'],
  forge: ['Bruga Ashfist', 'Thane Kolvar Deepanvil', 'Snagga the Loud'],
  unbound: ['Corsa the Rift-Runner', 'The Faceless Broker', 'Old Iron Hask']
};
