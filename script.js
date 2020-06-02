let main = document.querySelector(".main"),
  bestHTML = document.querySelector(".best_score_counter"),
  scoreHTML = document.querySelector(".score_counter"),
  reset = document.querySelector(".reset"),
  touchstartX = 0,
  touchstartY = 0,
  touchendX = 0,
  touchendY = 0,
  move = true,
  score = 0,
  best = localStorage.getItem("best"),
  playField = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

function color(cell) {
  switch (cell) {
    case 2:
      return "#E8DFD5";
    case 4:
      return "#EBE0CB";
    case 8:
      return "#E9B381";
    case 16:
      return "#E9996C";
    case 32:
      return "#D97A60";
    case 64:
      return "#F65E3B";
    case 128:
      return "#EDCF72";
    case 256:
      return "#EDCC61";
    case 512:
      return "#EDC850";
    case 1024:
      return "#EDC53F";
    case 2048:
      return "#EDC22E";
    case 4096:
      return "#F36774";
    case 8192:
      return "#F14B61";
  }
}
function createField() {
  playField[~~(Math.random() * 4)][~~(Math.random() * 4)] =
    ~~(Math.random() * 10) >= 1 ? 2 : 4;
}
createField();
createField();
function draw() {
  mainInnerHtml = "";
  for (let i = 0; i < playField.length; i++) {
    for (let k = 0; k < playField[i].length; k++) {
      if (playField[i][k] === 0) {
        mainInnerHtml += `<div class='cell'></div>`;
      } else {
        if (playField[i][k] !== 2 && playField[i][k] !== 4) {
          mainInnerHtml += `<div class='cell' style="background-color:${color(
            playField[i][k]
          )}; color:#F9F6F2">${playField[i][k]}</div>`;
        } else {
          mainInnerHtml += `<div class='cell' style="background-color:${color(
            playField[i][k]
          )}">${playField[i][k]}</div>`;
        }
      }
    }
  }
  main.innerHTML = mainInnerHtml;
  scoreHTML.innerHTML = score;
  bestHTML.innerHTML = localStorage.getItem("best")
    ? localStorage.getItem("best")
    : 0;
}

main.addEventListener("touchstart", function (e) {
  touchstartX = e.changedTouches[0].pageX;
  touchstartY = e.changedTouches[0].pageY;
});

main.addEventListener("touchend", function (e) {
  touchendX = e.changedTouches[0].pageX;
  touchendY = e.changedTouches[0].pageY;

  touchMove();
});

