kaboom({
  global: true,
  fullscreen: true,
  clearColor: [0.52, 0.8, 0.92, 1],
  debug: true,
  scale: 2,
});

loadRoot("./sprites/");
loadSprite("mario", "mario.png");
loadSprite("spongebob", "spongebob.png");
loadSprite("block", "block.png");
loadSprite("coin", "coin.png");
loadSprite("surprise", "surprise.png");
loadSprite("unboxed", "unboxed.png");
loadSprite("pipe", "pipe_up.png");
loadSprite("quandale", "quandale.jpg");
loadSprite("mushroom", "mushroom.png");
loadSprite("castle", "castle.png");
loadSprite("dino", "dino.png");
loadSprite("mount", "mountbg.png");
loadSprite("flag", "flag.png");

loadSound("gamesound", "gamesound.mp3");
loadSound("jumpsound", "jumpsound.mp3");
loadSound("deathsound", "deathsound.mp3");
loadSound("villandie", "villanDie.mp3");
loadSound("coinsound", "coinsound.mp3");
loadSound("gamestart", "quandaledingle.mp3");
loadSound("voiceover1", "voiceover1.wav");
loadSound("voiceover2", "voiceover2.wav");

scene("gameover", (score) => {
  add([
    text(
      "Game over, you lose. \n Press 'Enter' to continue. \n Your score:" +
        score,
      20
    ),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  keyPress("enter", () => {
    go("game");
  });
});

scene("win", (score) => {
  add([
    text(
      "Congrats, you have won\n Press 'enter' to play the next level \n Your score: " +
        score,
      20
    ),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  keyPress("enter", () => {
    go("lvl2");
  });
});

scene("start", () => {
  add([
    text("Super Quandale\n\n Press 'enter' to start playing", 20),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  const startmusic = play("gamestart");
  keyPress("enter", () => {
    startmusic.pause("gamestart");
    go("game");
  });
});

scene("game", () => {
  const music = play("gamesound");
  layers(["bg", "obj", "ui"], "obj");
  const symbolMap = {
    width: 20,
    height: 20,

    "=": [sprite("block"), solid()],
    q: [sprite("quandale")],
    "?": [sprite("surprise"), solid(), "surprise-coin"],
    "!": [sprite("surprise"), solid(), "surprise-mushroom"],
    v: [sprite("spongebob"), solid(), "villan", body()],
    $: [sprite("coin"), "money"],
    M: [sprite("mushroom"), "buff", solid(), body()],
    u: [sprite("unboxed"), solid()],
    p: [sprite("pipe"), solid()],
    c: [sprite("castle"), "endPlace", solid()],
    d: [sprite("dino"), "prin", solid()],
    b: [sprite("mount")],
    f: [sprite("flag"), solid(), "end"],
  };
  const map = [
    "                                                                                                           ",
    "                                                                                                           ",
    "                                                                                                           ",
    "                                                                                                           ",
    "                                                                                                           ",
    "                                                                                                           ",
    "                             v      ===!===                                                                ",
    "                        ==!====                                                                            ",
    "                v                           ======                                                         ",
    "                ===                                                                             d   f      ",
    "             ==?                  =?=!=                                                       c            ",
    "                                                    ===?=====!====                                         ",
    "                                                p                                                          ",
    "                     v        v            v                                                               ",
    "============================================   ============================================================",
    "============================================   ============================================================",
    "============================================   ============================================================",
  ];
  const gamelevel = addLevel(map, symbolMap);
  const jumpforce = 10;
  const falldown = 500;

  const player = add([
    sprite("quandale"),
    solid(),
    pos(30, 0),
    body(),
    origin("bot"),
    big(jumpforce),
  ]);

  let score = 0;
  const scoretxt = add([
    layer("ui"),
    text("Score:" + score, 15),
    origin("left"),
    { value: score },
    pos(player.pos.x, player.pos.y + 75),
  ]);

  let primo = 0;
  const primotxt = add([
    layer("ui"),
    text("Primogems:" + primo, 15),
    origin("left"),
    { value: primo },
    pos(player.pos.x + 200, player.pos.y + 75),
  ]);

  let speed = 120;
  let isJumping = false;

  keyDown("a", () => {
    if (player.pos.x > 0) {
      player.move(-speed, 0);
    }
  });
  keyDown("d", () => {
    player.move(speed, 0);
  });
  keyPress("w", () => {
    if (player.grounded()) {
      player.jump(0, jumpforce);
      play("jumpsound");
      isJumping = true;
    }
  });

  player.on("headbump", (obj) => {
    if (obj.is("surprise-coin")) {
      gamelevel.spawn("$", obj.gridPos.sub(0, 1));
      destroy(obj);
      gamelevel.spawn("u", obj.gridPos.sub(0, 0));
    }
  });
  player.on("headbump", (obj) => {
    if (obj.is("surprise-mushroom")) {
      gamelevel.spawn("M", obj.gridPos.sub(0, 1));
      destroy(obj);
      gamelevel.spawn("u", obj.gridPos.sub(0, 0));
    }
  });
  action("buff", (obj) => {
    obj.move(20, 0);
  });
  player.collides("money", (x) => {
    destroy(x);
    play("coinsound");
    scoretxt.value += 100;
    scoretxt.text = "Score:" + scoretxt.value;
  });
  player.collides("buff", (x) => {
    destroy(x);
    player.biggify(6);
    scoretxt.value += 1000;
    scoretxt.text = "Score:" + scoretxt.value;
  });
  player.collides("villan", (x) => {
    if (isJumping == true) {
      destroy(x);
      play("villandie");
      scoretxt.value += 200;
      scoretxt.text = "Score:" + scoretxt.value;
    } else {
      go("gameover", scoretxt.value);
      destroy(player);
    }

    player.collides("endPlace", (x) => {
      add([
        text("Come help me Quandale, im stuck in the castle."),
        origin("center"),
        pos(x.pos.x, x.pos.y - 80),
      ]);
      play("voiceover1");
    });

    player.collides("prin", (x) => {
      add([
        text("Thank you quandale, now I shall reward u with 1,600 primogems."),
        origin("center"),
        pos(x.pos.x, x.pos.y - 80),
      ]);
      play("voiceover2");
      primotxt.value += 1600;
      primotxt.text = "Primogems:" + primotxt.value;
    });

    player.collides("end", (x) => {
      go("win", scoretxt.value);
    });

    music.pause("gamesound");
    play("deathsound");
  });

  player.action(() => {
    camPos(player.pos.x, 200);
    scoretxt.pos.x = player.pos.x - 300;
    primotxt.pos.x = player.pos.x - 50;
    if (player.grounded()) {
      isJumping = false;
    } else {
      isJumping = true;
    }
    if (player.pos.y > falldown) {
      destroy(player);
      music.pause("gamesound");
      play("deathsound");
      go("gameover", scoretxt.value);
    }
  });
});

scene("lvl2", () => {
  const music = play("gamesound");
  layers(["bg", "obj", "ui"], "obj");
  const symbolMap = {
    width: 20,
    height: 20,

    "=": [sprite("block"), solid()],
    q: [sprite("quandale")],
    "?": [sprite("surprise"), solid(), "surprise-coin"],
    "!": [sprite("surprise"), solid(), "surprise-mushroom"],
    v: [sprite("spongebob"), solid(), "villan", body()],
    $: [sprite("coin"), "money"],
    M: [sprite("mushroom"), "buff", solid(), body()],
    u: [sprite("unboxed"), solid()],
    p: [sprite("pipe"), solid()],
    c: [sprite("castle"), "endPlace", solid()],
    d: [sprite("dino"), "prin", solid()],
    b: [sprite("mount")],
    f: [sprite("flag"), solid(), "end"],
  };

  const map = [
    "                                                                                                           ",
    "                                                                                                           ",
    "                                                                                                           ",
    "                                                                                                           ",
    "                                                                                                           ",
    "                                     v                                                                     ",
    "                                    ===!===                        p                                       ",
    "                                            v                    ====                                      ",
    "                v                      p   ====?=           v            v                                 ",
    "                ===                 v                      ==?=         ==!===                    d    f  ",
    "                                  =!=?===            v                                           c         ",
    "                v                                   ===!===                         ==?=                   ",
    "            ==?==                                                               p                          ",
    "                     v           v               v                                                         ",
    "============================================   ============================================================",
    "============================================   ============================================================",
    "============================================   ============================================================",
  ];
  const gamelevel = addLevel(map, symbolMap);
  const jumpforce = 10;
  const falldown = 500;

  const player = add([
    sprite("quandale"),
    solid(),
    pos(30, 0),
    body(),
    origin("bot"),
    big(jumpforce),
  ]);

  let score = 0;
  const scoretxt = add([
    layer("ui"),
    text("Score:" + score, 15),
    origin("left"),
    { value: score },
    pos(player.pos.x, player.pos.y + 75),
  ]);

  let primo = 0;
  const primotxt = add([
    layer("ui"),
    text("Primogems:" + primo, 15),
    origin("left"),
    { value: primo },
    pos(player.pos.x + 200, player.pos.y + 75),
  ]);

  let speed = 120;
  let isJumping = false;

  keyDown("a", () => {
    if (player.pos.x > 0) {
      player.move(-speed, 0);
    }
  });
  keyDown("d", () => {
    player.move(speed, 0);
  });
  keyPress("w", () => {
    if (player.grounded()) {
      player.jump(0, jumpforce);
      play("jumpsound");
      isJumping = true;
    }
  });

  player.on("headbump", (obj) => {
    if (obj.is("surprise-coin")) {
      gamelevel.spawn("$", obj.gridPos.sub(0, 1));
      destroy(obj);
      gamelevel.spawn("u", obj.gridPos.sub(0, 0));
    }
  });
  player.on("headbump", (obj) => {
    if (obj.is("surprise-mushroom")) {
      gamelevel.spawn("M", obj.gridPos.sub(0, 1));
      destroy(obj);
      gamelevel.spawn("u", obj.gridPos.sub(0, 0));
    }
  });
  action("buff", (obj) => {
    obj.move(20, 0);
  });
  player.collides("money", (x) => {
    destroy(x);
    play("coinsound");
    scoretxt.value += 100;
    scoretxt.text = "Score:" + scoretxt.value;
  });
  player.collides("buff", (x) => {
    destroy(x);
    player.biggify(6);
    scoretxt.value += 1000;
    scoretxt.text = "Score:" + scoretxt.value;
  });
  player.collides("villan", (x) => {
    if (isJumping == true) {
      destroy(x);
      play("villandie");
      scoretxt.value += 200;
      scoretxt.text = "Score:" + scoretxt.value;
    } else {
      go("gameover", scoretxt.value);
      destroy(player);
    }

    player.collides("endPlace", (x) => {
      add([
        text("Come help me Quandale, im stuck in the castle."),
        origin("center"),
        pos(x.pos.x, x.pos.y - 80),
      ]);
      play("voiceover1");
    });

    player.collides("prin", (x) => {
      add([
        text("Thank you quandale, now I shall reward u with 1,600 primogems."),
        origin("center"),
        pos(x.pos.x, x.pos.y - 80),
      ]);
      play("voiceover2");
      primotxt.value += 1600;
      primotxt.text = "Primogems:" + primotxt.value;
    });

    player.collides("end", (x) => {
      go("win", scoretxt.value);
    });

    music.pause("gamesound");
    play("deathsound");
  });
  player.action(() => {
    camPos(player.pos.x, 200);
    scoretxt.pos.x = player.pos.x - 300;
    primotxt.pos.x = player.pos.x - 50;
    if (player.grounded()) {
      isJumping = false;
    } else {
      isJumping = true;
    }
    if (player.pos.y > falldown) {
      destroy(player);
      music.pause("gamesound");
      play("deathsound");
      go("gameover", scoretxt.value);
    }
  });
});

start("start");