function touchMove() {
  canCreate = false;
  if (move) {
    if (
      (touchstartY > touchendY &&
        touchendX <= touchstartX &&
        touchstartY - touchendY > touchstartX - touchendX) ||
      (touchstartY > touchendY &&
        touchendX >= touchstartX &&
        touchstartY - touchendY > touchendX - touchstartX)
    ) {
      for (let i = playField.length - 1; i >= 1; i--) {
        for (let k = 0; k < playField[i].length; k++) {
          if (
            (playField[i][k] !== 0 && playField[i - 1][k] == 0) ||
            (playField[i][k] == playField[i - 1][k] && playField[i][k] !== 0)
          ) {
            canCreate = true;
            i = 1;
            break;
          }
        }
      }
      moveUp();
      uniteUp();
      moveUp();
    } else if (
      (touchstartY < touchendY &&
        touchendX <= touchstartX &&
        touchendY - touchstartY > touchstartX - touchendX) ||
      (touchstartY < touchendY &&
        touchendX >= touchstartX &&
        touchendY - touchstartY > touchendX - touchstartX)
    ) {
      for (let i = 0; i < playField.length - 2; i++) {
        for (let k = 0; k < playField[i].length; k++) {
          if (
            (playField[i][k] !== 0 && playField[i + 1][k] == 0) ||
            (playField[i][k] == playField[i + 1][k] && playField[i][k] !== 0)
          ) {
            canCreate = true;
            i = 3;
            break;
          }
        }
      }
      moveDown();
      uniteDown();
      moveDown();
    } else if (
      (touchstartX < touchendX &&
        touchendY < touchstartY &&
        touchendX - touchstartX >= touchstartY - touchendY) ||
      (touchstartX < touchendX &&
        touchendY >= touchstartY &&
        touchendX - touchstartX > touchendY - touchstartY)
    ) {
      for (let i = 0; i < playField.length; i++) {
        for (let k = 0; k < playField[i].length - 1; k++) {
          if (
            (playField[i][k] !== 0 && playField[i][k + 1] == 0) ||
            (playField[i][k] == playField[i][k + 1] && playField[i][k] !== 0)
          ) {
            canCreate = true;
            i = 3;
            break;
          }
        }
      }
      moveRight();
      uniteRight();
      moveRight();
    } else if (
      (touchstartX > touchendX &&
        touchendY <= touchstartY &&
        touchstartX - touchendX > touchstartY - touchendY) ||
      (touchstartX > touchendX &&
        touchendY >= touchstartY &&
        touchstartX - touchendX > touchendY - touchstartY)
    ) {
      for (let i = 0; i < playField.length; i++) {
        for (let k = playField[i].length - 1; k >= 1; k--) {
          if (
            (playField[i][k] !== 0 && playField[i][k - 1] == 0) ||
            (playField[i][k] == playField[i][k - 1] && playField[i][k] !== 0)
          ) {
            canCreate = true;
            i = 3;
            break;
          }
        }
      }
      moveLeft();
      uniteLeft();
      moveLeft();
    }
  }
  canCreate ? createCellActive() : null;
  isFinish();
  if (score >= best) {
    localStorage.setItem("best", score);
  }
  draw();
}

document.onkeydown = function (e) {
  canCreate = false;
  if (move) {
    if (e.keyCode === 37 || e.keyCode === 65) {
      for (let i = 0; i < playField.length; i++) {
        for (let k = playField[i].length - 1; k >= 1; k--) {
          if (
            (playField[i][k] !== 0 && playField[i][k - 1] == 0) ||
            (playField[i][k] == playField[i][k - 1] && playField[i][k] !== 0)
          ) {
            canCreate = true;
            i = 3;
            break;
          }
        }
      }
      moveLeft();
      uniteLeft();
      moveLeft();
    } else if (e.keyCode === 39 || e.keyCode === 68) {
      for (let i = 0; i < playField.length; i++) {
        for (let k = 0; k < playField[i].length - 1; k++) {
          if (
            (playField[i][k] !== 0 && playField[i][k + 1] == 0) ||
            (playField[i][k] == playField[i][k + 1] && playField[i][k] !== 0)
          ) {
            canCreate = true;
            i = 3;
            break;
          }
        }
      }
      moveRight();
      uniteRight();
      moveRight();
    } else if (e.keyCode === 38 || e.keyCode === 87) {
      for (let i = playField.length - 1; i >= 1; i--) {
        for (let k = 0; k < playField[i].length; k++) {
          if (
            (playField[i][k] !== 0 && playField[i - 1][k] == 0) ||
            (playField[i][k] == playField[i - 1][k] && playField[i][k] !== 0)
          ) {
            canCreate = true;
            i = 1;
            break;
          }
        }
      }
      moveUp();
      uniteUp();
      moveUp();
    } else if (e.keyCode === 40 || e.keyCode === 83) {
      for (let i = 0; i < playField.length - 2; i++) {
        for (let k = 0; k < playField[i].length; k++) {
          if (
            (playField[i][k] !== 0 && playField[i + 1][k] == 0) ||
            (playField[i][k] == playField[i + 1][k] && playField[i][k] !== 0)
          ) {
            canCreate = true;
            i = 3;
            break;
          }
        }
      }
      moveDown();
      uniteDown();
      moveDown();
    }
  }
  canCreate ? createCellActive() : null;
  isFinish();
  if (score >= best) {
    localStorage.setItem("best", score);
  }
  draw();
};
reset.onclick = function reset() {
  playField = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  createField();
  createField();
  draw();
};
function isFinish() {
  counter = 0;
  for (let i = 0; i < playField.length - 1; i++) {
    for (let k = 0; k < playField[i].length; k++) {
      if (playField[i][k] == playField[i + 1][k] && playField[i][k] !== 0) {
        return;
      }
    }
  }
  for (let i = 0; i < playField.length; i++) {
    for (let k = 0; k < playField[i].length - 1; k++) {
      if (playField[i][k] == playField[i][k + 1] && playField[i][k] !== 0) {
        return;
      }
    }
  }
  for (let i = 0; i < playField.length; i++) {
    for (let k = 0; k < playField[i].length; k++) {
      if (playField[i][k] == 0) {
        counter++;
      }
    }
  }
  if (counter == 0) {
    main.style.opacity = ".4";
    move = false;
  }
}
function uniteLeft() {
  for (let i = 0; i < playField.length; i++) {
    for (let k = 0; k < playField[i].length; k++) {
      if (playField[i][k] === playField[i][k + 1]) {
        playField[i][k] *= 2;
        score += playField[i][k];
        playField[i][k + 1] = 0;
      }
    }
  }
}
function moveLeft() {
  for (let i = 0; i < playField.length; i++) {
    for (let k = playField[i].length - 1; k >= 0; k--) {
      if (playField[i][k] === 0) {
        playField[i].splice(k, 1);
        playField[i].push(0);
      }
    }
  }
}
function uniteRight() {
  for (let i = 0; i < playField.length; i++) {
    for (let k = playField[i].length - 1; k >= 0; k--) {
      if (playField[i][k] === playField[i][k - 1]) {
        playField[i][k] *= 2;
        score += playField[i][k];
        playField[i][k - 1] = 0;
      }
    }
  }
}
function moveRight() {
  for (let i = 0; i < playField.length; i++) {
    for (let k = 0; k < playField[i].length; k++) {
      if (playField[i][k] === 0) {
        playField[i].splice(k, 1);
        playField[i].unshift(0);
      }
    }
  }
}
function uniteUp() {
  for (i = 0; i < playField.length - 1; i++) {
    for (k = 0; k < playField.length; k++) {
      if (playField[i][k] === playField[i + 1][k]) {
        playField[i][k] *= 2;
        score += playField[i][k];
        playField[i + 1][k] = 0;
      }
    }
  }
}
function moveUp() {
  for (j = 0; j < playField.length; j++) {
    for (i = 0; i < playField.length - 1; i++) {
      for (k = 0; k < playField.length; k++) {
        if (playField[i][k] === 0) {
          playField[i][k] = playField[i + 1][k];
          playField[i + 1][k] = 0;
        }
      }
    }
  }
}
function uniteDown() {
  for (i = playField.length - 1; i > 0; i--) {
    for (k = 0; k < playField.length; k++) {
      if (playField[i][k] === playField[i - 1][k]) {
        playField[i][k] *= 2;
        score += playField[i][k];
        playField[i - 1][k] = 0;
      }
    }
  }
}
function moveDown() {
  for (j = playField.length; j > 0; j--) {
    for (i = playField.length - 1; i > 0; i--) {
      for (k = 0; k < playField.length; k++) {
        if (playField[i][k] === 0) {
          playField[i][k] = playField[i - 1][k];
          playField[i - 1][k] = 0;
        }
      }
    }
  }
}
function createCellActive() {
  while (true) {
    let row = Math.floor(Math.random() * 4);
    let col = Math.floor(Math.random() * 4);
    if (playField[row][col] === 0) {
      playField[row][col] = 2 * Math.ceil(Math.random() * 2);
      return;
    }
  }
}
draw();
